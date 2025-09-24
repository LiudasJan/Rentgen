import { app, BrowserWindow, ipcMain } from "electron";
import axios from "axios";

let mainWindow: BrowserWindow | null = null;

import WebSocket from "ws"; // 👈 pridėk

import path from "path";

app.on("ready", () => {
  mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), // naudok path.join
      contextIsolation: true,  // labai svarbu
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL("http://localhost:3000");
});

// aiškiai tipizuojam ws
let ws: WebSocket | null = null;

app.on("ready", () => {
  mainWindow = new BrowserWindow({
    webPreferences: {
      preload: __dirname + "/preload.js",
    },
  });
  mainWindow.loadURL("http://localhost:3000");
});

// HTTP request handler (paliekam kaip buvo)
ipcMain.handle("http-request", async (_event, { url, method, headers, body }) => {
  try {
    const res = await axios({
      url,
      method,
      headers,
      data: body,
      validateStatus: () => true,
    });

    return {
      status: `${res.status} ${res.statusText}`,
      headers: res.headers,
      body: res.data.toString(),
    };
  } catch (err) {
    return { status: "Error", headers: {}, body: String(err) };
  }
});

// --- WSS HANDLERS ---
ipcMain.on("wss-connect", (event, { url, headers }) => {
  if (ws) {
    ws.close();
    ws = null;
  }

  ws = new WebSocket(url, { headers });

  ws.on("open", () => {
    event.sender.send("wss-event", { type: "open" });
  });

  ws.on("message", (data) => {
    event.sender.send("wss-event", { type: "message", data: data.toString() });
  });

  ws.on("error", (err) => {
    event.sender.send("wss-event", { type: "error", error: String(err) });
  });

  ws.on("close", () => {
    event.sender.send("wss-event", { type: "close" });
  });
});

ipcMain.on("wss-send", (_event, msg) => {
  if (ws) ws.send(msg);
});
