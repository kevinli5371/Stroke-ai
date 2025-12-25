import { app, BrowserWindow, screen } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import http from "node:http";
createRequire(import.meta.url);
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
    }
  });
  overlayWin.setAlwaysOnTop(true, "floating", 1);
  overlayWin.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
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
  if (dashboardWin) {
    dashboardWin.show();
    dashboardWin.focus();
  }
}
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
  }
});
app.whenReady().then(createWindows);
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
