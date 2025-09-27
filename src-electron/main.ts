import { app, BrowserWindow, ipcMain } from "electron";
import axios from "axios";
import WebSocket from "ws";
import path from "path";

let mainWindow: BrowserWindow | null = null;
let ws: WebSocket | null = null;

app.on("ready", () => {
console.log("✅ Main process started!");

  const preloadPath = app.isPackaged
    // copied by extraResources above → .../Resources/preload.js
    ? path.join(process.resourcesPath, "preload.js")
    // dev: compiled next to main.js
    : path.join(__dirname, "preload.js");

  mainWindow = new BrowserWindow({
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

// dev vs prod skirtingi URL
if (process.env.ELECTRON_START_URL) {
  mainWindow.loadURL(process.env.ELECTRON_START_URL);
} else {
  mainWindow.loadFile(path.join(__dirname, "../build/index.html"));
}

});

// --- HTTP HANDLER ---
ipcMain.handle("http-request", async (_event, { url, method, headers, body }) => {
  try {
    const res = await axios({
      url,
      method,
      headers,
      data: body,
      responseType: "arraybuffer", // gaut galim binary ar tekstą - mes konvertuosim rankomis
      validateStatus: () => true,
    });

    // Convert response data (ArrayBuffer/Buffer/JSON/etc) to displayable string
    let responseBody: string;
    const contentType = (res.headers && (res.headers['content-type'] || res.headers['Content-Type'])) || "";

    // res.data is an ArrayBuffer (axios with responseType arraybuffer returns ArrayBuffer)
    const data = res.data;

    try {
      // If it's ArrayBuffer or Buffer -> try decode as utf-8 text
      if (data instanceof ArrayBuffer || (data && typeof data === 'object' && typeof (data as any).byteLength === 'number')) {
        // convert ArrayBuffer/TypedArray/Buffer to string
        const uint8 = new Uint8Array(data as any);
        // try text decoder
        responseBody = new TextDecoder().decode(uint8);
        // if looks like JSON and content-type indicates JSON, pretty-print
        if (contentType.includes("application/json")) {
          try {
            const parsed = JSON.parse(responseBody);
            responseBody = JSON.stringify(parsed, null, 2);
          } catch {
            /* keep as text */
          }
        }
      } else if (typeof data === "string") {
        responseBody = data;
      } else {
        // fallback: try stringify object
        responseBody = typeof data === "object" ? JSON.stringify(data, null, 2) : String(data);
      }
    } catch (e) {
      // ultimate fallback
      try {
        responseBody = String(data);
      } catch {
        responseBody = "[unprintable response]";
      }
    }

    return {
      status: `${res.status} ${res.statusText}`,
      headers: res.headers,
      body: responseBody,
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
