import os
from dotenv import load_dotenv
from flask import Flask, request
from flask_cors import CORS
import re, sys
import subprocess
from pathlib import Path

app = Flask(__name__)

CORS(app)

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
    p = Path.home() / ".hammerspoon" / "agentic.lua"
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

@app.route("/api/generate-plan", methods=["POST"])
def generate_plan():
    data = request.json
    # Process the request and generate a plan
    return {"status": "ok", "message": "Plan generated"}

@app.route("/api/apply-plan", methods=["POST"])
def apply_plan():
    data = request.json
    # Process the request and apply the plan
    return {"status": "ok", "message": "Plan applied"}

if __name__ == '__main__':
    # Run the server on port 8000
    # print("Starting server on http://localhost:8000")
    app.run(debug=True, port=8000)