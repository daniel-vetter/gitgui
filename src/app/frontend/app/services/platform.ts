import { Path } from "./path";
import { FileSystem } from "./file-system";
import { Injectable } from "@angular/core";
const remote = (<any>window).require("electron").remote;
const process = remote.process;

@Injectable()
export class Platform {

    constructor(private fileSystem: FileSystem) {}

    get appDataDirectory(): string {
        let baseDir = "";
        if (process.platform === "win32") {
            baseDir = Path.combine(process.env["LOCALAPPDATA"], "GitGui");
        } else if (process.platform === "linux") {
            baseDir = Path.combine(process.env["HOME"], ".gitgui");
        } else {
            throw new Error("TODO: Find user app data directory for other platforms than win32 and linux.")
        }
        this.fileSystem.ensureDirectoryExists(baseDir);
        return baseDir;
    }

    static getCurrent(): PlatformType {
        if (process.platform === "win32") {
            return "Windows";
        }
        if (process.platform === "linux") {
            return "Linux";
        }
        throw new Error("Unsupported platform");
    }

    get current(): PlatformType {
        return Platform.getCurrent();
    }
}

export type PlatformType = "Windows" | "Linux";
