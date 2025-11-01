
from __future__ import annotations

import json
import os
import re
import subprocess
from pathlib import Path
from typing import Any, Dict, List, Literal, Optional, Tuple

from dotenv import load_dotenv
from fastapi import Body, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# ----------------------------
# Env & OpenAI client
# ----------------------------
load_dotenv()
try:
    from openai import OpenAI
    _openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
except Exception as _e:
    _openai_client = None  # server can still run without OpenAI configured

# ----------------------------
# FastAPI app & CORS
# ----------------------------
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("CORS_ALLOW_ORIGIN", "*")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------
# Models (Plan schema + Tool calls)
# ----------------------------

class Hotkey(BaseModel):
    combo: str
    scope: Optional[Literal["global", "app"]] = "global"
    appBundleId: Optional[str] = None

class Step(BaseModel):
    type: Literal[
        "focus_app",
        "keystroke",
        "open",
        "paste_text",
        "run_shortcut",
        "run_tool",
        "set_clipboard",
        "paste_clipboard",
        "notify",
        "save_file",
        "sleep_ms",
        "type_text",
    ]
    # optional fields (used depending on type)
    bundle: Optional[str] = None          # focus_app
    keys: Optional[str] = None            # keystroke (e.g., "cmd+shift+a" or "enter")
    target: Optional[str] = None          # open (url or path)
    text: Optional[str] = None            # paste_text / set_clipboard / type_text
    name: Optional[str] = None            # run_shortcut / run_tool (tool name)
    args: Optional[Dict[str, Any]] = None # run_tool args
    title: Optional[str] = None           # notify
    body: Optional[str] = None            # notify
    path: Optional[str] = None            # save_file
    content: Optional[str] = None         # save_file
    ms: Optional[int] = None              # sleep_ms

class Plan(BaseModel):
    hotkey: Hotkey
    steps: List[Step]
    notes: Optional[str] = None

# ----------------------------
# Capabilities registry (backend tools)
# ----------------------------

class ToolDef(BaseModel):
    name: str
    description: str
    # minimal arg doc; for production you can add jsonschema here
    args_hint: Dict[str, str] = Field(default_factory=dict)

TOOLS_REGISTRY: Dict[str, ToolDef] = {
    "text.rewrite": ToolDef(
        name="text.rewrite",
        description="Rewrite input text according to a style/tone.",
        args_hint={"tone": "e.g., professional, friendly, concise", "lang": "ISO code, optional"},
    ),
    "text.summarize": ToolDef(
        name="text.summarize",
        description="Summarize input text; optional max_words.",
        args_hint={"max_words": "int, optional"},
    ),
    "shortcut.run": ToolDef(
        name="shortcut.run",
        description="Run an Apple Shortcut by name. args: {name}",
        args_hint={"name": "Apple Shortcut name"},
    ),
    # stubs you can fill later:
    "slack.post": ToolDef(
        name="slack.post",
        description="Post a message to Slack (stub).",
        args_hint={"channel": "string", "text": "string"},
    ),
}

# ----------------------------
# Helpers: Hammerspoon compilation & reload
# ----------------------------

HAM_FILE = Path.home() / ".hammerspoon" / "agentic.lua"
HS_CLI = os.getenv("HS_CLI", "hs")  # allow overriding the CLI path

def _split_combo(combo: str):
    parts = combo.lower().split("+")
    key = parts.pop()
    if key == "enter":
        key = "return"  # Hammerspoon uses "return"
    norm = {"option":"alt","alt":"alt","cmd":"cmd","command":"cmd","control":"ctrl","ctrl":"ctrl","shift":"shift"}
    mods = [norm.get(p, p) for p in parts]
    return mods, key

def _lua_arr(xs: List[str]) -> str:
    return "{" + ", ".join(f'"{x}"' for x in xs) + "}"

def _lua_str(s: str) -> str:
    return '"' + s.replace("\\", "\\\\").replace('"', '\"') + '"'

def _emit_step_lua(s: Step) -> str:
    # Map each step to Lua (synchronous where possible to keep plan order)
    if s.type == "focus_app" and s.bundle:
        return f'hs.application.launchOrFocusByBundleID({_lua_str(s.bundle)})'
    if s.type == "keystroke" and s.keys:
        mods, key = _split_combo(s.keys)
        return f'hs.eventtap.keyStroke({_lua_arr(mods)}, "{key}", 0)'
    if s.type == "open" and s.target:
        return f"hs.execute('/usr/bin/open ' .. {_lua_str(s.target)}, true)"
    if s.type == "paste_text" and s.text is not None:
        return f'hs.pasteboard.setContents({_lua_str(s.text)}); hs.eventtap.keyStroke({{"cmd"}}, "v", 0)'
    if s.type == "run_shortcut" and s.name:
        return f"hs.execute('/usr/bin/shortcuts run ' .. {_lua_str(s.name)}, true)"
    if s.type == "set_clipboard" and s.text is not None:
        return f'hs.pasteboard.setContents({_lua_str(s.text)})'
    if s.type == "paste_clipboard":
        return 'hs.eventtap.keyStroke({"cmd"}, "v", 0)'
    if s.type == "notify":
        title = _lua_str(s.title or "Stroke.ai")
        body = _lua_str(s.body or "")
        return f'hs.notify.new({{title={title}, informativeText={body}}}):send()'
    if s.type == "save_file" and s.path is not None:
        content = _lua_str(s.content or "")
        return f'local f=io.open({_lua_str(s.path)}, "w"); if f then f:write({content}); f:close() end'
    if s.type == "sleep_ms" and s.ms is not None:
        return f'hs.timer.usleep({s.ms} * 1000)'

    if s.type == "type_text" and s.text is not None:
        return f'hs.eventtap.keyStrokes({_lua_str(s.text)})'


    # run_tool: synchronous HTTP POST to your FastAPI server
    if s.type == "run_tool" and s.name:
        payload = {
            "name": s.name,
            "args": s.args or {},
            # clipboard is often useful; fetch on the Lua side just before call
            # We'll embed a placeholder; Lua will substitute the current clipboard at runtime.
        }
        payload_json = _lua_str(json.dumps(payload))
        # Build final payload in Lua so clipboard is fresh
        return (
            'do '
            'local clip = hs.pasteboard.getContents() or "" '
            f'local base = {payload_json} '
            'base["clipboard"] = clip '
            'local url = "http://127.0.0.1:8000/api/run-tool" '
            'local headers = { ["Content-Type"] = "application/json" } '
            'local body = hs.json.encode(base) '
            'local status, resp, _ = hs.http.post(url, body, headers) '
            'if status == 200 then '
            '  local ok, parsed = pcall(hs.json.decode, resp) '
            '  if ok and parsed and parsed.result then '
            '    hs.pasteboard.setContents(parsed.result) '
            '  else hs.alert.show("Tool error: bad JSON") end '
            'else hs.alert.show("Tool HTTP "..tostring(status)) end '
            'end'
        )

    return f'-- unsupported or missing fields for step: {json.dumps(s.model_dump())}'

def compile_lua_block(plan: Plan) -> str:
    mods, key = _split_combo(plan.hotkey.combo)
    gate = ""
    if plan.hotkey.scope == "app" and plan.hotkey.appBundleId:
        gate = f'if hs.application.frontmostApplication():bundleID() ~= {_lua_str(plan.hotkey.appBundleId)} then return end'
    body = "\n  ".join(_emit_step_lua(s) for s in plan.steps)
    block = f"""
-- BEGIN GENERATED {plan.hotkey.combo}
hs.hotkey.bind({_lua_arr(mods)}, "{key}", function()
  {gate}
  {body}
end)
-- END GENERATED {plan.hotkey.combo}
""".strip("\n")
    return block

def upsert_block(block_id: str, block: str) -> None:
    HAM_FILE.parent.mkdir(parents=True, exist_ok=True)
    content = HAM_FILE.read_text(encoding="utf-8") if HAM_FILE.exists() else ""
    pattern = re.compile(
        rf"-- BEGIN GENERATED {re.escape(block_id)}[\s\S]*?-- END GENERATED {re.escape(block_id)}",
        re.M,
    )
    if pattern.search(content):
        content = pattern.sub(block, content)
    else:
        if content and not content.endswith("\n"):
            content += "\n"
        content += block + "\n"
    HAM_FILE.write_text(content, encoding="utf-8")

def reload_hammerspoon() -> None:
    try:
        subprocess.run([HS_CLI, "-c", "hs.reload()"], check=True, timeout=5)
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="Hammerspoon CLI not found. Set HS_CLI env or install CLI.")
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Hammerspoon reload failed: {e}")

# ----------------------------
# OpenAI planner (text -> Plan)
# ----------------------------

SYSTEM_PROMPT = """
You convert natural language into a deterministic desktop automation plan for macOS.

Return ONLY a single JSON object with this schema:

{
  "hotkey": { "combo": "string like 'alt+shift+m'", "scope": "global|app", "appBundleId": "optional string" },
  "steps": [
    { "type": "focus_app", "bundle": "bundle id" } |
    { "type": "open", "target": "url or absolute path" } |
    { "type": "keystroke", "keys": "cmd+shift+a" } |
    { "type": "paste_text", "text": "string" } |
    { "type": "set_clipboard", "text": "string" } |
    { "type": "paste_clipboard" } |
    { "type": "run_shortcut", "name": "Apple Shortcuts name" } |
    { "type": "sleep_ms", "ms":  integer milliseconds } |
    { "type": "notify", "title": "string", "body": "string" } |
    { "type": "run_tool", "name": "tool name", "args": { "k": "v" } }
  ],
  "notes": "optional string"
}

General rules:
- Output MUST be valid JSON only (no prose). One object, no trailing text.
- Normalize modifiers to: cmd, ctrl, alt, shift (lowercase). Key is a single character or a well-known named key.
- If the user specifies a hotkey, use it; otherwise default to "alt+shift+k".
- If the user says “only in {app}”, set scope:"app" and appBundleId to the known bundle id (e.g., Zoom "us.zoom.xos", Slack "com.tinyspeck.slackmacgap", Safari "com.apple.Safari", Chrome "com.google.Chrome", VS Code "com.microsoft.VSCode").
- Insert small waits when a UI change precedes typing/pasting: use { "type":"sleep_ms", "ms": 120 } (or 150–300ms after opening/focusing an app).
- Never invent shell commands. Use only the step types listed.

CRITICAL BEHAVIOR FOR REWRITING/REWORDING:
- If the user asks to **rewrite, reword, polish, paraphrase, edit for tone, improve wording, make more professional, make clearer**, or similar:
  1) ALWAYS copy the user’s current selection,
  2) wait briefly,
  3) call a backend tool to perform the rewrite,
  4) wait briefly,
  5) paste the result in place.
- Emit this exact canonical sequence (adjust tone if requested):
[
  { "type": "keystroke", "keys": "cmd+c" },
  { "type": "sleep_ms", "ms": 120 },
  { "type": "run_tool", "name": "text.rewrite", "args": { "tone": "<inferred tone or 'professional'>" } },
  { "type": "sleep_ms", "ms": 120 },
  { "type": "paste_clipboard" }
]
- DO NOT ask the user to provide the text. Assume the selected text is available at hotkey time and will be copied via cmd+c.
- If a tone is mentioned (e.g., “professional”, “friendly”, “concise”), include it in args.tone. If multiple tones are given, choose the most specific.

Search & navigation (keep generic, not site-specific):
- Prefer deterministic search URLs when possible. For “open {site} and search for {query}”, emit a single open step to the site’s search URL with the encoded query (e.g., YouTube: https://www.youtube.com/results?search_query=<encoded>).
- If you are unsure of a site’s search URL, fall back to:
  [
    { "type":"focus_app","bundle":"com.google.Chrome" },   // or "com.apple.Safari"
    { "type":"open","target":"https://<site>" },
    { "type":"sleep_ms","ms":300 },
    { "type":"keystroke","keys":"cmd+l" },
    { "type":"paste_text","text":"https://<site>/search?q=<encoded query>" },
    { "type":"keystroke","keys":"enter" }
  ]

Output only the JSON object matching the schema. No explanations.
""".strip()

def planner_generate_plan(command: str) -> Dict[str, Any]:
    if not _openai_client:
        # Fallback: trivial plan
        return {
            "hotkey": {"combo": "alt+shift+k", "scope": "global"},
            "steps": [{"type": "notify", "title": "Planner offline", "body": command}],
        }
    sys = SYSTEM_PROMPT.replace("{TOOLS}", json.dumps([t for t in TOOLS_REGISTRY.keys()]))
    try:
        resp = _openai_client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-3.5-turbo"),
            temperature=0,
            max_tokens=500,
            messages=[
                {"role": "system", "content": sys},
                {"role": "user", "content": command},
            ],
        )
        content = (resp.choices[0].message.content or "").strip()
        # try to parse JSON
        return json.loads(content)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Planner error: {e}")

# ----------------------------
# Tool executors
# ----------------------------

class RunToolReq(BaseModel):
    name: str
    args: Dict[str, Any] = Field(default_factory=dict)
    clipboard: Optional[str] = None

class RunToolRes(BaseModel):
    result: str

def _exec_text_rewrite(args: Dict[str, Any], clipboard: Optional[str]) -> str:
    tone = args.get("tone", "professional")
    lang = args.get("lang", "en")
    text = args.get("text") or clipboard or ""
    if not text:
        return "[stroke.ai] No input text found."
    if not _openai_client:
        return f"[offline rewrite→{tone}] {text}"
    sys = "You rewrite the user's text exactly as asked. Only output the rewritten text. Keep formatting."
    user = f"Rewrite this text in a {tone} tone (lang={lang}):\n\n{text}"
    chat = _openai_client.chat.completions.create(
        model=os.getenv("OPENAI_MODEL_REWRITE", os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")),
        temperature=0,
        max_tokens=1200,
        messages=[{"role": "system", "content": sys}, {"role": "user", "content": user}],
    )
    return (chat.choices[0].message.content or "").strip()

def _exec_text_summarize(args: Dict[str, Any], clipboard: Optional[str]) -> str:
    max_words = int(args.get("max_words", 120))
    text = args.get("text") or clipboard or ""
    if not text:
        return "[stroke.ai] No input text to summarize."
    if not _openai_client:
        return f"[offline summary ≤{max_words}w] {text[:200]}..."
    sys = "You summarize text concisely. Only output the summary."
    user = f"Summarize in at most {max_words} words:\n\n{text}"
    chat = _openai_client.chat.completions.create(
        model=os.getenv("OPENAI_MODEL_SUMMARY", os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")),
        temperature=0,
        max_tokens=600,
        messages=[{"role": "system", "content": sys}, {"role": "user", "content": user}],
    )
    return (chat.choices[0].message.content or "").strip()

def _exec_shortcut_run(args: Dict[str, Any], clipboard: Optional[str]) -> str:
    name = args.get("name")
    if not name:
        return "[stroke.ai] Missing Apple Shortcut name."
    try:
        subprocess.run(["/usr/bin/shortcuts", "run", str(name)], check=True, timeout=15)
        return f"Ran Apple Shortcut: {name}"
    except Exception as e:
        return f"[stroke.ai] Shortcut run failed: {e}"

# Stub examples for future integrations
def _exec_slack_post(args: Dict[str, Any], clipboard: Optional[str]) -> str:
    channel = args.get("channel", "#general")
    text = args.get("text") or clipboard or "(empty)"
    # TODO: implement Slack API call
    return f"[stub] Would post to {channel}: {text[:120]}"

TOOLS_EXECUTORS = {
    "text.rewrite": _exec_text_rewrite,
    "text.summarize": _exec_text_summarize,
    "shortcut.run": _exec_shortcut_run,
    "slack.post": _exec_slack_post,
}

# ----------------------------
# Endpoints
# ----------------------------

@app.get("/")
def home():
    return {"status": "ok", "message": "stroke.ai backend running"}

class GenerateReq(BaseModel):
    command: str

@app.post("/api/generate-script")
def generate_script(payload: GenerateReq):
    command = (payload.command or "").strip()
    if not command:
        raise HTTPException(status_code=400, detail="Missing 'command'")
    plan = planner_generate_plan(command)
    # minimal validation
    if "hotkey" not in plan or "steps" not in plan:
        raise HTTPException(status_code=502, detail="Planner returned invalid plan")
    return {"status": "success", "plan": plan}

@app.post("/api/apply-plan")
def apply_plan(plan_payload: Dict[str, Any] = Body(...)):
    print(plan_payload)
    # Accept dict for flexibility; validate with Plan
    try:
        plan = Plan(**plan_payload)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Invalid plan: {e}")
    lua_block = compile_lua_block(plan)
    upsert_block(plan.hotkey.combo, lua_block)
    # try reload; user may not have CLI installed yet
    reload_hammerspoon()
    return {"status": "ok", "applied": True, "combo": plan.hotkey.combo}

@app.post("/api/run-tool", response_model=RunToolRes)
def run_tool(req: RunToolReq):
    name = req.name
    if name not in TOOLS_EXECUTORS:
        raise HTTPException(status_code=404, detail=f"Unknown tool '{name}'")
    try:
        result = TOOLS_EXECUTORS[name](req.args or {}, req.clipboard)
        return {"result": result}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Tool error: {e}")
