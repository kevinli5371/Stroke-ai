import { app, BrowserWindow, screen } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import http from 'node:http'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let dashboardWin: BrowserWindow | null
let overlayWin: BrowserWindow | null

function createDashboardWindow() {
  dashboardWin = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
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
}

// -- HTTP SERVER TO LISTEN FOR TRIGGERS --
const SERVER_PORT = 4444;

function startLocalServer() {
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

  server.on('error', (e) => {
    console.error(`[Electron Server] Failed to start server on port ${SERVER_PORT}:`, e);
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
// LOCAL HANDS IMPLEMENTATION
// ----------------------------------------

import { exec } from 'node:child_process'
import { shell, clipboard } from 'electron'

function execAppleScript(script: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const escapedScript = script.replace(/'/g, "'\\''");
    const command = `osascript -e '${escapedScript}'`;
    exec(command, (error, stdout, stderr) => {
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

// Map of ToolName -> Function
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
    console.log("[Tool:copy_selection] Cmd+C");
    try {
      // Clear clipboard first to ensure we catch new copy? 
      // Or just copy.
      await execAppleScript(`tell application "System Events" to keystroke "c" using command down`);
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
  "append_to_clipboard": async (input) => {
    const text = input.text || "";
    const current = clipboard.readText();
    clipboard.writeText(current + "\n" + text);
    return { success: true };
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

      // Call Cloud Brain API (Port 8000)
      const res = await fetch(`http://127.0.0.1:8000/api/transform`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: originalText, instruction })
      });

      const data = await res.json();
      if (data.status === 'success' && data.result) {
        clipboard.writeText(data.result);
        return { success: true, text: "Transformed clipboard" };
      } else {
        return { success: false, text: data.message || "Unknown error" };
      }
    } catch (e) {
      console.error("Transform failed", e);
      return { success: false, text: String(e) };
    }
  }
};

// Function to execute a full plan (list of steps)
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

import { globalShortcut } from 'electron'

// Active App Detection
async function getActiveAppName(): Promise<string> {
  try {
    return await execAppleScript('tell application "System Events" to get name of first application process whose frontmost is true');
  } catch (e) {
    console.error("Failed to get active app:", e);
    return "Unknown";
  }
}

// ----------------------------------------
// WORKFLOW TRIGGER LOGIC
// ----------------------------------------

// Cache workflows here so we can execute them immediately
const WORKFLOW_REGISTRY = new Map<string, any>();

async function triggerWorkflow(workflowId: string, workflowName: string) {
  console.log(`[Trigger] Workflow ${workflowId} (${workflowName}) triggered`);

  const workflow = WORKFLOW_REGISTRY.get(workflowId);
  if (!workflow) {
    console.error(`[Trigger] Workflow ${workflowId} not found in registry`);
    return;
  }

  // 1. Capture Context
  const activeApp = await getActiveAppName();
  const clipboardText = clipboard.readText();

  console.log(`[Context] App: ${activeApp}, Clipboard: ${clipboardText.slice(0, 20)}...`);

  // 2. Notify User (Overlay)
  if (overlayWin && !overlayWin.isDestroyed()) {
    overlayWin.webContents.send('trigger', {
      message: `Running: ${workflowName}`,
      hotkey: workflow.hotkey
    });
  }

  // 3. Execute Steps (Local Hand)
  if (workflow.steps && workflow.steps.length > 0) {
    await executePlan(workflow.steps);
  } else {
    console.log("[Trigger] No steps to execute.");
  }
}

// IPC to receive hotkey updates from Renderer (React)
import { ipcMain } from 'electron'

ipcMain.on('update-hotkeys', (_event, workflows: any[]) => {
  console.log(`[Hotkeys] Received ${workflows.length} workflows. Updating global shortcuts...`);
  globalShortcut.unregisterAll();
  WORKFLOW_REGISTRY.clear();

  workflows.forEach(wf => {
    // Cache it
    WORKFLOW_REGISTRY.set(wf.id, wf);

    if (wf.hotkey && wf.hotkey.key) {
      const mods = wf.hotkey.mods || []; // e.g. ["cmd", "alt"]
      if (mods.length === 0) return;

      // Electron accelerator format: "CommandOrControl+Alt+G"
      const mapMod = (m: string) => {
        if (m === "cmd") return "Command";
        if (m === "alt") return "Alt";
        if (m === "ctrl") return "Control";
        if (m === "shift") return "Shift";
        return m;
      };

      const accelerator = [...mods.map(mapMod), wf.hotkey.key].join("+");

      try {
        const success = globalShortcut.register(accelerator, () => {
          triggerWorkflow(wf.id, wf.name);
        });
        if (!success) {
          console.warn(`[Hotkeys] Failed to register ${accelerator}`);
        } else {
          console.log(`[Hotkeys] Registered ${accelerator} for ${wf.name}`);
        }
      } catch (err) {
        console.error(`[Hotkeys] Error registering ${accelerator}:`, err);
      }
    }
  });
});

