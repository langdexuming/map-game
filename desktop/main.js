/**
 * 小小特工 · 出行特工版 · Electron 主进程
 * @author make java
 * @since 2026-06-28
 */
const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

const isDev = process.env.MAP_GAME_DEV === '1';
const devUrl = process.env.MAP_GAME_URL || 'http://localhost:3001';

function createWindow() {
  const win = new BrowserWindow({
    width: 1366,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: '小小特工 · 出行特工版',
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  if (isDev) {
    win.loadURL(devUrl);
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
