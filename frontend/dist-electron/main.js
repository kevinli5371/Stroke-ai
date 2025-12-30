import { app, BrowserWindow, ipcMain, globalShortcut, clipboard, screen, shell } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import http from "node:http";
import { exec } from "node:child_process";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let dashboardWin;
let overlayWin;
function createDashboardWindow() {
  dashboardWin = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs")
    }
  });
  if (VITE_DEV_SERVER_URL) {
    dashboardWin.loadURL(VITE_DEV_SERVER_URL);
  } else {
    dashboardWin.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}
const SERVER_PORT = 4444;
function startLocalServer() {
  const server = http.createServer((req, res) => {
    if (req.method === "POST" && req.url === "/trigger") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });
      req.on("end", () => {
        try {
          const data = JSON.parse(body);
          const message = data.message || "triggered";
          console.log(`[Electron Server] Received trigger: ${message}`);
          if (overlayWin && !overlayWin.isDestroyed()) {
            overlayWin.webContents.send("trigger", data);
          } else {
            console.log("[Electron Server] Overlay window not found or destroyed");
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ status: "ok" }));
        } catch (e) {
          console.error("Failed to parse trigger body", e);
          res.writeHead(400);
          res.end(JSON.stringify({ status: "error", message: "Invalid JSON" }));
        }
      });
    } else {
      res.writeHead(404);
      res.end();
    }
  });
  server.on("error", (e) => {
    console.error(`[Electron Server] Failed to start server on port ${SERVER_PORT}:`, e);
  });
  server.listen(SERVER_PORT, "127.0.0.1", () => {
    console.log(`[Electron Main] Listening for triggers on http://127.0.0.1:${SERVER_PORT}`);
  });
}
function createOverlayWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  const windowWidth = 300;
  const windowHeight = 60;
  const x = Math.round(width / 2 - windowWidth / 2);
  const y = Math.round(height - 80);
  console.log(`Creating overlay at x=${x}, y=${y}, width=${width}, height=${height}`);
  overlayWin = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    x,
    y,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    hasShadow: false,
    resizable: false,
    focusable: false,
    // Prevent stealing focus
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs")
    },
    type: "panel",
    minimizable: false
  });
  overlayWin.setAlwaysOnTop(true, "floating", 1);
  overlayWin.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  overlayWin.setIgnoreMouseEvents(true);
  if (VITE_DEV_SERVER_URL) {
    const url = `${VITE_DEV_SERVER_URL}?overlay`;
    console.log(`Loading overlay URL: ${url}`);
    overlayWin.loadURL(url);
  } else {
    overlayWin.loadFile(path.join(RENDERER_DIST, "index.html"), { search: "?overlay" });
  }
}
function createWindows() {
  createDashboardWindow();
  createOverlayWindow();
  startLocalServer();
  if (process.platform === "darwin") {
    app.dock.show();
  }
  if (dashboardWin) {
    dashboardWin.show();
    dashboardWin.focus();
  }
}
app.on("before-quit", () => {
  console.log("[Electron Main] App is quitting...");
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    dashboardWin = null;
    overlayWin = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindows();
  } else {
    if (!dashboardWin || dashboardWin.isDestroyed()) {
      createDashboardWindow();
      dashboardWin == null ? void 0 : dashboardWin.show();
    } else {
      if (dashboardWin.isMinimized()) dashboardWin.restore();
      dashboardWin.show();
      dashboardWin.focus();
    }
  }
});
app.whenReady().then(createWindows);
function execAppleScript(script) {
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
function wait(seconds) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1e3));
}
const TOOLS = {
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
      const res = await fetch(`http://127.0.0.1:8000/api/transform`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: originalText, instruction })
      });
      const data = await res.json();
      if (data.status === "success" && data.result) {
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
async function executePlan(steps) {
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
async function getActiveAppName() {
  try {
    return await execAppleScript('tell application "System Events" to get name of first application process whose frontmost is true');
  } catch (e) {
    console.error("Failed to get active app:", e);
    return "Unknown";
  }
}
const WORKFLOW_REGISTRY = /* @__PURE__ */ new Map();
async function triggerWorkflow(workflowId, workflowName) {
  console.log(`[Trigger] Workflow ${workflowId} (${workflowName}) triggered`);
  const workflow = WORKFLOW_REGISTRY.get(workflowId);
  if (!workflow) {
    console.error(`[Trigger] Workflow ${workflowId} not found in registry`);
    return;
  }
  const activeApp = await getActiveAppName();
  const clipboardText = clipboard.readText();
  console.log(`[Context] App: ${activeApp}, Clipboard: ${clipboardText.slice(0, 20)}...`);
  if (overlayWin && !overlayWin.isDestroyed()) {
    overlayWin.webContents.send("trigger", {
      message: `Running: ${workflowName}`,
      hotkey: workflow.hotkey
    });
  }
  if (workflow.steps && workflow.steps.length > 0) {
    await executePlan(workflow.steps);
  } else {
    console.log("[Trigger] No steps to execute.");
  }
}
ipcMain.on("update-hotkeys", (_event, workflows) => {
  console.log(`[Hotkeys] Received ${workflows.length} workflows. Updating global shortcuts...`);
  globalShortcut.unregisterAll();
  WORKFLOW_REGISTRY.clear();
  workflows.forEach((wf) => {
    WORKFLOW_REGISTRY.set(wf.id, wf);
    if (wf.hotkey && wf.hotkey.key) {
      const mods = wf.hotkey.mods || [];
      if (mods.length === 0) return;
      const mapMod = (m) => {
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
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
