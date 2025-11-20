const { contextBridge } = require('electron');

// Expose protected methods that allow the renderer process to use
// the device ID generation
contextBridge.exposeInMainWorld('electronAPI', {
  getDeviceId: () => {
    // Use Electron's machine ID for better device binding
    const os = require('os');
    const crypto = require('crypto');
    const machineId = os.hostname() + os.platform() + os.arch();
    return crypto.createHash('sha256').update(machineId).digest('hex').substring(0, 16);
  },
});

