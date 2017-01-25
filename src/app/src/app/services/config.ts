import { Injectable } from "@angular/core";
import * as Rx from "rxjs";
const remote = (<any>window).require("electron").remote;

@Injectable()
export class Config {

    config: any;

    get(): ConfigData {
        if (!this.config) {
            this.config = remote.getGlobal("config");
        }
        if (!this.config.current) {
            console.warn("Configuration file could not be loaded. Default configuration will be used.");
            this.config.current = new ConfigData();
        }
        console.log(this.config);
        return this.config.current;
    }
}

export class ConfigData {
    loadLastRepositoryOnStartup: boolean = false;
    recentRepositories: string[] = [];
}
