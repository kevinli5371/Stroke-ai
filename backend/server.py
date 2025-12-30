import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
from typing import Dict, Any, List, TypedDict, Optional
import json
import uuid

app = Flask(__name__)

# Allow specific origins in production, but * for dev is fine for now
CORS(app)

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# -------- Tool + Workflow types --------
# These types are now just for the Planner to know what exists on the client.

class ToolInput(TypedDict, total=False):
    text: str
    url: str
    seconds: float
    instruction: str
    name: str

class ToolResult(TypedDict, total=False):
    success: bool
    text: str

class WorkflowStep(TypedDict):
    tool: str
    input: Dict[str, Any]

class Hotkey(TypedDict, total=False):
    mods: List[str]
    key: str

class Workflow(TypedDict):
    id: str
    name: str
    steps: List[WorkflowStep]
    hotkey: Optional[Hotkey]

# In-Memory DB for now (would be Postgres/Redis in real "Cloud")
WORKFLOWS: Dict[str, Workflow] = {}

# We no longer write to Hammerspoon config.
# We also don't really need to persist to disk for this demo, 
# but could keep a JSON file if needed.

# -------- context layer ------------
def build_context_layer() -> Dict[str, Any]:
    # In a real cloud app, this context would come FROM the client request.
    # For now, we hardcode defaults, or receive them in the API payload.
    
    existing = []
    reserved = []
    
    for w in WORKFLOWS.values():
        existing.append({
            "id": w["id"],
            "name": w["name"],
            "hotkey": w.get("hotkey")
        })
        if w.get("hotkey"):
            reserved.append(w["hotkey"])

    return {
        "environment": {
            "os": "macOS",
            "default_browser": "Google Chrome",
        },
        "preferences": {
            "default_hotkey_mods": ["cmd", "alt"],
            "chatgpt_url": "https://chatgpt.com",
            "default_wait_seconds": 0.4,
        },
        "existing_workflows": existing,
        "reserved_hotkeys": reserved
    }

# -------- system prompt --------
# This stays largely the same, but we clarify that "tools" are executed by the Client.
WORKFLOW_PLANNER_PROMPT = """
You are an automation planner for a macOS keyboard-shortcut agent.
Given a natural language command, you respond with a JSON workflow.

Device Context:
You will receive a "context" JSON describing the user's environment and existing hotkeys.

Tools Available (Client-Side Execution):
1. "debug_log": { text: string }
2. "open_url": { url: string }
3. "wait": { seconds: float }
4. "copy_selection": {} (Cmd+C)
5. "paste_clipboard": {} (Cmd+V)
6. "open_app": { name: string }
7. "press_enter": {}
8. "focus_url_bar": {} (Cmd+L)
9. "append_to_clipboard": { text: string }
10. "replace_clipboard": { text: string }
11. "transform_clipboard": { instruction: string }
   - Uses an LLM to rewrite/transform the clipboard content in-place.
   - Use this for "rewrite this", "explain this", "tailor this prompt", "audit this code", OR "draft a reply to this".

Usage Rules:
- Return ONLY JSON.
- Do NOT use reserved hotkeys. Check "reserved_hotkeys" in the context. If a conflict exists, choose a different key.
- Prefer efficient tool chains.
- CRITICAL: If the user wants to modify, explain, or generate text based on their selection, use "transform_clipboard" instead of opening a browser. It is much faster.

ALWAYS respond with ONLY the JSON object. No backticks, no markdown, no explanation.

Example 1: "Tailor this prompt for an LLM"
{
  "name": "Tailor prompt for LLM",
  "hotkey": { "mods": ["cmd", "alt"], "key": "T" },
  "steps": [
    { "tool": "debug_log", "input": { "text": "Tailoring prompt..." } },
    { "tool": "copy_selection", "input": {} },
    { "tool": "wait", "input": { "seconds": 0.2 } },
    { "tool": "transform_clipboard", "input": { "instruction": "Refine this text to be a high-quality, precise LLM prompt." } },
    { "tool": "wait", "input": { "seconds": 0.2 } },
    { "tool": "paste_clipboard", "input": {} }
  ]
}

Example 2: "Draft a polite reply to this email"
{
  "name": "Draft polite reply",
  "hotkey": { "mods": ["cmd", "alt"], "key": "R" },
  "steps": [
    { "tool": "debug_log", "input": { "text": "Drafting reply..." } },
    { "tool": "copy_selection", "input": {} },
    { "tool": "wait", "input": { "seconds": 0.3 } },
    { "tool": "transform_clipboard", "input": { "instruction": "Write a short, polite reply to this email." } },
    { "tool": "wait", "input": { "seconds": 0.3 } },
    { "tool": "paste_clipboard", "input": {} }
  ]
}

Example 3: "Google search selection"
{
  "name": "Google search selection",
  "hotkey": { "mods": ["cmd", "alt"], "key": "S" },
  "steps": [
    { "tool": "debug_log", "input": { "text": "Google searching..." } },
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
"""

def plan_workflow_from_command(command: str) -> Workflow:
    context = build_context_layer()
    context_json = json.dumps(context, indent=2)

    response = client.chat.completions.create(
        model="gpt-4o-mini", # or 4.1-mini / 3.5-turbo
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": WORKFLOW_PLANNER_PROMPT},
            {"role": "system", "content": f"Context:\n{context_json}"},
            {"role": "user", "content": command},
        ],
    )
    
    plan_text = response.choices[0].message.content
    try:
        plan = json.loads(plan_text)
    except:
        # Fallback repair or error
        raise RuntimeError("LLM returned invalid JSON")

    steps = plan.get("steps", [])
    if not steps:
        raise RuntimeError("No steps generated")

    workflow_id = str(uuid.uuid4())
    workflow: Workflow = {
        "id": workflow_id,
        "name": plan.get("name", command[:50]),
        "hotkey": plan.get("hotkey"),
        "steps": steps,
    }
    
    WORKFLOWS[workflow_id] = workflow
    return workflow

# -------- API Endpoints --------

@app.route("/api/transform", methods=["POST"])
def transform_text_api():
    """
    Transforms text properly using the Cloud Brain's LLM.
    Client sends { text: "...", instruction: "..." }
    """
    data = request.json
    text = data.get("text")
    instruction = data.get("instruction")

    if not text:
        return jsonify({"status": "error", "message": "No text provided"}), 400

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful text transformation assistant. Return ONLY the transformed text. No explanation."},
                {"role": "user", "content": f"Instruction: {instruction}\n\nInput Text:\n{text}"}
            ]
        )
        result = response.choices[0].message.content
        return jsonify({"status": "success", "result": result})
    except Exception as e:
        logging.error(f"Transform failed: {e}", exc_info=True)
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/api/workflows", methods=["GET"])
def get_workflows():
    return jsonify({
        "status": "success",
        "workflows": list(WORKFLOWS.values())
    })

@app.route("/api/plan-workflow", methods=["POST"])
def plan_workflow_api():
    data = request.json
    command = data.get("command")
    if not command:
        return jsonify({"status": "error", "message": "No command provided"}), 400
    
    try:
        wf = plan_workflow_from_command(command)
        return jsonify({"status": "success", "workflow": wf})
    except Exception as e:
        print("Planning failed:", e)
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/api/update-workflow", methods=["POST"])
def update_workflow():
    data = request.json
    wf_id = data.get("id")
    if not wf_id or wf_id not in WORKFLOWS:
        return jsonify({"status": "error", "message": "Workflow not found"}), 404
    
    # Update fields
    if "name" in data:
        WORKFLOWS[wf_id]["name"] = data["name"]
    if "hotkey" in data:
        WORKFLOWS[wf_id]["hotkey"] = data["hotkey"]
        
    return jsonify({"status": "success"})

@app.route("/api/delete-workflow/<wf_id>", methods=["DELETE"])
def delete_workflow(wf_id):
    if wf_id in WORKFLOWS:
        del WORKFLOWS[wf_id]
        return jsonify({"status": "success"})
    return jsonify({"status": "error", "message": "Not found"}), 404

# Run history API (Optional/Stubbed for now)
@app.route("/api/run-history", methods=["GET"])
def get_run_history():
    return jsonify({"status": "success", "history": []})

if __name__ == "__main__":
    # In 'Cloud' mode, we might listen on 0.0.0.0, but properly secured.
    # For local dev acting as cloud:
    app.run(host="127.0.0.1", port=8000, debug=True)