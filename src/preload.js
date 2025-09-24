import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  // HTTP
  sendHttp: (payload) => ipcRenderer.invoke("http-request", payload),

  // WSS
  connectWss: (payload) => ipcRenderer.send("wss-connect", payload),
  sendWss: (msg) => ipcRenderer.send("wss-send", msg),
  onWssEvent: (cb) => ipcRenderer.on("wss-event", (_e, data) => cb(data)),
});
