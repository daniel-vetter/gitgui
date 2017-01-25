import { Injectable } from "@angular/core";
import * as Rx from "rxjs";
const remote = (<any>window).require("electron").remote;
const ipcRenderer = (<any>window).require("electron").ipcRenderer;

@Injectable()
export class Config {

    private config: ConfigData;

    get(): ConfigData {
        if (this.config) {
            return this.config;
        }

        let jsonData = remote.getGlobal("config").data;
        if (!jsonData) {
            console.warn("Configuration file could not be loaded. Default configuration will be used.");
            this.config = new ConfigData();
        } else {
            this.config = JSON.parse(jsonData);
        }
        return this.config;
    }

    save() {
        remote.getGlobal("config").data = JSON.stringify(this.config);
        ipcRenderer.send("save-config");
    }
}

export class ConfigData {
    loadLastRepositoryOnStartup: boolean = false;
    recentRepositories: string[] = [];
}
