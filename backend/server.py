import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
import re, sys
import subprocess
from pathlib import Path
from openai import OpenAI
from typing import Callable, Dict, Any, List, TypedDict, Optional
import json
import uuid
import time
import requests

app = Flask(__name__)

CORS(app)

load_dotenv()

# -------- Tool + Workflow types --------
class ToolInput(TypedDict, total=False):
    # different tools will use different fields
    text: str
    url: str
    seconds: float
    instruction: str
    name: str

class ToolResult(TypedDict, total=False):
    success: bool
    text: str  # optional debug/output text

ToolFn = Callable[[ToolInput], ToolResult]

# name -> function
TOOLS: Dict[str, ToolFn] = {}

class WorkflowStep(TypedDict):
    tool: str
    input: Dict[str, Any]

class Hotkey(TypedDict, total=False):
    mods: List[str] # e.g. ["cmd", "alt"]
    key: str        # e.g. "G"

class Workflow(TypedDict):
    id: str
    name: str
    steps: List[WorkflowStep]

WORKFLOWS: Dict[str, Workflow] = {}
WORKFLOWS_PATH = Path.home() / ".hammerspoon" / "agentic_workflows.json"

# tool function, tool takes in ToolInput and returns ToolResult
ToolFn = Callable[[ToolInput], ToolResult]
TOOLS: Dict[str, ToolFn] = {}

# -------- tool implementations --------
def tool_debug_log(payload: ToolInput) -> ToolResult:
    msg = payload.get("text", "")
    print(f"[tool_debug_log] {msg}")
    return {"success": True, "text": msg}

def tool_wait(payload: ToolInput) -> ToolResult:
    seconds = float(payload.get("seconds", 1.0))
    print(f"[tool_wait] sleeping for {seconds} seconds")
    time.sleep(seconds)
    return {"success": True, "text": f"waited {seconds} seconds"}

def tool_copy_selection(payload: ToolInput) -> ToolResult:
    try:
        response = requests.post("http://127.0.0.1:9123/copy", timeout=2)
        response.raise_for_status()
        return {
            "success": True,
            "text": "selection copied"
        }
    except Exception as e:
        return {
            "success": False,
            "text": f"failed to copy selection: {str(e)}"
        }

def tool_paste_clipboard(payload: ToolInput) -> ToolResult:
    try:
        response = requests.post("http://127.0.0.1:9123/paste", timeout=2)
        response.raise_for_status()
        return {
            "success": True,
            "text": "clipboard pasted"
        }
    except Exception as e:
        return {
            "success": False,
            "text": f"failed to paste clipboard: {str(e)}"
        }

def tool_open_url(payload: ToolInput) -> ToolResult:
    url = payload.get("url")
    if not url:
        return {"success": False, "text": "no URL provided"}
    
    try:
        subprocess.run(["open", url], check=True)
        return {"success": True, "text": f"opened URL: {url}"}
    except subprocess.CalledProcessError as e:
        return {"success": False, "text": f"Failed to open URL: {str(e)}"}

def tool_llm_transform_clipboard(payload: ToolInput) -> ToolResult:
    try:
        pbpaste = subprocess.run(["pbpaste"], capture_output=True, text=True, check=True)
        clipboard_text = pbpaste.stdout.strip()
    except Exception as e:
        return {"success": False, "text": f"Failed to read clipboard: {str(e)}"}
    
    if not clipboard_text:
        return {"success": False, "text": "Clipboard is empty"}
    
    instruction = payload.get("instruction", "Transform the text as needed.")
    if not instruction:
        return {"success": False, "text": "No instruction provided"}
    
    try:
        completion = client.chat.completions.create(
            model="gpt-4.1-mini",  # or whatever you're already using
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant that rewrites or summarizes clipboard text according to an instruction.",
                },
                {
                    "role": "user",
                    "content": f"Instruction: {instruction}\n\nText:\n{clipboard_text}",
                },
            ],
            temperature=0.3, # less randomness for transformations
        )
        transformed_text = completion.choices[0].message.content.strip()
    except Exception as e:
        return {"success": False, "text": f"LLM request failed: {str(e)}"}
    
    try:
        pbcopy = subprocess.run(["pbcopy"], input=transformed_text, text=True, check=True)
        return {"success": True, "text": "Clipboard transformed successfully"}
    except Exception as e:
        return {"success": False, "text": f"Failed to write to clipboard: {str(e)}"}
    
    preview = transformed_text[:100] + ("..." if len(transformed_text) > 100 else "")
    return {"success": True, "text": f"Clipboard transformed: {preview}"}

def tool_append_to_clipboard(payload: ToolInput) -> ToolResult:
    # You can call this field "suffix" or reuse "text"
    suffix = payload.get("text")
    if not suffix:
        return {
            "success": False,
            "text": "append_to_clipboard: missing 'text' in payload",
        }

    current = read_clipboard_text()
    current = current.rstrip("\n")

    if current:
        new_text = current + "\n\n" + suffix
    else:
        new_text = suffix

    write_clipboard_text(new_text)

    preview = new_text[:120] + ("..." if len(new_text) > 120 else "")
    return {
        "success": True,
        "text": f"Appended to clipboard. Preview: {preview}",
    }

def tool_prepend_to_clipboard(payload: ToolInput) -> ToolResult:
    prefix = payload.get("text")
    if not prefix:
        return {
            "success": False,
            "text": "prepend_to_clipboard: missing 'text' in payload",
        }

    current = read_clipboard_text()
    current = current.lstrip("\n")

    if current:
        new_text = prefix + "\n\n" + current
    else:
        new_text = prefix

    write_clipboard_text(new_text)

    preview = new_text[:120] + ("..." if len(new_text) > 120 else "")
    return {
        "success": True,
        "text": f"Prepended to clipboard. Preview: {preview}",
    }

def tool_replace_clipboard(payload: ToolInput) -> ToolResult:
    new_text = payload.get("text")
    if not new_text:
        return {
            "success": False,
            "text": "replace_clipboard: missing 'text' in payload",
        }

    write_clipboard_text(new_text)
    preview = new_text[:120] + ("..." if len(new_text) > 120 else "")
    return {
        "success": True,
        "text": f"Replaced clipboard. Preview: {preview}",
    }

def tool_open_app(payload: ToolInput) -> ToolResult:
    name = payload.get("name")
    if not name:
        return {
            "success": False,
            "text": "open_app: missing 'name' in payload",
        }

    script = f'tell application "{name}" to activate'

    try:
        run_osascript(script)
        return {
            "success": True,
            "text": f"Activated app: {name}",
        }
    except Exception as e:
        return {
            "success": False,
            "text": f"open_app failed for '{name}': {e}",
        }

def tool_open_new_tab(payload: ToolInput) -> ToolResult:
    script = 'tell application "System Events" to keystroke "t" using command down'

    try:
        run_osascript(script)
        return {
            "success": True,
            "text": "Sent Cmd+T (open new tab)",
        }
    except Exception as e:
        return {
            "success": False,
            "text": f"open_new_tab failed: {e}",
        }

def tool_focus_url_bar(payload: ToolInput) -> ToolResult:
    script = 'tell application "System Events" to keystroke "l" using command down'

    try:
        run_osascript(script)
        return {
            "success": True,
            "text": "Sent Cmd+L (focus URL bar)",
        }
    except Exception as e:
        return {
            "success": False,
            "text": f"focus_url_bar failed: {e}",
        }

def tool_press_enter(payload: ToolInput) -> ToolResult:
    script = 'tell application "System Events" to key code 36'

    try:
        run_osascript(script)
        return {
            "success": True,
            "text": "Pressed Enter",
        }
    except Exception as e:
        return {
            "success": False,
            "text": f"press_enter failed: {e}",
        }

def tool_llm_generate_reply_to_clipboard(payload: ToolInput) -> ToolResult:
    # 1) Read source text from clipboard
    src = read_clipboard_text().strip()
    if not src:
        return {
            "success": False,
            "text": "llm_generate_reply_to_clipboard: clipboard is empty.",
        }

    # 2) Get instruction
    instruction = payload.get("instruction")
    if not instruction:
        # Sensible default if none provided
        instruction = "Write a brief, polite reply to this message."

    # 3) Call the LLM to generate a reply
    try:
        completion = client.chat.completions.create(
            model="gpt-4.1-mini",  # or your existing model
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a helpful assistant that drafts replies to emails "
                        "and messages. Keep replies clear, concise, and on-topic."
                    ),
                },
                {
                    "role": "user",
                    "content": (
                        f"Instruction: {instruction}\n\n"
                        f"Original message:\n{src}"
                    ),
                },
            ],
        )
        reply_text = (completion.choices[0].message.content or "").strip()
    except Exception as e:
        return {
            "success": False,
            "text": f"llm_generate_reply_to_clipboard: LLM call failed: {e}",
        }

    if not reply_text:
        return {
            "success": False,
            "text": "llm_generate_reply_to_clipboard: LLM returned empty reply.",
        }

    # 4) Write reply back to clipboard
    try:
        write_clipboard_text(reply_text)
    except Exception as e:
        return {
            "success": False,
            "text": f"llm_generate_reply_to_clipboard: failed to write clipboard: {e}",
        }

    preview = reply_text[:160] + ("..." if len(reply_text) > 160 else "")
    return {
        "success": True,
        "text": f"Generated reply and copied to clipboard. Preview: {preview}",
    }

# -------- register tools --------
TOOLS["copy_selection"] = tool_copy_selection
TOOLS["paste_clipboard"] = tool_paste_clipboard
TOOLS["open_url"] = tool_open_url
TOOLS["debug_log"] = tool_debug_log
TOOLS["wait"] = tool_wait
TOOLS["llm_transform_clipboard"] = tool_llm_transform_clipboard
TOOLS["append_to_clipboard"] = tool_append_to_clipboard
TOOLS["prepend_to_clipboard"] = tool_prepend_to_clipboard
TOOLS["replace_clipboard"] = tool_replace_clipboard
TOOLS["open_app"] = tool_open_app
TOOLS["open_new_tab"] = tool_open_new_tab
TOOLS["focus_url_bar"] = tool_focus_url_bar
TOOLS["press_enter"] = tool_press_enter
TOOLS["llm_generate_reply_to_clipboard"] = tool_llm_generate_reply_to_clipboard


# -------- system prompt --------
WORKFLOW_PLANNER_PROMPT = """
You are an automation planner for a macOS keyboard-shortcut agent.

Given a natural language command from the user, you MUST respond with a single JSON object that describes a workflow.

The JSON MUST have exactly this shape:

{
  "name": "short descriptive name",
  "hotkey": {
    "mods": ["cmd", "alt"],
    "key": "G"
  },
  "steps": [
    {
      "tool": "debug_log",
      "input": { "text": "Starting workflow..." }
    },
    {
      "tool": "open_url",
      "input": { "url": "https://chatgpt.com" }
    }
  ]
}

Details:

- "mods" is a list of zero or more of:
  "cmd", "alt", "ctrl", "shift".

- "key" is a single key like "G", "T", "X", etc.

- Each element of "steps" has:
  - "tool": the tool name as a string.
  - "input": an object with arguments for that tool.

Available tools:

1) "debug_log"
   - Logs a message to the backend.
   - input fields:
     - "text": string message to log.

2) "open_url"
   - Opens a URL in the default browser.
   - input fields:
     - "url": the URL to open.

3) "wait"
   - Waits for some seconds.
   - input fields:
     - "seconds": number of seconds to wait (float).

4) "copy_selection"
   - Copies the currently selected text in the active app (Cmd+C).
   - input fields: none.

5) "paste_clipboard"
   - Pastes the current clipboard contents into the active app (Cmd+V).
   - input fields: none.

6) "llm_transform_clipboard"
   - Reads the current clipboard text, sends it to an LLM with an instruction,
     and replaces the clipboard with the transformed text.
   - input fields:
     - "instruction": how to transform the text (e.g. "summarize in 3 bullets").
   - IMPORTANT:
     - ONLY use this tool when the user EXPLICITLY asks to change, rewrite,
       summarize, translate, shorten, expand, or otherwise modify the text itself.
     - If the user only wants to MOVE text (e.g. "send selection to ChatGPT",
       "paste this into X", "open site and paste my text", "search this on the web"),
       DO NOT use this tool. In those cases, just use copy_selection, wait,
       open_app, open_url, paste_clipboard, etc.

7) "append_to_clipboard"
   - Reads the current clipboard text and appends some extra text to it, then writes the result back to the clipboard.
   - input fields:
     - "text": the text to append.
   - Use this when the user wants to ADD a simple instruction like "Explain this" at the end of their message, without changing the original content.

8) "open_app"
   - Activates an application by name on macOS.
   - input fields:
     - "name": the application name, e.g. "Google Chrome", "Visual Studio Code", "Notion".
   - Use this to bring a specific app to the foreground before sending keystrokes.

9) "open_new_tab"
   - Sends Cmd+T to the active app (usually a browser) to open a new tab.
   - input fields: none.
   - Assumes a browser or tabbed app is already focused.

10) "focus_url_bar"
    - Sends Cmd+L to focus the URL / location bar in the active browser window.
    - input fields: none.
    - Typically used before pasting a search query or URL.

11) "press_enter"
    - Presses the Enter/Return key in the active app.
    - input fields: none.
    - Use this to submit searches or messages after pasting text.

12) "llm_generate_reply_to_clipboard"
    - Reads the current clipboard text (for example, an email or message),
      asks an LLM to draft a reply according to an instruction, and replaces the
      clipboard contents with the generated reply.
    - input fields:
      - "instruction":
        a short description of how to reply, such as
        "Write a short, polite reply"
        or "Reply in a casual tone and ask two follow-up questions".
    - Use this when the user explicitly asks to "draft a reply", "write a response",
      "respond to this email/message", etc.
    - After using this tool, you will typically use paste_clipboard to insert
      the reply back into the app.

Rules:

- If the user does NOT specify a hotkey, pick a sensible default based on intent:
- Choose a reasonable { "cmd", "alt" } + letter combo.

- Prefer the simplest sequence of tools that accomplishes the user’s request.

- Never add llm_transform_clipboard or llm_generate_reply_to_clipboard unless there is an explicit transformation/generation
  request in the user’s command.

- When using llm_transform_clipboard, you SHOULD typically follow it with
  paste_clipboard in order to insert the transformed text somewhere, unless
  the user’s instruction clearly indicates otherwise.

- When using llm_generate_reply_to_clipboard, you SHOULD typically follow it with
  paste_clipboard, so that the drafted reply is inserted into the current app.

- ONLY use append_to_clipboard to add short instructions like "Explain this",
  "Translate this to French", etc., while preserving the original text.

- For commands that simply MOVE text (e.g. "send my selection to ChatGPT",
  "search this selection on Google"), use combinations of:
  copy_selection, wait, open_app, open_url, focus_url_bar, paste_clipboard, press_enter.

- ALWAYS respond with ONLY the JSON object. No backticks, no markdown, no explanation.

Example 1:

User: "When I press this, send my selected text to ChatGPT."

You MUST output something like:

{
  "name": "Send selection to ChatGPT",
  "hotkey": { "mods": ["cmd", "alt"], "key": "G" },
  "steps": [
    { "tool": "debug_log", "input": { "text": "Sending selection to ChatGPT..." } },
    { "tool": "copy_selection", "input": {} },
    { "tool": "wait", "input": { "seconds": 0.4 } },
    { "tool": "open_app", "input": { "name": "Google Chrome" } },
    { "tool": "wait", "input": { "seconds": 1.0 } },
    { "tool": "open_url", "input": { "url": "https://chatgpt.com" } },
    { "tool": "wait", "input": { "seconds": 2.0 } },
    { "tool": "paste_clipboard", "input": {} }
  ]
}

Example 2:

User: "When I press this, send my selected text to ChatGPT and explain it."

You MUST output something like:

{
  "name": "Send selection to ChatGPT and ask to explain",
  "hotkey": { "mods": ["cmd", "alt"], "key": "G" },
  "steps": [
    { "tool": "debug_log", "input": { "text": "Sending selection to ChatGPT with 'Explain this'..." } },
    { "tool": "copy_selection", "input": {} },
    { "tool": "wait", "input": { "seconds": 0.4 } },
    {
      "tool": "append_to_clipboard",
      "input": { "suffix": "Explain this." }
    },
    { "tool": "open_app", "input": { "name": "Google Chrome" } },
    { "tool": "wait", "input": { "seconds": 1.0 } },
    { "tool": "open_url", "input": { "url": "https://chatgpt.com" } },
    { "tool": "wait", "input": { "seconds": 2.0 } },
    { "tool": "paste_clipboard", "input": {} }
  ]
}

Example 3:

User: "When I press this, search my selection on Google."

You MUST output something like:

{
  "name": "Google search selection",
  "hotkey": { "mods": ["cmd", "alt"], "key": "S" },
  "steps": [
    { "tool": "debug_log", "input": { "text": "Google searching selection..." } },
    { "tool": "copy_selection", "input": {} },
    { "tool": "wait", "input": { "seconds": 0.3 } },
    { "tool": "open_app", "input": { "name": "Google Chrome" } },
    { "tool": "wait", "input": { "seconds": 0.7 } },
    { "tool": "focus_url_bar", "input": {} },
    { "tool": "wait", "input": { "seconds": 0.2 } },
    { "tool": "paste_clipboard", "input": {} },
    { "tool": "wait", "input": { "seconds": 0.2 } },
    { "tool": "press_enter", "input": {} }
  ]
}

Example 4:

User: "When I press this, draft a polite reply to my selected email and paste it back."

You MUST output something like:

{
  "name": "Draft polite reply to selected email",
  "hotkey": { "mods": ["cmd", "alt"], "key": "R" },
  "steps": [
    { "tool": "debug_log", "input": { "text": "Drafting polite reply to selected email..." } },
    { "tool": "copy_selection", "input": {} },
    { "tool": "wait", "input": { "seconds": 0.4 } },
    {
      "tool": "llm_generate_reply_to_clipboard",
      "input": {
        "instruction": "Write a short, polite reply to this email."
      }
    },
    { "tool": "wait", "input": { "seconds": 0.3 } },
    { "tool": "paste_clipboard", "input": {} }
  ]
}

"""



# -------- helper functions --------
def extract_lua_code(plan: str) -> str | None:
    m = re.search(r"```lua\s*(.*?)\s*```", plan, flags=re.S | re.I)
    if m:
        return m.group(1)
    return None

def plan_workflow_from_command(command: str) -> Workflow:
    if not command.strip():
        raise ValueError("Empty command")

    # Use chat.completions with JSON output
    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        response_format={"type": "json_object"},

        messages=[
            {"role": "system", "content": WORKFLOW_PLANNER_PROMPT},
            {"role": "user", "content": command},
        ],
    )

    plan = response.choices[0].message.content
    try:
        plan = json.loads(plan)
    except Exception as e:
        print("Failed to parse JSON from model:", plan)
        raise RuntimeError(f"Model did not return valid JSON: {e}")

    # Make sure it has the minimum fields
    name = plan.get("name") or command[:50]
    hotkey = plan.get("hotkey")
    steps = plan.get("steps") or []

    if not isinstance(steps, list) or not steps:
        raise RuntimeError("Model returned no steps")

    workflow_id = str(uuid.uuid4())

    workflow: Workflow = {
        "id": workflow_id,
        "name": name,
        "hotkey": hotkey,
        "steps": steps,
    }

    # Store in memory for now
    WORKFLOWS[workflow_id] = workflow

    try:
        write_hammerspoon_config()
    except Exception as e:
        print("Failed to write Hammerspoon config:", e)
    
    save_workflows()

    return workflow

def read_clipboard_text() -> str:
    try:
        result = subprocess.run(["pbpaste"], capture_output=True, text=True, check=True)
        return result.stdout
    except Exception as e:
        return ""

def write_clipboard_text(text: str) -> None:
    try:
        subprocess.run(["pbcopy"], input=text, text=True, check=True)
    except Exception as e:
        print("Failed to write to clipboard:", e)

def build_hammerspoon_lua(workflows: Dict[str, Workflow]) -> str:
    lines: list[str] = []

    lines.append("-- AUTO-GENERATED BY keystroke backend. DO NOT EDIT MANUALLY.")
    lines.append("-- Regenerated whenever a new workflow is planned.")
    lines.append("")
    lines.append("local http = require('hs.http')")
    lines.append("local json = require('hs.json')")
    lines.append("")
    lines.append("local workflows = {")

    for wf in workflows.values():
        hotkey = wf.get("hotkey")
        if not hotkey:
            continue
        mods = hotkey.get("mods") or []
        key = hotkey.get("key")
        if not key:
            continue

        mods_str = "+".join(mods)
        combo = f"{mods_str}+{key}" if mods_str else key

        lines.append(f"  ['{combo}'] = '{wf['id']}',  -- {wf['name']}")

    lines.append("}")
    lines.append("")
    lines.append(
        """
local function parseCombo(combo)
    local parts = {}
    for part in string.gmatch(combo, "[^%+]+") do
        table.insert(parts, part)
    end
    local mods = {}
    for i = 1, #parts - 1 do
        table.insert(mods, parts[i])
    end
    local key = parts[#parts]
    return mods, key
    end

    for combo, id in pairs(workflows) do
    local mods, key = parseCombo(combo)
    hs.hotkey.bind(mods, key, function()
        local body = json.encode({ id = id })
        http.asyncPost(
        "http://127.0.0.1:8000/api/run-workflow",
        body,
        { ["Content-Type"] = "application/json" },
        function(status, body, headers)
            if status ~= 200 then
            hs.alert.show("workflow error: " .. tostring(status))
            end
        end
        )
    end)
end
        """.strip()
    )

    return "\n".join(lines)

def write_hammerspoon_config() -> None:
    lua_code = build_hammerspoon_lua(WORKFLOWS)
    path = os.path.expanduser("~/.hammerspoon/agentic.lua")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(lua_code)
    reload_hammerspoon_config()
    print(f"[agentic] wrote Hammerspoon config to {path}")

def reload_hammerspoon_config() -> None:
    try:
        hs_cli = os.getenv("HS_CLI", "hs")  # allow overriding the CLI path
        subprocess.run([hs_cli, "-c", "hs.reload()"], check=True, timeout=5)
        return {"status": "success"}
    except Exception as e:
        print("[agentic] failed to reload Hammerspoon config:", e)

def load_workflows() -> None:
    if not os.path.exists(WORKFLOWS_PATH):
        print(f"[agentic] no workflows file at {WORKFLOWS_PATH}, starting fresh")
        return

    try:
        with open(WORKFLOWS_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        WORKFLOWS.clear()
        for workflow in data:
            workflow_id = workflow.get("id")
            WORKFLOWS[workflow_id] = workflow
        print(f"[agentic] loaded {len(WORKFLOWS)} workflows from {WORKFLOWS_PATH}")
    except Exception as e:
        print(f"[agentic] failed to load workflows: {e}")


def save_workflows() -> None:
    try:
        data = list(WORKFLOWS.values())
        with open(WORKFLOWS_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        print(f"[agentic] saved {len(data)} workflows to {WORKFLOWS_PATH}")
    except Exception as e:
        print(f"[agentic] failed to save workflows: {e}")

def run_osascript(script: str) -> None:
    subprocess.run(["osascript", "-e", script], check=True)

# -------- OpenAI client --------
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# -------- home endpoint --------
@app.route('/')
def home():
    return {"status": "ok", "message": "yo gurt"}

# -------- hs-running endpoint --------
@app.route("/api/hs-running", methods=["GET"])
def hs_running():
    try:
        res = subprocess.run(["pgrep", "-x", "Hammerspoon"], capture_output=True)
        return {"running": res.returncode == 0}
    except FileNotFoundError:
        # pgrep missing (unlikely on mac), fallback to false
        return {"running": False}

# ------- workflows endpoint --------
@app.route("/api/workflows", methods=["GET"])
def api_list_workflows():
    return jsonify({
        "status": "success",
        "workflows": list(WORKFLOWS.values()),
    })

# -------- plan-workflow endpoint --------
@app.post("/api/plan-workflow")
def api_plan_workflow():
    data = request.get_json(force=True) or {}
    command = (data.get("command") or "").strip()

    if not command:
        return jsonify({"status": "error", "message": "Missing 'command'"}), 400

    try:
        workflow = plan_workflow_from_command(command)
    except Exception as e:
        print("Error planning workflow:", e)
        return jsonify({"status": "error", "message": str(e)}), 500

    # For now, just return the workflow object as 'plan'
    return jsonify({
        "status": "success",
        "plan": workflow,
    })

# -------- run-workflow endpoint --------
@app.route("/api/run-workflow", methods=["POST"])
def run_workflow():
    data = request.get_json(force=True)
    workflow_id: Optional[str] = data.get("id")
    
    if not workflow_id:
        return jsonify({"status": "error", "message": "Missing workflow ID"}), 400

    workflow = WORKFLOWS.get(workflow_id)
    if not workflow:
        return jsonify({"status": "error", "message": "Workflow not found"}), 404
    
    results: List[Dict[str, Any]] = []

    for step in workflow["steps"]:
        tool_name = step.get("tool")
        tool_input: ToolInput = step.get("input", {})

        tool_fn = TOOLS.get(tool_name)
        if not tool_fn:
            results.append({
                "tool": tool_name,
                "status": "error",
                "message": "Tool not found"
            })
            break
        
        try: 
            result = tool_fn(tool_input)
        except Exception as e:
            results.append({
                "tool": tool_name,
                "status": "error",
                "message": str(e)
            })
            break
        
        results.append({
            "tool": tool_name,
            "output": result.get("text", "")
        })

    return jsonify({"status": "success", "workflow_id": workflow_id, "results": results})

# -------- delete-workflow endpoint --------
@app.route("/api/delete-workflow/<workflow_id>", methods=["DELETE"])
def delete_workflow(workflow_id):
    if workflow_id not in WORKFLOWS:
        return jsonify({
            "status": "error",
            "message": f"Workflow '{workflow_id}' not found",
        }), 404

    # Remove from in-memory store
    deleted = WORKFLOWS.pop(workflow_id)

    # Update persisted file + Hammerspoon config
    try:
        save_workflows()
    except Exception as e:
        print("Failed to save workflows after delete:", e)

    try:
        write_hammerspoon_config()
    except Exception as e:
        print("Failed to write Hammerspoon config after delete:", e)

    return jsonify({
        "status": "success",
        "deleted_id": workflow_id,
        "deleted_name": deleted.get("name"),
    })


if __name__ == '__main__':
    load_workflows()
    # Run the server on port 8000
    # print("Starting server on http://localhost:8000")
    app.run(debug=True, port=8000)