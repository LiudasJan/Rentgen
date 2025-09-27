"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
console.log("✅ Preload loaded");
electron_1.contextBridge.exposeInMainWorld("electronAPI", {
    // HTTP
    sendHttp: (payload) => electron_1.ipcRenderer.invoke("http-request", payload),
    // WSS
    connectWss: (payload) => electron_1.ipcRenderer.send("wss-connect", payload),
    sendWss: (msg) => electron_1.ipcRenderer.send("wss-send", msg),
    onWssEvent: (cb) => electron_1.ipcRenderer.on("wss-event", (_e, data) => cb(data)),
});
