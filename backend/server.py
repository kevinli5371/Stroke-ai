import os
from dotenv import load_dotenv
from flask import Flask, request
from flask_cors import CORS
import re, sys
import subprocess
from pathlib import Path
from openai import OpenAI

app = Flask(__name__)

CORS(app)

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

SYSTEM_PROMPT = """
You are a code generator that ONLY returns Lua code snippets for Hammerspoon.

Your job:
- The user will give you a natural language command like:
  - "copy whatever I have highlighted, open a new Chrome tab with ChatGPT, and paste it into the chat"
  - "open Twitter and search for yc hiring"
  - "open my email in Gmail"
  - "toggle play/pause in Spotify"
- For each command, you MUST return a complete Lua script that can be used in ~/.hammerspoon/init.lua.

OUTPUT FORMAT
- Your entire response must be ONE fenced code block of Lua.
- Do NOT include any explanation, comments outside the code block (except for the header comment with the command + name), or extra text.
- The outer message must look like:

```lua
-- your Lua code here
```
Inside the block you may use Lua comments (with --), but do not use any other language.

BEHAVIOR:

- Interpret the user’s command and implement the most reasonable Hammerspoon automation.
- Whenever it makes sense, bind the behavior to a hotkey using hs.hotkey.bind.
- If the user does NOT specify a hotkey, choose a sensible default like:
    - { "cmd", "alt" }, "G" for ChatGPT-related actions
    - { "cmd", "alt" }, "T" for Twitter-related actions
    - Or another reasonable { "cmd", "alt" }, "<LETTER>" combination.

- You may use (when appropriate):
    - hs.hotkey.bind({ ... }, "<KEY>", function() ... end)
    - hs.eventtap.keyStroke({ ... }, "<KEY>")
    - hs.application.get("App Name") and hs.application.launchOrFocus("App Name")
    - hs.osascript.applescript([[ AppleScript here ]])
    - hs.urlevent.openURL("https://...")
    - hs.timer.doAfter(seconds, function() ... end)
    - hs.pasteboard.getContents() to read copied text

EXAMPLE INTERPRETATIONS (FOR YOUR BEHAVIOR, NOT TO BE OUTPUT LITERALLY)

1. If the user says:
    "copy whatever I have highlighted and then open a new Chrome tab with ChatGPT and paste my highlighted text into chat"
    
    You should produce Lua similar to:

    -- Hotkey: Cmd + Alt + G -> copy selected text and paste into ChatGPT
    hs.hotkey.bind({"cmd", "alt"}, "G", function()
        -- 1. Copy currently selected text
        hs.eventtap.keyStroke({"cmd"}, "c")

        -- Small delay to allow copy to complete
        hs.timer.doAfter(0.2, function()
            local copied = hs.pasteboard.getContents() or ""

            if copied == "" then
                hs.alert.show("No text copied")
                return
            end

            -- 2. Open / focus Google Chrome and create a new tab with ChatGPT
            local chrome = hs.application.get("Google Chrome")
            if not chrome then
                hs.application.launchOrFocus("Google Chrome")
            else
                chrome:activate()
            end

            local script = [[
            tell application "Google Chrome"
                if (count of windows) is 0 then
                    make new window
                end if
                tell window 1
                    make new tab with properties {URL:"https://chat.openai.com/"}
                    set active tab index to (count of tabs)
                end tell
                activate
            end tell
            ]]

            hs.osascript.applescript(script)

            -- 3. After a short delay for the page to load, paste + send
            hs.timer.doAfter(2.5, function()
                -- Assumes the ChatGPT input box is focused or will accept paste
                hs.eventtap.keyStroke({"cmd"}, "v")
                hs.eventtap.keyStroke({}, "return")
            end)
        end)
    end)

If the user says:
"search for yc hiring on Twitter"

You should produce Lua similar to:

    -- Hotkey: Cmd + Alt + Y -> open Twitter search for "yc hiring"
    hs.hotkey.bind({"cmd", "alt"}, "Y", function()
        local query = "yc hiring"
        local encodedQuery = hs.http.encodeForQuery(query)
        local url = "https://twitter.com/search?q=" .. encodedQuery .. "&src=typed_query"

        hs.urlevent.openURL(url)
    end)

RULES:

- Always return valid Lua code that Hammerspoon can run.
- Never include anything other than the single Lua code block in your response.
- Prefer clear, readable code over being overly clever.
"""

# -------- helper functions --------
def extract_lua_code(plan: str) -> str | None:
    m = re.search(r"```lua\s*(.*?)\s*```", plan, flags=re.S | re.I)
    if m:
        return m.group(1)
    return None

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

# -------- list-hotkeys endpoint --------
@app.route("/api/list-hotkeys", methods=["GET"])
def list_hotkeys():
    # will have to send agentic.lua in request if not hosting on personal computer 
    p = Path.home() / ".hammerspoon" / "agentic.lua"
    commands = []
    if p.exists():
        content = p.read_text(encoding="utf-8")
        # find each BEGIN..END block, capture combo and optional NAME comment
        hotkey_pattern = re.compile(
            r"hs\.hotkey\.bind\(\s*\{\s*([^}]*)\}\s*,\s*['\"]([A-Za-z])['\"]\s*,\s*function",
            re.IGNORECASE | re.DOTALL,
        )
        matches = hotkey_pattern.findall(content)

        name_matches = re.findall(r'--[^\n]*->\s*(.+)', content, flags=re.IGNORECASE)
        
        for i in range(len(matches)):
            commands.append({
                "combo": f"{matches[i][0].strip()} + {matches[i][1].strip()}",
                "name": name_matches[i] if i < len(name_matches) else None
            })
        
    return {"status": "success", "commands": commands}

# -------- generate-plan endpoint --------
@app.route("/api/generate-plan", methods=["POST"])
def generate_plan():
    data = request.json
    command = data.get("command")
    print(command)
    # Process the request and generate a plan
    response = client.responses.create(
        model="gpt-4.1-mini",
        input=SYSTEM_PROMPT + "\n\n" + command,
    )
    plan = response.output[0].content[0].text

    lua_code = extract_lua_code(plan)

    p = Path.home() / ".hammerspoon" / "agentic.lua"
    # ensure ~/.hammerspoon exists
    p.parent.mkdir(parents=True, exist_ok=True)
    if lua_code:
        # append script to file
        with p.open("a", encoding="utf-8") as script_file:
            if lua_code:
                script_file.write("\n" + lua_code.strip() + "\n")

    # reload hammerspoon config
    try:
        hs_cli = os.getenv("HS_CLI", "hs")  # allow overriding the CLI path
        subprocess.run([hs_cli, "-c", "hs.reload()"], check=True, timeout=5)
        return {"status": "success", "plan": plan}
    # specify what type of exception to catch for future
    except Exception as e:
        print(e)
        return {"status": "error", "message": f"Failed to reload Hammerspoon: {e}"}

if __name__ == '__main__':
    # Run the server on port 8000
    # print("Starting server on http://localhost:8000")
    app.run(debug=True, port=8000)