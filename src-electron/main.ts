import { app, BrowserWindow, ipcMain } from "electron";
import axios from "axios";
import WebSocket from "ws";
import path from "path";
import { exec } from "child_process";

let mainWindow: BrowserWindow | null = null;
let ws: WebSocket | null = null;

// --- SAFETY HANDLERS ---
process.on("uncaughtException", (err) => {
  if ((err as any).code === "EPIPE") {
    console.warn("⚠️ Ignored EPIPE (Payload too large / broken pipe)");
  } else {
    console.error("❌ Uncaught exception:", err);
  }
});

process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled promise rejection:", reason);
});

// --- APP READY ---
app.on("ready", () => {
  console.log("✅ Main process started!");

  const preloadPath = app.isPackaged
    ? path.join(process.resourcesPath, "preload.js") // prod: ieško resources/preload.js
    : path.join(__dirname, "preload.js"); // dev: ieško dist-electron/preload.js

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.ELECTRON_START_URL) {
    // Dev režimas: React dev server
    mainWindow.loadURL(process.env.ELECTRON_START_URL);
  } else {
    // Prod režimas: statinis build'as
    mainWindow.loadFile(
      path.join(process.resourcesPath, "build", "index.html")
    );
  }
});

// --- HTTP HANDLER ---
ipcMain.handle(
  "http-request",
  async (_event, { url, method, headers, body }) => {
    try {
      const res = await axios({
        url,
        method,
        headers,
        data: body,
        maxBodyLength: Infinity, // leisti didelį body
        maxContentLength: Infinity,
        responseType: "arraybuffer", // gaut galim binary ar tekstą - mes konvertuosim rankomis
        validateStatus: () => true,
      });

      // Convert response data (ArrayBuffer/Buffer/JSON/etc) to displayable string
      let responseBody: string;
      const contentType =
        (res.headers &&
          (res.headers["content-type"] || res.headers["Content-Type"])) ||
        "";

      // res.data is an ArrayBuffer (axios with responseType arraybuffer returns ArrayBuffer)
      const data = res.data;

      try {
        // If it's ArrayBuffer or Buffer -> try decode as utf-8 text
        if (
          data instanceof ArrayBuffer ||
          (data &&
            typeof data === "object" &&
            typeof (data as any).byteLength === "number")
        ) {
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
          responseBody =
            typeof data === "object"
              ? JSON.stringify(data, null, 2)
              : String(data);
        }
      } catch {
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
    } catch (err: any) {
      // 👇 tvarkingas EPIPE gaudymas
      if (err.code === "EPIPE") {
        return {
          status: "413 Payload Too Large (EPIPE)",
          headers: {},
          body: "",
        };
      }
      return { status: "Error", headers: {}, body: String(err) };
    }
  }
);

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

// --- PING HANDLER ---
ipcMain.handle("ping-host", async (_event, host: string) => {
  return new Promise<number>((resolve, reject) => {
    const platform = process.platform;
    const cmd =
      platform === "win32" ? `ping -n 1 ${host}` : `ping -c 1 ${host}`;

    const start = Date.now();
    exec(cmd, (error) => {
      if (error) return reject(error);
      const time = Date.now() - start;
      resolve(time);
    });
  });
});
