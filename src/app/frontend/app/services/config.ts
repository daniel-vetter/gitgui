import { Injectable } from "@angular/core";
import { ConfigData } from "../model/config";
import { Platform } from "./platform";
import { Path } from "./path";
import { FileSystem } from "./file-system";

@Injectable()
export class Config {

    private config: ConfigData;

    constructor(private platform: Platform, private fileSystem: FileSystem) {}

    get(): ConfigData {
        if (this.config) {
            return this.config;
        }
        const configFilePath = this.configFilePath;

        if (!this.fileSystem.exists(configFilePath)) {
            console.warn("Configuration file was not found. Default configuration will be used.");
            this.config = new ConfigData();
            return this.config;
        }
        this.config = this.fileSystem.readJson(configFilePath);
        return this.config;
    }

    save(sync = false) {
        if (sync) {
            this.fileSystem.saveJson(this.configFilePath, this.config);
        } else {
            this.fileSystem.saveJsonAsync(this.configFilePath, this.config);
        }
    }

    private get configFilePath() {
        return Path.combine(this.platform.appDataDirectory, "config.json");
    }
}
