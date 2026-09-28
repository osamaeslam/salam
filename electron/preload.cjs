const { contextBridge, ipcRenderer } = require('electron');

// Expose safe desktop APIs to React frontend
contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  printDocument: (options) => ipcRenderer.invoke('print-document', options),
  chooseBackupFolder: () => ipcRenderer.invoke('choose-backup-folder'),
});
