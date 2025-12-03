import { app, BrowserWindow, screen, globalShortcut } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null
let overlayWin: BrowserWindow | null
let awaitingNextKey = false
let tempKeysTimeout: NodeJS.Timeout | null = null
let registeredTempKeys: string[] = []

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

function createOverlayWindow() {
  // position overlay centered on the bottom of the primary work area
  const OVERLAY_W = 260
  const OVERLAY_H = 40
  const MARGIN = 24
  const display = screen.getPrimaryDisplay().workArea
  const pillX = Math.round(display.x + (display.width - OVERLAY_W) / 2)
  const pillY = Math.round(display.y + display.height - OVERLAY_H - MARGIN)

  overlayWin = new BrowserWindow({
    x: pillX,
    y: pillY,
    width: OVERLAY_W,
    height: OVERLAY_H,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    resizable: false,
    movable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    focusable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  overlayWin.setIgnoreMouseEvents(false)

  if (VITE_DEV_SERVER_URL) {
    overlayWin.loadURL(`${VITE_DEV_SERVER_URL}?mode=overlay`)
  } else {
    overlayWin.loadFile(path.join(RENDERER_DIST, 'index.html'), {
      search: '?mode=overlay',
    })
  }
}


// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
    overlayWin = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
    createOverlayWindow()
  }
})

app.whenReady().then(() => {
  createWindow()
  createOverlayWindow()

  // Global: Command+Enter triggers the “loading” animation
  const ok = globalShortcut.register('Command+Enter', () => {
    if (!overlayWin) return

    // tell overlay to start animating
    overlayWin.webContents.send('overlay-loading', true)

    // TODO: in the real app, stop when the workflow actually finishes
    // For now, fake “done” after 1.2s
    setTimeout(() => {
      overlayWin?.webContents.send('overlay-loading', false)
    }, 1200)
  })

  if (!ok) {
    console.warn('Failed to register global shortcut Command+Enter')
  }
})

// clean up shortcuts when app quits
app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})
