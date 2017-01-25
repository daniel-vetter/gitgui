import { Injectable } from "@angular/core";
import * as Rx from "rxjs";
import { ConfigData } from '../model/config';
const remote = (<any>window).require("electron").remote;
const fs = remote.require('fs');
const process = remote.process;

@Injectable()
export class Config {

    private config: ConfigData;

    get(): ConfigData {
        if (this.config) {
            return this.config;
        }

        debugger;

        const configFilePath = this.getConfigFilePath();

        if (!fs.existsSync(configFilePath)) {
            console.warn("Configuration file was not found. Default configuration will be used.");
            this.config = new ConfigData();
            return this.config;
        }

        const jsonData = fs.readFileSync(configFilePath, "utf8");
        this.config = JSON.parse(jsonData);
        return this.config;
    }

    save(sync: boolean = false) {
        const data =  JSON.stringify(this.config, undefined, 2);
        if (sync) {
            fs.writeFileSync(this.getConfigFilePath(), data, { encoding: "utf8" });
        } else {
            fs.writeFile(this.getConfigFilePath(), data, { encoding: "utf8" }, () => { });
        }
    }

    private getConfigFilePath() {
        if (process.platform !== "win32") {
            throw new Error("TODO: Find user app data directory for other platforms than win32.")
        }
        //TODO: proper path concatenation
        const baseDir = process.env["LOCALAPPDATA"] + "\\GitGui";
        if (!fs.existsSync(baseDir)) {
            fs.mkdirSync(baseDir);
        }
        return baseDir + "\\config.json";
    }
}
