import { app, BrowserWindow, globalShortcut, screen } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
let overlayWin;
function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs")
    }
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}
function createOverlayWindow() {
  const OVERLAY_W = 260;
  const OVERLAY_H = 40;
  const MARGIN = 24;
  const display = screen.getPrimaryDisplay().workArea;
  const pillX = Math.round(display.x + (display.width - OVERLAY_W) / 2);
  const pillY = Math.round(display.y + display.height - OVERLAY_H - MARGIN);
  overlayWin = new BrowserWindow({
    x: pillX,
    y: pillY,
    width: OVERLAY_W,
    height: OVERLAY_H,
    frame: false,
    transparent: true,
    backgroundColor: "#00000000",
    resizable: false,
    movable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    focusable: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs")
    }
  });
  overlayWin.setIgnoreMouseEvents(false);
  if (VITE_DEV_SERVER_URL) {
    overlayWin.loadURL(`${VITE_DEV_SERVER_URL}?mode=overlay`);
  } else {
    overlayWin.loadFile(path.join(RENDERER_DIST, "index.html"), {
      search: "?mode=overlay"
    });
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
    overlayWin = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
    createOverlayWindow();
  }
});
app.whenReady().then(() => {
  createWindow();
  createOverlayWindow();
  const ok = globalShortcut.register("Command+Enter", () => {
    if (!overlayWin) return;
    overlayWin.webContents.send("overlay-loading", true);
    setTimeout(() => {
      overlayWin == null ? void 0 : overlayWin.webContents.send("overlay-loading", false);
    }, 1200);
  });
  if (!ok) {
    console.warn("Failed to register global shortcut Command+Enter");
  }
});
app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
