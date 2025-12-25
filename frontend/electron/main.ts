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

