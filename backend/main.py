from __future__ import annotations

import json
import os
import re
import subprocess
from typing import Any, Dict, List, Literal, Optional, Tuple

from dotenv import load_dotenv
from fastapi import Body, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Optional deps for web parsing
PLAYWRIGHT_OK = False
try:
    from playwright.sync_api import sync_playwright  # type: ignore
    PLAYWRIGHT_OK = True
except Exception:
    PLAYWRIGHT_OK = False

REQS_OK = False
try:
    import requests  # type: ignore
    from bs4 import BeautifulSoup  # type: ignore
    REQS_OK = True
except Exception:
    REQS_OK = False

# -------- env & OpenAI --------
load_dotenv()
try:
    from openai import OpenAI
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
except Exception:
    client = None  # allow server to boot without OpenAI

# -------- tool manifest (capability-driven) --------
TOOL_MANIFEST = [
    {
        "name": "text.transform",
        "description": "Transform provided text (from args.text or clipboard): rewrite/summarize/translate/polish/expand/shorten.",
        "requires_context": ["clipboard"],
        "args": {
            "operation": "rewrite | summarize | translate | polish | expand | shorten",
            "tone": "(optional) professional, friendly, concise",
            "lang": "(optional) ISO code like en, fr, zh",
            "max_words": "(optional, for summarize)",
            "text": "(optional) override clipboard source"
        },
        "returns": { "result": "string (transformed text)" }
    },
    {
        "name": "text.compose",
        "description": "Generate new text from instructions (no input text required).",
        "requires_context": [],
        "args": {
            "instruction": "what to write; keep it short and explicit",
            "tone": "(optional) professional, friendly, playful, concise",
            "format": "(optional) e.g., bullets, sentence, paragraph",
            "length": "(optional) short | medium | long",
            "lang": "(optional) ISO code like en, fr, zh"
        },
        "returns": { "result": "string (newly composed text)" }
    },
    {
        "name": "web.parse_find",
        "description": "Open/fetch a page and locate a link or text that matches query terms; returns a URL or best snippet.",
        "requires_context": [],
        "args": {
            "url": "(preferred) absolute URL to parse, OR",
            "site": "(alternative) site key like 'twitter' or 'youtube' to construct a search URL",
            "query": "what to search for on the page or site"
        },
        "returns": { "result": "URL string if found, else a reasonable search URL, else empty string" }
    },
    {
        "name": "shortcut.run",
        "description": "Run an Apple Shortcut by name.",
        "requires_context": [],
        "args": { "name": "Shortcut name" },
        "returns": { "result": "string status" }
    }
]

# -------- app --------
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------- models --------
class GenerateContext(BaseModel):
    clipboard: Optional[str] = None

class GenerateReq(BaseModel):
    command: str
    context: Optional[GenerateContext] = None

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
        "set_clipboard",
        "paste_clipboard",
        "notify",
        "sleep_ms",
        "run_tool"
    ]
    bundle: Optional[str] = None
    keys: Optional[str] = None
    target: Optional[str] = None
    text: Optional[str] = None
    name: Optional[str] = None
    args: Optional[Dict[str, Any]] = None
    title: Optional[str] = None
    body: Optional[str] = None
    ms: Optional[int] = None

class Plan(BaseModel):
    hotkey: Hotkey
    steps: List[Step]
    notes: Optional[str] = None

# -------- Hammerspoon compile/write/reload --------
from pathlib import Path as _Path
HAM_FILE = _Path.home() / ".hammerspoon" / "agentic.lua"
HS_CLI = os.getenv("HS_CLI", "hs")

def _split_combo(combo: str) -> Tuple[List[str], str]:
    parts = combo.lower().split("+")
    key = parts.pop()
    if key == "enter":
        key = "return"
    norm = {"option":"alt","alt":"alt","cmd":"cmd","command":"cmd","control":"ctrl","ctrl":"ctrl","shift":"shift"}
    mods = [norm.get(p, p) for p in parts if p]
    return mods, key

def _lua_arr(xs: List[str]) -> str:
    return "{" + ", ".join(f'"{x}"' for x in xs) + "}"

def _lua_str(s: str) -> str:
    return '"' + s.replace("\\", "\\\\").replace('"', '\"') + '"'

def _lua_lit(v: Any) -> str:
    if isinstance(v, dict):
        parts = []
        for k, val in v.items():
            parts.append(f'{k} = {_lua_lit(val)}')
        return '{ ' + ', '.join(parts) + ' }'
    if isinstance(v, list):
        return '{ ' + ', '.join(_lua_lit(x) for x in v) + ' }'
    if isinstance(v, str):
        return _lua_str(v)
    if isinstance(v, bool):
        return 'true' if v else 'false'
    if v is None:
        return 'nil'
    return str(v)

def _emit_step_lua(s: Step) -> str:
    if s.type == "focus_app" and s.bundle:
        return f'hs.application.launchOrFocusByBundleID({_lua_str(s.bundle)})'
    if s.type == "keystroke" and s.keys:
        mods, key = _split_combo(s.keys)
        return f'hs.eventtap.keyStroke({_lua_arr(mods)}, "{key}", 0)'
    if s.type == "open" and s.target:
        tgt = s.target
        # Use URL opener for http(s), fall back to /usr/bin/open for file paths
        if isinstance(tgt, str) and (tgt.startswith("http://") or tgt.startswith("https://")):
            return f"hs.urlevent.openURL({_lua_str(tgt)})"
        return f"hs.execute('/usr/bin/open ' .. {_lua_str(tgt)}, true)"
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
    if s.type == "sleep_ms" and s.ms is not None:
        return f'hs.timer.usleep({s.ms} * 1000)'
    if s.type == "run_tool" and s.name:
        lua_base = f'{{ name = {_lua_str(s.name)}, args = {_lua_lit(s.args or {})} }}'
        return (
            'do '
            'local clip = hs.pasteboard.getContents() or "" '
            f'local base = {lua_base} '
            'base["clipboard"] = clip '
            'local url = "http://127.0.0.1:8000/api/run-tool" '
            'local headers = { ["Content-Type"] = "application/json" } '
            'local body = hs.json.encode(base) '
            'local status, resp = hs.http.post(url, body, headers) '
            'if status == 200 then '
            '  local ok, parsed = pcall(hs.json.decode, resp) '
            '  if ok and parsed and parsed.result then hs.pasteboard.setContents(parsed.result) end '
            'else hs.alert.show("Tool HTTP "..tostring(status)) end '
            'end'
        )
    return f'-- unsupported: {s.model_dump_json()}'

def compile_lua_block(plan: Plan) -> str:
    mods, key = _split_combo(plan.hotkey.combo)
    gate = ""
    if plan.hotkey.scope == "app" and plan.hotkey.appBundleId:
        gate = f'if hs.application.frontmostApplication():bundleID() ~= {_lua_str(plan.hotkey.appBundleId)} then return end'
    body = "\n  ".join(_emit_step_lua(s) for s in plan.steps)
    return f"""
-- BEGIN GENERATED {plan.hotkey.combo}
hs.hotkey.bind({_lua_arr(mods)}, "{key}", function()
  {gate}
  {body}
end)
-- END GENERATED {plan.hotkey.combo}
""".strip("\n")

def upsert_block(block_id: str, block: str) -> None:
    HAM_FILE.parent.mkdir(parents=True, exist_ok=True)
    content = HAM_FILE.read_text(encoding="utf-8") if HAM_FILE.exists() else ""
    pattern = re.compile(rf"-- BEGIN GENERATED {re.escape(block_id)}[\s\S]*?-- END GENERATED {re.escape(block_id)}", re.M)
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
        raise HTTPException(status_code=500, detail="Hammerspoon CLI not found. Set HS_CLI or install CLI.")
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Hammerspoon reload failed: {e}")

# -------- prompt (plan + runtime only) --------
SYSTEM_PROMPT_TEMPLATE = """
You convert natural language into a deterministic desktop automation plan for macOS.

Return ONLY one JSON object with this exact shape:

{
  "plan": {
    "hotkey": { "combo": "string like 'alt+shift+m'", "scope": "global|app", "appBundleId": "optional string" },
    "steps": [
      { "type": "focus_app", "bundle": "bundle id" } |
      { "type": "open", "target": "url or absolute path" } |
      { "type": "keystroke", "keys": "cmd+shift+a" } |
      { "type": "paste_text", "text": "string" } |
      { "type": "set_clipboard", "text": "string" } |
      { "type": "paste_clipboard" } |
      { "type": "run_shortcut", "name": "Apple Shortcuts name" } |
      { "type": "sleep_ms", "ms": integer milliseconds } |
      { "type": "notify", "title": "string", "body": "string" } |
      { "type": "run_tool", "name": "tool name", "args": { "k": "v" } }
    ],
    "notes": "optional string"
  },
  "runtime": "static" | "dynamic"
}

Global rules (strict)
- Output MUST be valid JSON only (no prose). Exactly one object with "plan" and "runtime".
- Normalize modifiers to: cmd, ctrl, alt, shift (lowercase). Use "return" (not "enter").
- If no hotkey is provided, default to "alt+shift+k".
- Insert short waits when UI changes precede typing/pasting: { "type":"sleep_ms","ms":120 }.
- Web load wait: after any { "type":"open", "target": "http(s)://..." } insert { "type":"sleep_ms","ms":3000 } before any action on that page.
- Do only what the user asked. Do not add extra steps or tools.
  - Do not change text, rewrite, summarize, translate, or “polish” unless the user explicitly asks for that.
  - Do not copy or paste unless needed for the requested action.
  - Do not emit run_tool unless the user explicitly requests the capability or it is truly unavoidable to satisfy the request.
- Keystrokes: Prefer modifier shortcuts (cmd+f, cmd+l, pagedown, arrows, return). Avoid unmodified single-character keys unless explicitly requested or absolutely necessary.
- Never type characters one-by-one to form words or URLs. If you must enter text, use a single { "type":"paste_text", "text":"<full string>" } then { "type":"keystroke","keys":"return" }.
- Never invent shell commands or step types not listed.

Tool manifest
Use ONLY these with { "type": "run_tool" }:
<TOOL_MANIFEST_JSON>

Site search (preferred) vs Cmd-F (fallback)
- If the site has a deterministic search feature, use it FIRST by navigating to a search URL or focusing the site’s search field. Examples:
  - Pinterest: https://www.pinterest.com/search/pins/?q=<encoded>
  - Twitter/X: https://twitter.com/search?q=<encoded>&src=typed_query&f=live
  - YouTube:   https://www.youtube.com/results?search_query=<encoded>
  - Reddit:    https://www.reddit.com/search/?q=<encoded>
  - GitHub:    https://github.com/search?q=<encoded>
  - Amazon:    https://www.amazon.com/s?k=<encoded>
  - Google:    https://www.google.com/search?q=<encoded>
- ONLY use Cmd+F when the user explicitly asks to “find on this page” or when no reliable site search exists.
- After any site search navigation (http/https open) insert { "type":"sleep_ms","ms":3000 } before typing or further actions.

Composition (generate new text — always DYNAMIC)
- When the user asks to write/create/generate/draft/compose something (no source text), set "runtime":"dynamic" and use:
  [
    { "type":"run_tool","name":"text.compose","args":{ "instruction":"<what to write>", "tone":"<if relevant>", "format":"<if relevant>", "length":"short|medium|long", "lang":"<if relevant>" } },
    { "type":"sleep_ms","ms":120 },
    { "type":"paste_clipboard" }
  ]
- Do NOT open websites for composition unless the user asked to open a specific page to paste into; otherwise paste into the current app.

Selected-text transforms (dynamic)
[
  { "type":"keystroke","keys":"cmd+c" },
  { "type":"sleep_ms","ms":120 },
  { "type":"run_tool","name":"text.transform","args":{ "operation":"rewrite","tone":"professional" } },
  { "type":"sleep_ms","ms":120 },
  { "type":"paste_clipboard" }
]

Web parsing (dynamic) — when the user says "find/scroll until you see ...":
- Use { "type":"run_tool","name":"web.parse_find","args":{ "url":"<if known>", "site":"<if not>", "query":"<what to look for>" } }
- After it returns a URL, navigate only if the user asked to open that result.

Classification
- "static" when steps are fully deterministic (direct URLs, fixed keystrokes, no tools that need live context).
- "dynamic" when using run_tool (text.transform, text.compose, web.parse_find) or when live context is required.

Output only the JSON object with "plan" and "runtime". No explanations.
""".strip()

def build_system_prompt() -> str:
    return SYSTEM_PROMPT_TEMPLATE.replace("<TOOL_MANIFEST_JSON>", json.dumps(TOOL_MANIFEST, ensure_ascii=False))

# -------- auto-repairs --------
def ensure_dynamic_runtime_hooks(plan: Dict[str, Any]) -> Dict[str, Any]:
    # Only inject for dynamic selected-text rewrite if the model forgot
    steps = plan.get("steps") or []
    if any(s.get("type") == "run_tool" for s in steps):
        return plan
    paste_idx = next((i for i, s in enumerate(steps) if s.get("type") == "paste_clipboard"), None)
    inject: List[Dict[str, Any]] = [
        {"type": "keystroke", "keys": "cmd+c"},
        {"type": "sleep_ms", "ms": 120},
        {"type": "run_tool", "name": "text.transform", "args": {"operation": "rewrite", "tone": "professional"}},
        {"type": "sleep_ms", "ms": 120},
    ]
    if paste_idx is None:
        plan["steps"] = steps + inject + [{"type": "paste_clipboard"}]
    else:
        plan["steps"] = steps[:paste_idx] + inject + steps[paste_idx:]
    return plan

def ensure_web_load_delays(plan: Dict[str, Any]) -> Dict[str, Any]:
    """Insert a 3s delay after any open step to an http(s) URL, unless a >=3000ms sleep is already next."""
    steps = plan.get("steps") or []
    out: List[Dict[str, Any]] = []
    i = 0
    while i < len(steps):
        step = steps[i]
        out.append(step)
        if step.get("type") == "open":
            tgt = (step.get("target") or "").strip()
            if tgt.startswith("http://") or tgt.startswith("https://"):
                nxt = steps[i+1] if i+1 < len(steps) else None
                if not (isinstance(nxt, dict) and nxt.get("type") == "sleep_ms" and (nxt.get("ms") or 0) >= 3000):
                    out.append({"type": "sleep_ms", "ms": 3000})
        i += 1
    plan["steps"] = out
    return plan

def normalize_open_followup_to_cmdf(plan: Dict[str, Any]) -> Dict[str, Any]:
    """After an http(s) open, replace an immediate Cmd+L with Cmd+F (keep subsequent paste/return)."""
    steps = plan.get("steps") or []
    for i in range(len(steps) - 1):
        s = steps[i]
        if s.get("type") == "open":
            tgt = (s.get("target") or "").strip()
            if tgt.startswith("http://") or tgt.startswith("https://"):
                nxt = steps[i+1]
                if isinstance(nxt, dict) and nxt.get("type") == "keystroke" and (nxt.get("keys") or "").lower() == "cmd+l":
                    steps[i+1] = {**nxt, "keys": "cmd+f"}
    plan["steps"] = steps
    return plan

# ---- Prefer native site search over Cmd-F (auto-repair) ----
def _encode_q(q: str) -> str:
    return q.strip().replace(" ", "%20")

KNOWN_SITE_SEARCH = {
    "twitter.com":   lambda q: f"https://twitter.com/search?q={_encode_q(q)}&src=typed_query&f=live",
    "x.com":         lambda q: f"https://twitter.com/search?q={_encode_q(q)}&src=typed_query&f=live",
    "youtube.com":   lambda q: f"https://www.youtube.com/results?search_query={_encode_q(q)}",
    "www.youtube.com": lambda q: f"https://www.youtube.com/results?search_query={_encode_q(q)}",
    "pinterest.com": lambda q: f"https://www.pinterest.com/search/pins/?q={_encode_q(q)}",
    "www.pinterest.com": lambda q: f"https://www.pinterest.com/search/pins/?q={_encode_q(q)}",
    "reddit.com":    lambda q: f"https://www.reddit.com/search/?q={_encode_q(q)}",
    "github.com":    lambda q: f"https://github.com/search?q={_encode_q(q)}",
    "amazon.com":    lambda q: f"https://www.amazon.com/s?k={_encode_q(q)}",
    "google.com":    lambda q: f"https://www.google.com/search?q={_encode_q(q)}",
    "www.google.com":lambda q: f"https://www.google.com/search?q={_encode_q(q)}",
}

def _host_of(url: str) -> str:
    m = re.match(r"^https?://([^/]+)/?", url)
    return m.group(1).lower() if m else ""

def prefer_site_search_over_cmdf(plan: dict) -> tuple[dict, bool]:
    """
    If plan opens a known site and then does Cmd+F + paste_text "<query>" (+ return),
    rewrite to open the site's search URL directly. Returns (plan, changed?)
    """
    steps = plan.get("steps") or []
    changed = False
    i = 0
    while i < len(steps):
        s = steps[i]
        if s.get("type") == "open" and isinstance(s.get("target"), str):
            host = _host_of(s["target"])
            if host in KNOWN_SITE_SEARCH:
                j = i + 1
                saw_cmdf = False
                query = None
                end_idx = None
                if j < len(steps) and steps[j].get("type") == "keystroke" and (steps[j].get("keys") or "").lower() == "cmd+f":
                    saw_cmdf = True
                    j += 1
                    if j < len(steps) and steps[j].get("type") == "sleep_ms":
                        j += 1
                    if j < len(steps) and steps[j].get("type") == "paste_text" and isinstance(steps[j].get("text"), str):
                        query = steps[j]["text"]
                        j += 1
                        if j < len(steps) and steps[j].get("type") == "sleep_ms":
                            j += 1
                        if j < len(steps) and steps[j].get("type") == "keystroke" and (steps[j].get("keys") or "").lower() == "return":
                            j += 1
                        end_idx = j
                if saw_cmdf and query:
                    steps[i]["target"] = KNOWN_SITE_SEARCH[host](query)
                    if end_idx is not None:
                        del steps[i+1:end_idx]
                    changed = True
        i += 1
    plan["steps"] = steps
    return plan, changed

# -------- endpoints --------
@app.get("/")
def home():
    return {"status": "ok"}

@app.post("/api/generate-script")
def generate_script(payload: GenerateReq):
    command = (payload.command or "").strip()
    if not command:
        raise HTTPException(status_code=400, detail="Missing 'command'")

    if client is None:
        dummy = {
            "plan": {
                "hotkey": {"combo": "alt+shift+k", "scope": "global"},
                "steps": [{"type": "notify", "title": "Planner offline", "body": command}],
                "notes": "offline"
            },
            "runtime": "static"
        }
        return {"status": "success", **dummy}

    try:
        response = client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-3.5-turbo"),
            messages=[
                {"role": "system", "content": build_system_prompt()},
                {"role": "user", "content": command},
            ],
            max_tokens=900,
            temperature=0,
        )
        content = (response.choices[0].message.content or "").strip()
        obj = json.loads(content)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Planner failure: {e}")

    if "plan" in obj and "runtime" in obj:
        plan = obj["plan"]
        runtime = obj["runtime"]
    else:
        plan = obj
        runtime = "dynamic"

    if runtime == "dynamic":
        plan = ensure_dynamic_runtime_hooks(plan)

    # Always enforce 3s wait after web opens and prefer Cmd-F
    plan = ensure_web_load_delays(plan)
    plan = normalize_open_followup_to_cmdf(plan)

    # Prefer native site search over Cmd-F when possible
    plan, _ = prefer_site_search_over_cmdf(plan)

    if "hotkey" not in plan or "steps" not in plan:
        raise HTTPException(status_code=422, detail="Invalid plan returned")

    return {"status": "success", "plan": plan, "runtime": runtime}

@app.post("/api/apply-plan")
def apply_plan(plan_payload: Dict[str, Any] = Body(...)):
    try:
        plan = Plan(**plan_payload)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Invalid plan: {e}")

    lua_block = compile_lua_block(plan)
    upsert_block(plan.hotkey.combo, lua_block)
    reload_hammerspoon()
    return {"status": "ok", "applied": True, "combo": plan.hotkey.combo}

# -------- /api/run-tool (generic dispatch) --------
class RunToolReq(BaseModel):
    name: str
    args: Dict[str, Any] = {}
    clipboard: Optional[str] = None

class RunToolRes(BaseModel):
    result: str

def exec_text_transform(args: Dict[str, Any], clipboard: Optional[str]) -> str:
    operation = (args.get("operation") or "rewrite").lower()
    tone      = args.get("tone")
    lang      = args.get("lang")
    max_words = args.get("max_words")
    src       = args.get("text") or (clipboard or "")
    if not src:
        return ""

    instr = f"{operation} the text"
    if operation == "summarize" and max_words:
        instr = f"summarize the text in at most {int(max_words)} words"
    if operation == "translate" and lang:
        instr = f"translate the text into {lang}"
    if tone and operation in ("rewrite","polish","expand","shorten"):
        instr += f" with a {tone} tone"
    instr += ". Only output the transformed text. Preserve basic formatting when reasonable."

    if client is None:
        return src

    chat = client.chat.completions.create(
        model=os.getenv("OPENAI_MODEL_TRANSFORM", os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")),
        temperature=0,
        max_tokens=1200,
        messages=[
            {"role":"system","content":"You are a careful text transformer."},
            {"role":"user","content": f"{instr}\n\n---\n{src}\n---"}
        ],
    )
    return (chat.choices[0].message.content or "").strip()

def exec_text_compose(args: Dict[str, Any]) -> str:
    instruction = (args.get("instruction") or "").strip()
    tone = (args.get("tone") or "").strip()
    fmt = (args.get("format") or "").strip()
    length = (args.get("length") or "").strip()
    lang = (args.get("lang") or "").strip()

    if not instruction:
        return ""

    sys = "You write exactly what is asked, nothing extra."
    user_lines = [instruction]
    if tone:
        user_lines.append(f"TONE: {tone}")
    if fmt:
        user_lines.append(f"FORMAT: {fmt}")
    if length:
        user_lines.append(f"LENGTH: {length}")
    if lang:
        user_lines.append(f"LANG: {lang}")
    user = "\n".join(user_lines)

    if client is None:
        return instruction  # offline echo

    chat = client.chat.completions.create(
        model=os.getenv("OPENAI_MODEL_COMPOSE", os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")),
        temperature=0.2,
        max_tokens=800,
        messages=[
            {"role":"system","content": sys},
            {"role":"user","content": user},
        ],
    )
    return (chat.choices[0].message.content or "").strip()

def _construct_search_url(site: str, query: str) -> Optional[str]:
    q = query.replace(" ", "%20")
    s = site.lower()
    if s in ("twitter", "x"):
        return f"https://twitter.com/search?q={q}&src=typed_query&f=live"
    if s in ("youtube", "yt"):
        return f"https://www.youtube.com/results?search_query={q}"
    if s in ("google", "web"):
        return f"https://www.google.com/search?q={q}"
    return None

def exec_web_parse_find(args: Dict[str, Any]) -> str:
    url = args.get("url")
    site = args.get("site")
    query = (args.get("query") or "").strip()
    if not url and not site:
        return ""

    if not url and site and query:
        candidate = _construct_search_url(site, query)
        if candidate:
            url = candidate

    if not url:
        return ""

    if PLAYWRIGHT_OK:
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                page = browser.new_page()
                page.goto(url, wait_until="domcontentloaded", timeout=20000)
                for _ in range(8):
                    page.mouse.wheel(0, 1200)
                    page.wait_for_timeout(400)
                html = page.content()
                browser.close()
            terms = [t.lower() for t in re.split(r"\s+|\bOR\b|\bor\b", query) if t]
            best = None
            if REQS_OK:
                soup = BeautifulSoup(html, "html.parser")
                for a in soup.find_all("a", href=True):
                    text = (a.get_text() or "").lower()
                    if any(t in text for t in terms):
                        href = a["href"]
                        if href.startswith("/") and "twitter.com" in url:
                            href = "https://twitter.com" + href
                        best = href
                        break
            return best or url
        except Exception:
            pass

    if REQS_OK:
        try:
            r = requests.get(url, timeout=12, headers={"User-Agent":"Mozilla/5.0"})
            soup = BeautifulSoup(r.text, "html.parser")
            terms = [t.lower() for t in re.split(r"\s+|\bOR\b|\bor\b", query) if t]
            for a in soup.find_all("a", href=True):
                text = (a.get_text() or "").lower()
                if any(t in text for t in terms):
                    href = a["href"]
                    if href.startswith("/") and "twitter.com" in url:
                        href = "https://twitter.com" + href
                    return href
            return url
        except Exception:
            return url

    return url

def exec_shortcut_run(args: Dict[str, Any]) -> str:
    name = args.get("name")
    if not name:
        return "[missing shortcut name]"
    try:
        subprocess.run(["/usr/bin/shortcuts", "run", str(name)], check=True, timeout=15)
        return f"Ran: {name}"
    except Exception as e:
        return f"[failed] {e}"

TOOLS_EXECUTORS = {
    "text.transform": lambda a, clip: exec_text_transform(a, clip),
    "text.compose":   lambda a, clip: exec_text_compose(a),
    "web.parse_find": lambda a, clip: exec_web_parse_find(a),
    "shortcut.run":   lambda a, clip: exec_shortcut_run(a),
}

@app.post("/api/run-tool", response_model=RunToolRes)
def run_tool(req: "RunToolReq"):
    fn = TOOLS_EXECUTORS.get(req.name)
    if not fn:
        raise HTTPException(status_code=404, detail=f"Unknown tool: {req.name}")
    try:
        result = fn(req.args or {}, req.clipboard)
        return {"result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Tool error: {e}" )

class RunToolReq(BaseModel):
    name: str
    args: Dict[str, Any] = {}
    clipboard: Optional[str] = None
