/* eslint-disable @typescript-eslint/no-explicit-any */
import { app, BrowserWindow, screen, ipcMain, globalShortcut, Tray, Menu, nativeImage } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import http from 'node:http'
import os from 'node:os'
import Store from 'electron-store'
import OpenAI from 'openai'
import dotenv from 'dotenv'

// Load environment variables from the root .env file
dotenv.config({ path: path.join(process.cwd(), '.env') });


// Dynamic OpenAI Client Wrapper
// We need to re-instantiate or configure this when the key changes/is loaded.
let openaiClient: OpenAI | null = null;

function getOpenAI() {
  const prefs = preferencesStore.get("preferences");
  // const apiKey = prefs.apiKey || process.env.OPENAI_API_KEY; // Fallback to env
  const apiKey = prefs.apiKey;


  if (!apiKey) {
    throw new Error("No OpenAI API Key found. Please set it in Settings.");
  }

  // Should we cache this client? 
  // For simplicity, let's create it if the key changed, or just return a new one for now (low overhead).
  // Better: Cache it and invalidate if key changes.
  if (!openaiClient || openaiClient.apiKey !== apiKey) {
    openaiClient = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true
    });
  }
  return openaiClient;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let dashboardWin: BrowserWindow | null
let overlayWin: BrowserWindow | null
let tray: Tray | null = null
let isQuitting = false

function createDashboardWindow() {
  dashboardWin = new BrowserWindow({
    width: 1250,
    height: 800,
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 16, y: 16 },
    // Explicitly disabling frame to ensure no system borders render
    frame: false,
    // Custom/CSS shadow only. System shadow causes artifacts with custom border radius.
    hasShadow: false,
    // transparent: true is required for custom rounded corners (masking the rectangular window)
    transparent: true,
    // REMOVED vibrancy: 'sidebar' because it fills the rectangular window bounds, 
    // creating "grey bits" in the corners outside our custom border-radius.
    // vibrancy: 'sidebar', 
    // visualEffectState: 'active',
    backgroundColor: '#00000000', // Explicitly transparent
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  // dashboardWin.webContents.openDevTools()

  if (VITE_DEV_SERVER_URL) {
    dashboardWin.loadURL(VITE_DEV_SERVER_URL)
  } else {
    dashboardWin.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }

  // Prevent closing when clicking X, unless quitting
  dashboardWin.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault()
      dashboardWin?.hide()
    }
    return false
  })
}

function createTray() {
  const iconPath = path.join(process.env.APP_ROOT, 'build', 'tray.png');
  // Resize to 22x22 for standard macOS menu bar size
  const icon = nativeImage.createFromPath(iconPath).resize({ width: 22, height: 22 });
  // template image: adapts to light/dark mode automatically
  icon.setTemplateImage(true);

  tray = new Tray(icon);
  tray.setToolTip('Stroke.ai');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open Dashboard',
      click: () => dashboardWin?.show()
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        isQuitting = true
        app.quit()
      }
    }
  ]);

  tray.setContextMenu(contextMenu);

  tray.on('double-click', () => {
    dashboardWin?.show();
  });
}

// -- HTTP SERVER TO LISTEN FOR TRIGGERS --
let SERVER_PORT = 4444;

function startLocalServer(retryCount = 0) {
  const MAX_RETRIES = 100; // Give up after checking 100 ports

  if (retryCount > MAX_RETRIES) {
    console.error(`[Electron Server] Failed to find an open port after ${MAX_RETRIES} attempts.`);
    return;
  }

  const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/trigger') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          const message = data.message || "triggered";
          console.log(`[Electron Server] Received trigger: ${message}`);

          // Forward to Overlay Window
          if (overlayWin && !overlayWin.isDestroyed()) {
            // Pass the full data object (including hotkey)
            overlayWin.webContents.send('trigger', data);
          } else {
            console.log("[Electron Server] Overlay window not found or destroyed");
          }

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'ok' }));
        } catch (e) {
          console.error("Failed to parse trigger body", e);
          res.writeHead(400);
          res.end(JSON.stringify({ status: 'error', message: 'Invalid JSON' }));
        }
      });
    } else {
      res.writeHead(404);
      res.end();
    }
  });

  server.on('error', (e: any) => {
    if (e.code === 'EADDRINUSE') {
      console.log(`[Electron Server] Port ${SERVER_PORT} is in use, trying ${SERVER_PORT + 1}...`);
      SERVER_PORT++;
      server.close(); // Ensure handle is released
      startLocalServer(retryCount + 1);
    } else {
      console.error(`[Electron Server] Failed to start server on port ${SERVER_PORT}:`, e);
    }
  });

  server.listen(SERVER_PORT, '127.0.0.1', () => {
    console.log(`[Electron Main] Listening for triggers on http://127.0.0.1:${SERVER_PORT}`);
  });
}
// ----------------------------------------

function createOverlayWindow() {
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.workAreaSize

  const windowWidth = 300 // Max width
  const windowHeight = 60

  // Position bottom center
  const x = Math.round(width / 2 - windowWidth / 2)
  const y = Math.round(height - 80)

  console.log(`Creating overlay at x=${x}, y=${y}, width=${width}, height=${height}`)

  overlayWin = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    x: x,
    y: y,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    hasShadow: false,
    resizable: false,
    focusable: false, // Prevent stealing focus
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
    type: 'panel',
    minimizable: false,
  })

  // Open DevTools to debug
  // overlayWin.webContents.openDevTools({ mode: 'detach' })

  // Float above everything
  overlayWin.setAlwaysOnTop(true, 'floating', 1)
  overlayWin.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })

  // Make click-through (ignore mouse events)
  overlayWin.setIgnoreMouseEvents(true)

  // Load with ?overlay query param to trigger Overlay component
  if (VITE_DEV_SERVER_URL) {
    const url = `${VITE_DEV_SERVER_URL}?overlay`
    console.log(`Loading overlay URL: ${url}`)
    overlayWin.loadURL(url)
  } else {
    overlayWin.loadFile(path.join(RENDERER_DIST, 'index.html'), { search: '?overlay' })
  }
}

function createWindows() {
  createDashboardWindow()
  createOverlayWindow()
  startLocalServer()

  // FORCE DOCK ICON TO SHOW
  if (process.platform === 'darwin') {
    app.dock.show();
  }

  // Ensure dashboard is focused
  if (dashboardWin) {
    dashboardWin.show()
    dashboardWin.focus()
  }

  // Initialize Hotkeys
  refreshRegistryAndHotkeys();
}

app.on('before-quit', () => {
  console.log("[Electron Main] App is quitting...");
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    dashboardWin = null
    overlayWin = null
  }
})

app.on('activate', () => {
  // On macOS, re-create a window in the app when the dock icon is clicked
  // and there are no other windows open (or dashboard is missing).
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindows()
  } else {
    // If the overlay is still around but dashboard is gone/closed
    if (!dashboardWin || dashboardWin.isDestroyed()) {
      createDashboardWindow()
      dashboardWin?.show()
    } else {
      if (dashboardWin.isMinimized()) dashboardWin.restore()
      dashboardWin.show()
      dashboardWin.focus()
    }
  }
})

app.whenReady().then(createWindows)

// ----------------------------------------
// LLM PLANNING & TRANSFORMATION
// ----------------------------------------

const WORKFLOW_PLANNER_PROMPT = `
You are an automation planner for a macOS keyboard-shortcut agent.
Given a natural language command, you respond with a JSON workflow.

Device Context:
You will receive a "context" JSON object with the user's name, environment and existing hotkeys.
The "reserved_hotkeys" list contains keys that are ALREADY IN USE. You MUST NOT use them.
If you suggest a hotkey that is in "reserved_hotkeys", the system will reject your plan.
Pick a unique key (e.g. use a different letter).

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
12. "snap_window": { target: "left" | "right" | "top" | "bottom" | "maximize", app_name?: string }
    - If you just opened an app, PASS "app_name" to ensure the correct window is snapped.
13. "press_key": { key: string, mods?: string[] }
    - Simulates a keystroke. "key" is a single character (e.g. "c") or special key.
    - "mods" is an array: "cmd", "alt", "ctrl", "shift".

Usage Rules:
- Return ONLY JSON.
- The JSON object MUST have a "reasoning" field where you explain your plan step-by-step before generating the "steps" array.
- Do NOT use reserved hotkeys. Check "reserved_hotkeys" in the context. If a conflict exists, choose a different key.
- Prefer efficient tool chains.
- Use the provided context (e.g. username) to personalize instructions.
- WEB APPS: When interacting with websites (Gmail, YouTube, etc), prefer their native single-key shortcuts (e.g. 'c' for compose, 'k' for pause) over OS-standard shortcuts like Cmd+N or Space.
- ACTION URLS (WEB ONLY): If a task can be accomplished by opening a specific URL (e.g. "mail.google.com/...?compose=new"), PREFER that over opening the homepage and pressing keys. It is faster and error-proof.
- DESKTOP APPS: If the user explicitly asks for a desktop app (e.g. "Open Outlook", "Open Notes"), use "open_app". Do NOT use "open_url" for native apps unless it is clearly a web-only service (like Gmail). IMPORTANT: Use the FULL macOS application name (e.g. "Microsoft Outlook" instead of "Outlook", "Google Chrome" instead of "Chrome").
- For transform_clipboard: If the task implies a personal response(like an email reply), explicitly tell the LLM to sign off or refer to the user by their name from the context.
- CRITICAL: If the user wants to modify, explain, or generate text based on their selection, use "transform_clipboard" instead of opening a browser.It is much faster.

ALWAYS respond with ONLY the JSON object.No backticks, no markdown, no explanation.

  Example 1: "Tailor this prompt for an LLM"
{
  "reasoning": "The user wants to refine text for an LLM. 1. I need to get the current text (copy). 2. Use the transform tool to rewrite it. 3. Paste it back. 'Cmd+T' might be common, so I'll use Cmd+Alt+T which is safer.",
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

Example 3: "Snap window left"
{
  "name": "Snap Left",
    "hotkey": { "mods": ["cmd", "alt"], "key": "Left" },
  "steps": [
    { "tool": "snap_window", "input": { "target": "left", "app_name": "Google Chrome" } }
  ]
}

Example 4: "Open Gmail and draft email"
{
  "reasoning": "User wants to draft email. The most robust way is to use the direct compose URL (?compose=new) which works even if hotkeys are disabled.",
    "name": "Draft Email",
      "hotkey": { "mods": ["cmd", "alt"], "key": "C" },
  "steps": [
    { "tool": "debug_log", "input": { "text": "Opening Gmail Compose..." } },
    { "tool": "open_url", "input": { "url": "https://mail.google.com/mail/u/0/#inbox?compose=new" } }
  ]
}
`;

function buildContextLayer(): any {
  const workflows = workflowStore.get("workflows", []);

  const existing = workflows.map(w => ({
    id: w.id,
    name: w.name,
    hotkey: w.hotkey
  }));

  const prefs = preferencesStore.get("preferences");
  const overlayHk = prefs.overlayHotkey || { mods: ["cmd", "alt"], key: "O" };

  const reserved = workflows
    .map(w => w.hotkey)
    .filter(h => h !== undefined);

  // Add overlay hotkey to reserved list
  if (overlayHk) reserved.push(overlayHk);

  return {
    environment: {
      os: "macOS",
      name: os.userInfo().username,
      default_browser: preferencesStore.get("preferences").defaultBrowser || "Google Chrome",
    },
    preferences: {
      default_hotkey_mods: ["cmd", "alt"],
      chatgpt_url: "https://chatgpt.com",
      default_wait_seconds: 0.4,
    },
    existing_workflows: existing,
    reserved_hotkeys: reserved
  };
}

async function planWorkflow(command: string): Promise<any> {
  const context = buildContextLayer();
  const contextJson = JSON.stringify(context, null, 2);

  const client = getOpenAI();
  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: WORKFLOW_PLANNER_PROMPT },
      { role: "system", content: `Context: \n${contextJson} ` },
      { role: "user", content: command },
    ],
    response_format: { type: "json_object" }
  });

  const content = completion.choices[0].message.content || "{}";
  try {
    const plan = JSON.parse(content);
    if (!plan.steps) throw new Error("No steps generated");

    // Assign ID
    plan.id = crypto.randomUUID();
    if (!plan.name) plan.name = command.slice(0, 50);

    if (plan.reasoning) {
      console.log(`[Planner Reasoning]: ${plan.reasoning} `);
    }

    // Auto-save? The server.py did. But let's just return it for now, 
    // as the Dashboard "Save" button triggers the save.
    // Actually server.py said: WORKFLOWS[workflow_id] = workflow; save_workflows();
    // But the Dashboard seems to call saveWorkflow immediately if data.workflow exists.
    // Let's just return the object.
    return plan;
  } catch (e) {
    throw new Error("Failed to parse LLM plan: " + e);
  }
}

async function transformText(text: string, instruction: string): Promise<string> {
  const client = getOpenAI();
  const username = os.userInfo().username;
  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: `You are a text transformation assistant. The user's name is ${username}. Your goal is to strictly follow the transformation instruction. Modify the text only as much as needed to fulfill the request. Maintain the core idea and original style. Do not overly transform or rewrite unnecessarily. Be concise. Return ONLY the transformed text. No explanation.` },
      { role: "user", content: `Instruction: ${instruction}\n\nInput Text:\n${text}` }
    ]
  });
  return completion.choices[0].message.content || "";
}

// ----------------------------------------
// RUN HISTORY STORE
// ----------------------------------------
interface Workflow {
  id: string;
  name: string;
  hotkey?: {
    mods: string[];
    key: string;
  };
  steps: any[];
}

interface RunLog {
  id: string;
  workflowId: string;
  workflowName: string;
  timestamp: number;
  status: 'success' | 'error';
  results?: any[];
}

const runHistoryStore = new Store<{ history: RunLog[] }>({
  name: 'run-history',
  defaults: { history: [] }
});

const workflowStore = new Store<{ workflows: Workflow[] }>({
  name: "workflows",
  defaults: { workflows: [] }
});

interface Preferences {
  apiKey: string;
  defaultBrowser: string;
  theme?: "light" | "dark";
  overlayHotkey?: { mods: string[]; key: string };
}

const preferencesStore = new Store<{ preferences: Preferences }>({
  name: "preferences",
  defaults: {
    preferences: {
      apiKey: "",
      defaultBrowser: "Google Chrome",
      overlayHotkey: { mods: ["cmd", "alt"], key: "O" }
    }
  }
});

ipcMain.handle("get-preferences", () => {
  return preferencesStore.get("preferences");
});

ipcMain.handle("save-preferences", (_event, prefs: Preferences) => {
  preferencesStore.set("preferences", prefs);
  // Reset OpenAI client so next call picks up new key
  openaiClient = null;
  // Re-register hotkeys in case overlay key changed
  refreshRegistryAndHotkeys();
  return { status: "success" };
});

ipcMain.handle("get-workflows", () => {
  return workflowStore.get("workflows", []);
});

ipcMain.handle("save-workflow", (_event, workflow: Workflow) => {
  const workflows = workflowStore.get("workflows", []);
  const index = workflows.findIndex(w => w.id === workflow.id);

  if (index >= 0) {
    workflows[index] = workflow; // Update
  } else {
    workflows.push(workflow); // Create
  }

  workflowStore.set("workflows", workflows);
  refreshRegistryAndHotkeys();
  return { status: "success" };
});

ipcMain.handle("delete-workflow", (_event, id: string) => {
  const workflows = workflowStore.get("workflows", []);
  const filtered = workflows.filter(w => w.id !== id);

  workflowStore.set("workflows", filtered);
  refreshRegistryAndHotkeys();
  return { status: "success" };
});

ipcMain.handle("plan-workflow", async (_event, command: string) => {
  try {
    const plan = await planWorkflow(command);
    return { status: "success", workflow: plan };
  } catch (e: any) {
    console.error("Planning failed:", e);
    return { status: "error", message: e.message };
  }
});

function refreshRegistryAndHotkeys() {
  const workflows = workflowStore.get("workflows", []);
  console.log(`[Workflows] Reloading ${workflows.length} workflows...`);

  // Clear existing
  WORKFLOW_REGISTRY.clear();
  globalShortcut.unregisterAll();

  // 0. Register System Hotkeys
  try {
    const prefs = preferencesStore.get("preferences");
    const hk = prefs.overlayHotkey || { mods: ["cmd", "alt"], key: "O" }; // Default fallback

    // Convert to accelerator string
    const mapMod = (m: string) => {
      if (m === "cmd") return "Command";
      if (m === "alt") return "Alt";
      if (m === "ctrl") return "Control";
      if (m === "shift") return "Shift";
      return m;
    };

    if (hk.key) {
      const overlayAccelerator = [...(hk.mods || []).map(mapMod), hk.key].join("+");

      globalShortcut.register(overlayAccelerator, () => {
        console.log("[System] Toggling Overlay");
        if (overlayWin && !overlayWin.isDestroyed()) {
          if (overlayWin.isVisible()) {
            overlayWin.hide();
          } else {
            overlayWin.showInactive();
          }
        }
      });
      // console.log(`[Hotkeys] Registered System Hotkey ${overlayAccelerator} for Toggle Overlay`);
    }
  } catch (err) {
    console.error(`[Hotkeys] Failed to register overlay toggle:`, err);
  }

  // Register new
  workflows.forEach(wf => {
    WORKFLOW_REGISTRY.set(wf.id, wf as any);

    if (wf.hotkey && wf.hotkey.key) {
      const mods = wf.hotkey.mods || [];
      if (mods.length === 0) return;

      const mapMod = (m: string) => {
        if (m === "cmd") return "Command";
        if (m === "alt") return "Alt";
        if (m === "ctrl") return "Control";
        if (m === "shift") return "Shift";
        return m;
      };

      const accelerator = [...mods.map(mapMod), wf.hotkey.key].join("+");

      try {
        globalShortcut.register(accelerator, () => {
          triggerWorkflow(wf.id, wf.name);
        });
        // console.log(`[Hotkeys] Registered ${accelerator} for ${wf.name}`);
      } catch (err) {
        console.error(`[Hotkeys] Error registering ${accelerator}:`, err);
      }
    }
  });
}

ipcMain.handle('get-run-history', () => {
  return runHistoryStore.get('history', []).reverse(); // Newest first
});

ipcMain.handle('clear-run-history', () => {
  runHistoryStore.set('history', []);
  return true;
});

// ----------------------------------------
// LOCAL HANDS IMPLEMENTATION
// ----------------------------------------

import { exec } from 'node:child_process'
import { shell, clipboard } from 'electron'

function execAppleScript(script: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const escapedScript = script.replace(/'/g, "'\\''");
    const command = `osascript -e '${escapedScript}'`;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    exec(command, (error, stdout, __stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout.trim());
    });
  });
}

function wait(seconds: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

function waitForModifiersRelease(): Promise<void> {
  return new Promise((resolve) => {
    // Python script to check CoreGraphics event flags
    const pythonScript = `
import sys
import time
from ctypes import cdll, util

cg_path = util.find_library("CoreGraphics")
if not cg_path:
    sys.exit(0)

cg = cdll.LoadLibrary(cg_path)
# kCGEventSourceStateHIDSystemState = 1
# Masks: Shift(0x20000), Control(0x40000), Alt(0x80000), Command(0x100000)
MASK = 0x20000 | 0x40000 | 0x80000 | 0x100000

for i in range(20): # Try for 2 seconds
    flags = cg.CGEventSourceFlagsState(1)
    if not (flags & MASK):
        sys.exit(0)
    time.sleep(0.05)
`;
    // Run python3
    const command = `python3 -c '${pythonScript}'`;
    exec(command, { timeout: 2100 }, () => {
      // Whether it succeeded or timed out, we resolve.
      // If it exited early (keys released), we proceed immediately.
      resolve();
    });
  });
}

// Map of ToolName -> Function
/* eslint-disable @typescript-eslint/no-explicit-any */
const TOOLS: Record<string, (input: any) => Promise<any>> = {
  "debug_log": async (input) => {
    console.log("[Tool:debug_log]", input.text);
    return { success: true, text: input.text };
  },
  "wait": async (input) => {
    const seconds = Number(input.seconds) || 1;
    console.log(`[Tool:wait] Sleeping ${seconds}s`);
    await wait(seconds);
    return { success: true };
  },
  "open_url": async (input) => {
    const url = input.url;
    if (url) {
      console.log(`[Tool:open_url] Opening ${url}`);
      await shell.openExternal(url);
      return { success: true };
    }
    return { success: false, text: "No URL" };
  },
  "open_app": async (input) => {
    const name = input.name;
    if (!name) return { success: false, text: "No app name" };
    console.log(`[Tool:open_app] Activating ${name}`);
    try {
      await execAppleScript(`tell application "${name}" to activate`);
      return { success: true };
    } catch (e) {
      return { success: false, text: String(e) };
    }
  },
  "copy_selection": async () => {
    console.log("[Tool:copy_selection] Waiting for key release then Cmd+C");
    try {
      // Critical: User might still be holding modifier keys from the hotkey trigger (e.g. Cmd+Alt+R).
      // If we send Cmd+C immediately, it registers as Cmd+Alt+C, which opens devtools or fails.
      // Wait for release smartly.
      await waitForModifiersRelease();
      await execAppleScript(`tell application "System Events" to keystroke "c" using command down`);
      // Additional wait to ensure clipboard updates before next step
      await wait(0.2);
      return { success: true };
    } catch (e) {
      return { success: false, text: String(e) };
    }
  },
  "paste_clipboard": async () => {
    console.log("[Tool:paste_clipboard] Cmd+V");
    try {
      await execAppleScript(`tell application "System Events" to keystroke "v" using command down`);
      return { success: true };
    } catch (e) {
      return { success: false, text: String(e) };
    }
  },
  "press_enter": async () => {
    console.log("[Tool:press_enter]");
    try {
      await execAppleScript(`tell application "System Events" to key code 36`);
      return { success: true };
    } catch (e) {
      return { success: false, text: String(e) };
    }
  },
  "focus_url_bar": async () => {
    console.log("[Tool:focus_url_bar]");
    try {
      await execAppleScript(`tell application "System Events" to keystroke "l" using command down`);
      return { success: true };
    } catch (e) {
      return { success: false, text: String(e) };
    }
  },
  "press_key": async (input) => {
    const key = input.key;
    const mods = input.mods || [];
    console.log(`[Tool:press_key] Pressing ${key} with mods: ${mods}`);

    if (!key) return { success: false, text: "No key provided" };

    // Construct AppleScript command
    // key code vs keystroke? Keystroke is easier for chars, key code for special keys.
    // Let's assume 'keystroke' for now.
    // Modifiers: "command down", "option down", "control down", "shift down"

    const modMap: Record<string, string> = {
      "cmd": "command down",
      "alt": "option down",
      "ctrl": "control down",
      "shift": "shift down"
    };

    const scriptMods = mods.map((m: string) => modMap[m]).filter(Boolean).join(", ");
    const usingPart = scriptMods ? ` using {${scriptMods}}` : "";

    // Handle special keys if needed, but 'keystroke' handles most generated by LLM (e.g. "c", "n")
    // If key is "enter" or "return", use key code 36
    let script = "";
    if (key.toLowerCase() === "enter" || key.toLowerCase() === "return") {
      script = `tell application "System Events" to key code 36${usingPart}`;
    } else {
      script = `tell application "System Events" to keystroke "${key}"${usingPart}`;
    }

    try {
      await execAppleScript(script);
      return { success: true };
    } catch (e) {
      return { success: false, text: String(e) };
    }
  },
  "append_to_clipboard": async (input) => {
    const text = input.text || "";
    const current = clipboard.readText();
    clipboard.writeText(current + "\n" + text);
    return { success: true };
  },
  "snap_window": async (input) => {
    const target = input.target || "maximize"; // left, right, top, bottom, maximize
    console.log(`[Tool:snap_window] Snapping to ${target}`);

    const display = screen.getPrimaryDisplay();
    const { x, y, width, height } = display.workArea; // excludes dock/menubar

    let newX = x;
    let newY = y;
    let newW = width;
    let newH = height;

    if (target === "left") {
      newW = width / 2;
    } else if (target === "right") {
      newX = x + (width / 2);
      newW = width / 2;
    } else if (target === "top") {
      newH = height / 2;
    } else if (target === "bottom") {
      newY = y + (height / 2);
      newH = height / 2;
    }

    // Integers only
    newX = Math.floor(newX);
    newY = Math.floor(newY);
    newW = Math.floor(newW);
    newH = Math.floor(newH);

    newW = Math.floor(newW);
    newH = Math.floor(newH);

    // If app_name is provided, target it specifically. Otherwise default to frontmost.
    // If app_name is provided, target it specifically via System Events (more reliable for non-scriptable apps)
    const appName = input.app_name;
    const processTarget = appName ? `process "${appName}"` : "first application process whose frontmost is true";

    // We always use System Events because many apps (Spotify, Chrome) don't support "set bounds" directly
    const script = `
      tell application "${appName || "System Events"}" to activate
      tell application "System Events"
        set targetProc to ${processTarget}
        set frontWindow to first window of targetProc
        set position of frontWindow to {${newX}, ${newY}}
        set size of frontWindow to {${newW}, ${newH}}
      end tell
    `;

    try {
      await execAppleScript(script);
      return { success: true };
    } catch (e) {
      return { success: false, text: String(e) };
    }
  },
  "replace_clipboard": async (input) => {
    const text = input.text || "";
    clipboard.writeText(text);
    return { success: true };
  },
  "transform_clipboard": async (input) => {
    const instruction = input.instruction || "Improve this text";
    console.log(`[Tool:transform_clipboard] ${instruction}`);

    try {
      const originalText = clipboard.readText();
      if (!originalText) return { success: false, text: "Clipboard empty" };

      // Call Local LLM Logic
      const result = await transformText(originalText, instruction);

      if (result) {
        clipboard.writeText(result);
        return { success: true, text: "Transformed clipboard" };
      } else {
        return { success: false, text: "No result from LLM" };
      }
    } catch (e) {
      console.error("Transform failed", e);
      return { success: false, text: String(e) };
    }
  }
};

// Function to execute a full plan (list of steps)
/* eslint-disable @typescript-eslint/no-explicit-any */
async function executePlan(steps: any[]) {
  console.log("--- Executing Plan ---");
  for (const step of steps) {
    const toolFn = TOOLS[step.tool];
    if (toolFn) {
      try {
        await toolFn(step.input || {});
      } catch (e) {
        console.error(`Error executing ${step.tool}:`, e);
      }
    } else {
      console.warn(`Unknown tool: ${step.tool}`);
    }
  }
  console.log("--- Plan Complete ---");
}

// TODO: In the next step, we will wire up the Global Hotkey listener.


/* eslint-disable @typescript-eslint/no-unused-vars */
// Active App Detection
// async function getActiveAppName(): Promise<string> {
//   try {
//     return await execAppleScript('tell application "System Events" to get name of first application process whose frontmost is true');
//   } catch (e) {
//     console.error("Failed to get active app:", e);
//     return "Unknown";
//   }
// }

// ----------------------------------------
// WORKFLOW TRIGGER LOGIC
// ----------------------------------------

// Cache workflows here so we can execute them immediately
/* eslint-disable @typescript-eslint/no-explicit-any */
const WORKFLOW_REGISTRY = new Map<string, any>();

async function triggerWorkflow(workflowId: string, workflowName: string) {
  console.log(`[Trigger] Workflow ${workflowId} (${workflowName}) triggered`);

  const workflow = WORKFLOW_REGISTRY.get(workflowId);
  if (!workflow) {
    console.error(`[Trigger] Workflow ${workflowId} not found in registry`);
    return;
  }

  // 1. Notify User (Overlay)
  if (overlayWin && !overlayWin.isDestroyed()) {
    overlayWin.webContents.send('trigger', {
      message: `Running: ${workflowName}`,
      hotkey: workflow.hotkey
    });
  }

  // 2. Execute Steps (Local Hand)
  let status: 'success' | 'error' = 'success';
  const results: unknown[] = [];

  if (workflow.steps && workflow.steps.length > 0) {
    // Capture results from execution if possible? 
    // executePlan currently logs but doesn't return results.
    // For now, we assume success unless it throws?
    // Let's wrap executePlan to be safe.
    try {
      await executePlan(workflow.steps);
    } catch (e) {
      status = 'error';
      console.error("Workflow execution failed", e);
    }
  } else {
    console.log("[Trigger] No steps to execute.");
  }

  // 3. Log Run to History
  const logEntry: RunLog = {
    id: crypto.randomUUID(),
    workflowId: workflowId,
    workflowName: workflowName,
    timestamp: Date.now(),
    status: status,
    results: results // Populating results would require refactoring executePlan
  };

  const history = runHistoryStore.get('history', []);
  history.push(logEntry);
  if (history.length > 50) history.shift(); // Keep last 50
  runHistoryStore.set('history', history);

  // 4. Notify Dashboard to refresh history
  if (dashboardWin && !dashboardWin.isDestroyed()) {
    dashboardWin.webContents.send('run-history-updated');
  }
}

// IPC to receive hotkey updates from Renderer (React)

// Initial Load
app.whenReady().then(() => {
  createTray();
  refreshRegistryAndHotkeys();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createDashboardWindow()
    createOverlayWindow()
  } else {
    dashboardWin?.show()
  }
})

app.on('before-quit', () => {
  isQuitting = true
})

