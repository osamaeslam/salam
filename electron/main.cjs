const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const express = require('express');

// Determine if we are running in development or packaged production
const isDev = !app.isPackaged;
const PORT = process.env.PORT || 3000;

let mainWindow = null;
let serverInstance = null;

// Get Local IPv4 Address for LAN Multi-Device connection
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const devName in interfaces) {
    const iface = interfaces[devName];
    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i];
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
        return alias.address;
      }
    }
  }
  return '127.0.0.1';
}

// Start Internal Offline HTTP / LAN Server inside Electron
function startInternalLanServer() {
  const serverApp = express();
  const distPath = path.join(__dirname, '../dist');

  // Serve static assets
  if (fs.existsSync(distPath)) {
    serverApp.use(express.static(distPath));
    serverApp.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    // If running in dev without dist
    serverApp.get('/', (req, res) => {
      res.send(`
        <html dir="rtl" style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h2>نظام Green Lab Soft - السيرفر المحلي نشط</h2>
          <p>يتم الآن تشغيل النظام عبر شبكة المعمل الداخلية بدون إنترنت.</p>
        </html>
      `);
    });
  }

  serverInstance = serverApp.listen(PORT, '0.0.0.0', () => {
    const localIp = getLocalIpAddress();
    console.log(`[GreenLab LAN Server] Running on http://${localIp}:${PORT} and http://localhost:${PORT}`);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    title: 'Green Lab Soft - نظام إدارة المختبرات ومراكز الأشعة',
    icon: path.join(__dirname, '../dist/favicon.ico'),
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
  });

  // Maximize by default for lab reception/doctor desktop feel
  mainWindow.maximize();

  // In production, load the built dist folder; in dev, load Vite port 3000
  if (isDev) {
    mainWindow.loadURL(`http://localhost:${PORT}`);
  } else {
    const indexPath = path.join(__dirname, '../dist/index.html');
    if (fs.existsSync(indexPath)) {
      mainWindow.loadFile(indexPath);
    } else {
      mainWindow.loadURL(`http://localhost:${PORT}`);
    }
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App lifecycle
app.whenReady().then(() => {
  startInternalLanServer();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (serverInstance) {
    serverInstance.close();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Communication with React UI
ipcMain.handle('get-system-info', async () => {
  return {
    isDesktop: true,
    platform: process.platform,
    localIp: getLocalIpAddress(),
    port: PORT,
    fullLanUrl: `http://${getLocalIpAddress()}:${PORT}`,
    dataDir: app.getPath('userData'),
    appVersion: app.getVersion ? app.getVersion() : '1.0.0',
  };
});

// Silent or Standard A4 / Thermal Receipt Print
ipcMain.handle('print-document', async (event, options = {}) => {
  if (!mainWindow) return { success: false, error: 'No active window' };
  try {
    const printOptions = {
      silent: options.silent || false,
      printBackground: true,
      deviceName: options.printerName || '',
      pageSize: options.pageSize || 'A4',
    };
    await mainWindow.webContents.print(printOptions);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Database backup save dialog
ipcMain.handle('choose-backup-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory', 'createDirectory'],
    title: 'اختر مسار حفظ النسخة الاحتياطية لقاعدة البيانات (فلاشة USB أو قرص خارجي)',
  });
  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }
  return result.filePaths[0];
});
