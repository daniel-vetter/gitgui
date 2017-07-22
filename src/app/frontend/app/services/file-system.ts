const remote = (<any>window).require("electron").remote;
const fs = remote.require("fs");
const process = remote.require("process");
import { Path } from "./path";
import { FSEXTRA_REMOVE_DIRECTORY } from "../../../shared/ipc-interfaces/fs-extra";

const { ipcRenderer } = (<any>window).require("electron");

export class FileSystem {

    ensureDirectoryExists(path: string): void {
        if (!this.exists(path))
            this.createDirectory(path);
    }

    createDirectory(path: string): void {
        fs.mkdir(path);
    }

    deleteDirectory(path: string): void {
        ipcRenderer.sendSync(FSEXTRA_REMOVE_DIRECTORY, { path: path });
    }

    exists(path: string): boolean {
        return fs.existsSync(path);
    }

    getDirectories(path: string): string[] {
        return fs.readdirSync(path).filter((file: string) => fs.statSync(Path.combine(path, file)).isDirectory());
    }

    readJson(path: string): any {
        return JSON.parse(fs.readFileSync(path, "utf8"));
    }

    saveJson(path: string, data: any) {
        fs.writeFileSync(path, data, { encoding: "utf8" });
    }

    async readText(path: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            fs.readFile(path, "utf8", (error: string, data: string) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(data);
                }
            });
        });
    }

    setCurrentWorkingDirectory(path: string) {
        process.chdir(path);
    }

    getCurrentWorkingDirectory(): string {
        return process.cwd();
    }

    saveJsonAsync(path: string, data: any): Promise<boolean> {
        const dataStr = JSON.stringify(data, undefined, 2);
        return new Promise((resolve, reject) => {
            fs.writeFile(path, dataStr, { encoding: "utf8" }, () => {
                resolve();
            });
        });
    }

    findFiles(path: string, fileFilter: (x: string) => boolean, directoryFilter?: (x: string) => boolean): string[] {
        let results: string[] = [];
        const list = fs.readdirSync(path);
        list.forEach((file: string) => {
            file = Path.combine(path, file);
            const stat = fs.statSync(file);
            if (stat && stat.isDirectory()) {
                if (!directoryFilter || (directoryFilter && directoryFilter(file)))
                    results = results.concat(this.findFiles(file, fileFilter, directoryFilter));
            } else {
                if (fileFilter(file))
                    results.push(file);
            }
        });
        return results;
    }
}
