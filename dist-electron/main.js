"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const axios_1 = __importDefault(require("axios"));
const ws_1 = __importDefault(require("ws"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
let mainWindow = null;
let ws = null;
process.on("uncaughtException", (err) => {
    if (err.code === "EPIPE") {
        console.warn("⚠️ Ignored EPIPE (Payload too large / broken pipe)");
    }
    else {
        console.error("❌ Uncaught exception:", err);
    }
});
process.on("unhandledRejection", (reason) => {
    console.error("❌ Unhandled promise rejection:", reason);
});
electron_1.app.on("ready", () => {
    console.log("✅ Main process started!");
    const preloadPath = electron_1.app.isPackaged
        ? path_1.default.join(process.resourcesPath, "preload.js")
        : path_1.default.join(__dirname, "preload.js");
    mainWindow = new electron_1.BrowserWindow({
        webPreferences: {
            preload: preloadPath,
            contextIsolation: true,
            nodeIntegration: false,
        },
    });
    // dev vs prod skirtingi URL
    if (process.env.ELECTRON_START_URL) {
        mainWindow.loadURL(process.env.ELECTRON_START_URL);
    }
    else {
        mainWindow.loadFile(path_1.default.join(__dirname, "../build/index.html"));
    }
});
// --- HTTP HANDLER ---
electron_1.ipcMain.handle("http-request", async (_event, { url, method, headers, body }) => {
    try {
        const res = await (0, axios_1.default)({
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
        let responseBody;
        const contentType = (res.headers &&
            (res.headers["content-type"] || res.headers["Content-Type"])) ||
            "";
        // res.data is an ArrayBuffer (axios with responseType arraybuffer returns ArrayBuffer)
        const data = res.data;
        try {
            // If it's ArrayBuffer or Buffer -> try decode as utf-8 text
            if (data instanceof ArrayBuffer ||
                (data &&
                    typeof data === "object" &&
                    typeof data.byteLength === "number")) {
                // convert ArrayBuffer/TypedArray/Buffer to string
                const uint8 = new Uint8Array(data);
                // try text decoder
                responseBody = new TextDecoder().decode(uint8);
                // if looks like JSON and content-type indicates JSON, pretty-print
                if (contentType.includes("application/json")) {
                    try {
                        const parsed = JSON.parse(responseBody);
                        responseBody = JSON.stringify(parsed, null, 2);
                    }
                    catch {
                        /* keep as text */
                    }
                }
            }
            else if (typeof data === "string") {
                responseBody = data;
            }
            else {
                // fallback: try stringify object
                responseBody =
                    typeof data === "object"
                        ? JSON.stringify(data, null, 2)
                        : String(data);
            }
        }
        catch {
            // ultimate fallback
            try {
                responseBody = String(data);
            }
            catch {
                responseBody = "[unprintable response]";
            }
        }
        return {
            status: `${res.status} ${res.statusText}`,
            headers: res.headers,
            body: responseBody,
        };
    }
    catch (err) {
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
});
// --- WSS HANDLERS ---
electron_1.ipcMain.on("wss-connect", (event, { url, headers }) => {
    if (ws) {
        ws.close();
        ws = null;
    }
    ws = new ws_1.default(url, { headers });
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
electron_1.ipcMain.on("wss-send", (_event, msg) => {
    if (ws)
        ws.send(msg);
});
// --- PING HANDLER ---
electron_1.ipcMain.handle("ping-host", async (_event, host) => {
    return new Promise((resolve, reject) => {
        const platform = process.platform;
        const cmd = platform === "win32" ? `ping -n 1 ${host}` : `ping -c 1 ${host}`;
        const start = Date.now();
        (0, child_process_1.exec)(cmd, (error) => {
            if (error)
                return reject(error);
            const time = Date.now() - start;
            resolve(time);
        });
    });
});
