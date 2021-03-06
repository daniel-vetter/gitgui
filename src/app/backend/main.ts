import { app, ipcMain } from "electron";
import * as Electron from "electron";
import * as path from "path";
import * as url from "url";
import * as fs from "fs";
import { ProcessStartRequestHandler } from "./process-start-request-handler";
import { Bootstrapper } from "./bootstrapper";
const child_process = require("child_process");

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
        this.mainWindow = new Electron.BrowserWindow({ width: 1600, height: 1000, show: false });
        this.mainWindow.webContents.on("did-finish-load", () => { this.mainWindow.show(); });
        const appUrl = url.format({
            pathname: path.join(__dirname, "app/index.html"),
            protocol: "file:",
            slashes: true
        });
        this.mainWindow.setMenu(<any>null);
        this.mainWindow.loadURL(appUrl);

        if (process.argv.indexOf("--reload-on-change") !== -1) {
            fs.watch(__dirname, {}, (eventType, filename) => {
                this.mainWindow.loadURL(appUrl);
            });
            fs.watch(path.join(__dirname, "app"), {}, (eventType, filename) => {
                this.mainWindow.loadURL(appUrl);
            });
        }

        if (process.argv.indexOf("--devtools") !== -1) {
            this.mainWindow.webContents.openDevTools({ mode: "undocked" });
        }

        this.mainWindow.on("closed", () => {
            this.mainWindow = <any>null;
        });
    }
}

new Bootstrapper().bootstrap();
new MainProcess().run();
