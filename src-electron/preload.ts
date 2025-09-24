import { contextBridge, ipcRenderer } from "electron";

console.log("✅ Preload loaded");

contextBridge.exposeInMainWorld("electronAPI", {
  // HTTP
  sendHttp: (payload: any) => ipcRenderer.invoke("http-request", payload),

  // WSS
  connectWss: (payload: any) => ipcRenderer.send("wss-connect", payload),
  sendWss: (msg: any) => ipcRenderer.send("wss-send", msg),
  onWssEvent: (cb: (data: any) => void) =>
    ipcRenderer.on("wss-event", (_e, data) => cb(data)),
});
