import { app, ipcMain } from "electron";
import * as Electron from "electron";
import * as path from "path";
import * as url from "url";
import * as fs from "fs";

class MainProcess {

    mainWindow: Electron.BrowserWindow;

    run() {
        app.on("ready", () => {
            this.createWindow();
        });
        app.on("window-all-closed", () => {
            if (process.platform !== "darwin") {
                app.quit();
            }
        });

        app.on("activate", () => {
            if (this.mainWindow === null) {
                this.createWindow();
            }
        });
    }

    private createWindow() {
        this.mainWindow = new Electron.BrowserWindow({ width: 1200, height: 800, show: false });
        this.mainWindow.webContents.on("did-finish-load", () => { this.mainWindow.show(); });
        const appUrl = url.format({
            pathname: path.join(__dirname, "index.html"),
            protocol: "file:",
            slashes: true
        });
        this.mainWindow.loadURL(appUrl);
        this.mainWindow.setMenu(null);

        if (process.argv.indexOf("--reload-on-change") !== -1) {
            fs.watch(__dirname, {}, (eventType, filename) => {
                this.mainWindow.loadURL(appUrl);
            });
        }

        if (process.argv.indexOf("--devtools") !== -1) {
            this.mainWindow.webContents.openDevTools({ mode: "undocked" });
        }

        this.mainWindow.on("closed", function () {
            this.mainWindow = null;
        });
    }
}

new MainProcess().run();
