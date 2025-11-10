from __future__ import annotations

import json
import os
import re
import subprocess
import zlib
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
    name: Optional[str] = None
    hotkey: Hotkey
    steps: List[Step]
    notes: Optional[str] = None

# -------- home endpoint --------
@app.get("/")
def home():
    return {"status": "ok"}

# -------- hs-running endpoint --------
@app.get("/api/hs-running")
def hs_running():
    try:
        res = subprocess.run(["pgrep", "-x", "Hammerspoon"], capture_output=True)
        return {"running": res.returncode == 0}
    except FileNotFoundError:
        # pgrep missing (unlikely on mac), fallback to false
        return {"running": False}

# -------- generate-script endpoint + helpers (grouped) --------
SYSTEM_PROMPT_TEMPLATE = """
Convert the user's natural language instruction into exactly one JSON object with two keys: "plan" and "runtime".

Shape:
{
  "plan": {
    "name": "short human-friendly name for this shortcut",
    "hotkey": { "combo": "alt+shift+x" | "cmd+alt+x" | "", "scope":"global|app", "appBundleId":"optional" },
    "steps": [ ... ],
    "notes": "optional string"
  },
  "runtime": "static" | "dynamic"
}

Allowed step types and exact fields:
- focus_app: { "type":"focus_app", "bundle":"com.example.App" }         # preferred for app-specific actions
- open:      { "type":"open", "target":"https://... | /absolute/path | bundle:com.example.App | app:Exact App Name" }
- keystroke: { "type":"keystroke", "keys":"cmd+f | cmd+l | ctrl+alt+x | return | arrows" }
- paste_text:{ "type":"paste_text", "text":"full string to paste" }
- set_clipboard:{ "type":"set_clipboard", "text":"string" }
- paste_clipboard:{ "type":"paste_clipboard" }
- run_shortcut:{ "type":"run_shortcut", "name":"Apple Shortcuts name" }
- sleep_ms:  { "type":"sleep_ms", "ms": 120 | 3000 | integer }
- notify:    { "type":"notify", "title":"...", "body":"..." }
- run_tool:  { "type":"run_tool", "name":"text.transform|text.compose|web.parse_find|shortcut.run", "args":{...} }

Deterministic rules and normalization (must follow):
- Output ONLY valid JSON (no explanatory text, no markdown).
- Normalize modifier keys to: cmd, ctrl, alt, shift (lowercase). Use "return" not "enter".
- Hotkey combo (if present) must be a normalized lowercase string like "alt+shift+x". If you cannot determine a reasonable hotkey, omit it (empty string or omit hotkey) — the backend may assign one.
- For opening or interacting with applications:
    - ALWAYS include a focus_app step with a macOS bundle id before any keystrokes, pastes, or app-specific UI navigation that target that app. Example:
        { "type":"focus_app", "bundle":"com.google.Chrome" },
        { "type":"sleep_ms","ms":120},
        { "type":"keystroke","keys":"cmd+l" }
    - If you cannot supply a bundle id, use open.target with a prefix to be explicit:
        - bundle:com.example.App  (preferred if you know bundle id)
        - app:Exact App Name      (exact displayed app name; backend will use open -a or launch)
      Example for Visual Studio Code:
        - bundle id: "com.microsoft.VSCode" → { "type":"focus_app", "bundle":"com.microsoft.VSCode" }
        - app name:  "app:Visual Studio Code" → { "type":"open", "target":"app:Visual Studio Code" }
    - Do NOT emit ambiguous plain app names without a prefix. Do NOT assume an app is already focused.
    - All app-targeting sequences must begin with focus_app or an explicit open with a bundle/app prefix.
- For websites use open.target with a full URL "https://..." (backend will add a 3000ms sleep before next action).
- NEVER emit ambiguous plain app names without a prefix.
- When you need to find something on a website (search / locate link / find latest post), use run_tool "web.parse_find" with args { "site":"youtube|twitter|github|..." } or { "url":"https://...", "query":"..." }. Do NOT simulate scrolling & extraction with fragile keystrokes when web.parse_find is available.
- After any http(s) open, insert { "type":"sleep_ms", "ms":3000 } before interacting with the page.
- For selected-text transforms (rewrite/polish/translate) emit the exact sequence:
    [
      { "type":"keystroke","keys":"cmd+c" },
      { "type":"sleep_ms","ms":120 },
      { "type":"run_tool","name":"text.transform","args":{ "operation":"rewrite|summarize|translate", ... } },
      { "type":"sleep_ms","ms":120 },
      { "type":"paste_clipboard" }
    ]
- For composition (generate new text) emit:
    [
      { "type":"run_tool","name":"text.compose","args":{ "instruction":"...", ... } },
      { "type":"sleep_ms","ms":120 },
      { "type":"paste_clipboard" }
    ]
  and set "runtime":"dynamic".
- Set "runtime":"dynamic" whenever steps include any run_tool call or any action that depends on live web content or model outputs. Otherwise use "static".
- Use paste_text for entering any multi-word text; do not emit many single-character keystroke steps to type words.
- Do not invent new step types. Only use the allowed types above.
- Keep names short (<= 60 chars) and free of newlines; if no name provided, the backend will synthesize one from the user's command.

Site-search examples (use these patterns when constructing search URLs inside run_tool/web.parse_find):
- Twitter/X:   https://twitter.com/search?q={encoded}&src=typed_query&f=live
- YouTube:     https://www.youtube.com/results?search_query={encoded}
- Google:      https://www.google.com/search?q={encoded}
- Pinterest:   https://www.pinterest.com/search/pins/?q={encoded}

Final requirement:
- Emit a single JSON object exactly matching the schema above and nothing else.
""".strip()

def build_system_prompt() -> str:
    return SYSTEM_PROMPT_TEMPLATE.replace("<TOOL_MANIFEST_JSON>", json.dumps(TOOL_MANIFEST, ensure_ascii=False))

# --- auto-repairs ---
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

# --- new helper: find used alt+shift letters in agentic.lua ---
def _used_alt_shift_letters() -> set:
    try:
        p = _Path.home() / ".hammerspoon" / "agentic.lua"
        if not p.exists():
            return set()
        txt = p.read_text(encoding="utf-8")
        # match lines like: -- BEGIN GENERATED alt+shift+k
        found = re.findall(r"--\s*BEGIN\s+GENERATED\s+alt\+shift\+([a-z])", txt, flags=re.IGNORECASE)
        return {c.lower() for c in found}
    except Exception:
        return set()

def _choose_alt_shift_letter(seed: str) -> str:
    """Pick a deterministic starting letter from seed, then choose the first unused a-z.
       Raises HTTPException if no letters remain."""
    s = (seed or "")[:1024]
    start_idx = zlib.crc32(s.encode("utf-8")) % 26
    used = _used_alt_shift_letters()
    for offset in range(26):
        idx = (start_idx + offset) % 26
        letter = chr(ord("a") + idx)
        if letter not in used:
            return f"alt+shift+{letter}"
    # all letters used
    raise HTTPException(status_code=409, detail="All alt+shift+<letter> shortcuts are in use; please free one.")

@app.post("/api/generate-script")
def generate_script(payload: GenerateReq):
    command = (payload.command or "").strip()
    if not command:
        raise HTTPException(status_code=400, detail="Missing 'command'")

    if client is None:
        dummy = {
            "plan": {
                "hotkey": {"combo": _choose_alt_shift_letter(command), "scope": "global"},
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

    # Ensure plan has a short human-friendly name
    try:
        if not plan.get("name"):
            # make short sanitized name from the command
            nm = command.strip()[:60]
            nm = re.sub(r"\s+", " ", nm)
            plan["name"] = nm or plan.get("hotkey", {}).get("combo", "")
    except Exception:
        plan["name"] = plan.get("hotkey", {}).get("combo", "")

    # Ensure we always have a hotkey; auto-assign alt+shift+<letter> when missing/empty
    try:
        if not isinstance(plan, dict):
            plan = dict(plan)
    except Exception:
        plan = {"hotkey": {"combo": _choose_alt_shift_letter(command), "scope": "global"}, "steps": []}

    hk = plan.get("hotkey") or {}
    if not hk.get("combo"):
        plan["hotkey"] = {"combo": _choose_alt_shift_letter(command), "scope": "global"}

    # Always attempt to inject dynamic runtime hooks (selected-text transforms) if the model forgot.
    try:
        plan = ensure_dynamic_runtime_hooks(plan)
    except Exception:
        pass
    # If any run_tool exists after injection, ensure runtime is dynamic
    if any((s.get("type") == "run_tool") for s in (plan.get("steps") or [])):
        runtime = "dynamic"

    # Always enforce 3s wait after web opens and prefer Cmd-F
    plan = ensure_web_load_delays(plan)
    plan = normalize_open_followup_to_cmdf(plan)

    # Prefer native site search over Cmd-F when possible
    plan, _ = prefer_site_search_over_cmdf(plan)

    # auto-repair: ensure browser keystrokes have the browser focused first
    try:
        plan = ensure_focus_for_browser_keystrokes(plan)
    except Exception:
        pass

    if "hotkey" not in plan or "steps" not in plan:
        raise HTTPException(status_code=422, detail="Invalid plan returned")

    return {"status": "success", "plan": plan, "runtime": runtime}

# -------- apply-plan endpoint + hammerspoon helpers (grouped) --------
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
        # URL -> open in browser
        if isinstance(tgt, str) and (tgt.startswith("http://") or tgt.startswith("https://")):
            return f"hs.urlevent.openURL({_lua_str(tgt)})"
        # absolute path or .app bundle path -> open path
        if isinstance(tgt, str) and (tgt.startswith("/") or "/" in tgt or tgt.endswith(".app")):
            return f"hs.execute('/usr/bin/open ' .. {_lua_str(tgt)}, true)"
        # bundle id like com.google.Chrome -> use launchOrFocusByBundleID
        if isinstance(tgt, str) and re.match(r'^[a-zA-Z0-9]+(\.[a-zA-Z0-9_]+)+$', tgt):
            return f'hs.application.launchOrFocusByBundleID({_lua_str(tgt)})'
        # otherwise treat as application name -> use open -a with quoting
        return f"hs.execute('/usr/bin/open -a ' .. {_lua_str(tgt)}, true)"
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
            'local resp_body, status, resp_headers = hs.http.post(url, body, headers) '
            'if status == 200 and resp_body then '
            '  local ok, parsed = pcall(hs.json.decode, resp_body) '
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
    name_comment = f'-- NAME: {plan.name}' if getattr(plan, "name", None) else ""
    return f"""
-- BEGIN GENERATED {plan.hotkey.combo}
{name_comment}
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

@app.post("/api/apply-plan")
def apply_plan(plan_payload: Dict[str, Any] = Body(...)):
    # try to auto-insert focus steps on the payload before validation
    try:
        plan_payload = ensure_focus_for_browser_keystrokes(plan_payload)
    except Exception:
        pass
    # ensure dynamic runtime hooks (selected-text transforms) are injected on apply as well
    try:
        plan_payload = ensure_dynamic_runtime_hooks(plan_payload)
    except Exception:
        pass
    try:
        plan = Plan(**plan_payload)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Invalid plan: {e}")

    lua_block = compile_lua_block(plan)
    upsert_block(plan.hotkey.combo, lua_block)
    reload_hammerspoon()
    return {"status": "ok", "applied": True, "combo": plan.hotkey.combo}

# -------- run-tool endpoint + helpers (grouped) --------
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

# ------- list commands endpoint --------
@app.get("/api/list-commands")
def list_commands():
    p = _Path.home() / ".hammerspoon" / "agentic.lua"
    commands = []
    if p.exists():
        content = p.read_text(encoding="utf-8")
        # find each BEGIN..END block, capture combo and optional NAME comment
        pattern = re.compile(
            r"--\s*BEGIN\s+GENERATED\s+(alt\+shift\+[a-z])[^\n]*\n(?:\s*--\s*NAME:\s*(.+?)\s*\n)?[\s\S]*?--\s*END\s+GENERATED\s+\1",
            re.I,
        )
        matches = pattern.findall(content)
        # matches -> list of tuples (combo, name_or_empty)
        commands = [{"combo": m[0].lower(), "name": (m[1].strip() if m[1] else "")} for m in matches]
    return {"status": "success", "commands": commands}

def _installed_browser_bundle() -> Optional[str]:
    """Return a likely default browser bundle id by env override, installed apps, or running process."""
    # 1) env override
    env = os.getenv("DEFAULT_BROWSER_BUNDLE")
    if env:
        return env.strip()

    # 2) common candidates (bundle id, human name)
    candidates = [
        ("com.google.Chrome", "Google Chrome"),
        ("com.apple.Safari", "Safari"),
        ("org.mozilla.firefox", "Firefox"),
        ("com.microsoft.edgemac", "Microsoft Edge"),
    ]

    # check typical install locations
    try:
        for bundle, name in candidates:
            for base in ("/Applications", str(_Path.home() / "Applications")):
                if _Path(base).joinpath(f"{name}.app").exists():
                    return bundle
    except Exception:
        pass

    # 3) fallback: check running processes by name (pgrep)
    try:
        for bundle, name in candidates:
            res = subprocess.run(["pgrep", "-x", name], capture_output=True)
            if res.returncode == 0:
                return bundle
    except Exception:
        pass

    return None

def ensure_focus_for_browser_keystrokes(plan: Dict[str, Any]) -> Dict[str, Any]:
    """
    If the plan contains a browser-style keystroke (e.g. cmd+t, cmd+l, cmd+w)
    and there is no prior focus_app/open step, insert a focus_app for the
    detected system browser + small sleep before the first such keystroke.
    """
    steps: List[Dict[str, Any]] = plan.get("steps") or []

    # If the plan already targets an app explicitly or opens a URL, do nothing
    if any(s.get("type") == "focus_app" for s in steps):
        return plan
    for s in steps:
        if s.get("type") == "open" and isinstance(s.get("target"), str) and (s["target"].startswith("http://") or s["target"].startswith("https://")):
            return plan

    browser_targets = {"cmd+t", "cmd+shift+t", "cmd+w", "cmd+shift+w", "cmd+l", "cmd+f"}
    for idx, s in enumerate(steps):
        if s.get("type") == "keystroke" and isinstance(s.get("keys"), str):
            k = s["keys"].strip().lower()
            if k in browser_targets:
                bundle = _installed_browser_bundle()
                insert_at = max(0, idx)
                focus_step = {"type": "focus_app", "bundle": bundle} if bundle else {"type": "open", "target": "app:Google Chrome"}
                # insert focus then small sleep before the keystroke
                steps.insert(insert_at, {"type": "sleep_ms", "ms": 120})
                steps.insert(insert_at, focus_step)
                plan["steps"] = steps
                return plan
    return plan