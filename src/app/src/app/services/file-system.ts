const remote = (<any>window).require("electron").remote;
const fs = remote.require("fs");
import { Path } from "./path";

export class FileSystem {
    ensureDirectoryExists(path: string): boolean {
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path);
            return true;
        }
        return false;
    }

    exists(path: string) {
        return fs.existsSync(path);
    }

    getDirectories(path: string): string[] {
        return fs.readdirSync(path).filter(file => fs.statSync(Path.combine(path, file)).isDirectory());
    }

    readJson(path: string): any {
        return JSON.parse(fs.readFileSync(path, "utf8"));
    }

    saveJson(path: string, data: any) {
        fs.writeFileSync(path, data, { encoding: "utf8" });
    }

    async readText(path: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            fs.readFile(path, "utf8", (error, data) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(data);
                }
            });
        });
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
        list.forEach(file => {
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
