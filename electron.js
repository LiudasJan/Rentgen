const { app, BrowserWindow } = require("electron");
const path = require("path");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  if (app.isPackaged) {
    // Atidarys React build/index.html
  const url = require("url");

  win.loadURL(
    url.format({
      pathname: path.join(__dirname, "build", "index.html"),
      protocol: "file:",
      slashes: true
    })
  );

  } else {
    // Dev režimas – jungiasi prie react dev server
    win.loadURL("http://localhost:3000");
    win.webContents.openDevTools();
  }
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
