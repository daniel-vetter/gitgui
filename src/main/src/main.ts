import { app, ipcMain } from "electron";
import * as Electron from "electron";
import * as path from "path";
import * as url from "url";
import * as fs from "fs";

class MainProcess {

    mainWindow: Electron.BrowserWindow;

    run() {
        app.on("ready", () => {
            this.initConfig();
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

    private initConfig() {
        global["config"] = { current: undefined };
        try {
            global["config"]["data"] = fs.readFileSync(this.getConfigFilePath(), "utf8");
        } catch (err) {
            console.warn("Configuration file could not be loaded. Default configuration will be used.");
        }

        ipcMain.on("save-config", () => {
            fs.writeFileSync(this.getConfigFilePath(), global["config"]["data"], { encoding: "utf8" });
        });
    }

    private getConfigFilePath() {
        if (process.platform !== "win32") {
            throw new Error("TODO: Find user app data directory for other platforms than win32.")
        }
        const baseDir = path.join(process.env["LOCALAPPDATA"], "GitGui");
        if (!fs.existsSync(baseDir)) {
            fs.mkdirSync(baseDir);
        }
        return path.join(baseDir, "config.json");
    }
}

new MainProcess().run();
