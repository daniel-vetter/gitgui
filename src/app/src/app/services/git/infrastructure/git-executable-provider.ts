import * as Rx from "rxjs";
import { Process } from "../infrastructure/process";
import { Injectable } from "@angular/core";
const process = (<any>window).require("electron").remote.process;

@Injectable()
export class GitPathProvider {

    private gitPath: string;

    constructor(private process: Process) {
    }

    getGitPath(): Rx.Observable<string> {
        if (this.gitPath) {
            return Rx.Observable.of(this.gitPath);
        }

        let app: string;
        let args: string[];

        if (process.platform === "win32") {
            app = "cmd";
            args = ["/c", "where", "git"]
        } else if (process.platform === "linux") {
            app = "/bin/sh";
            args = ["-c", "which git"]
        } else {
            throw new Error("TODO: Add support for other platforms.")
        }

        return this.process.runAndWait(app, args, ".").map(x => {
            if (x.exitCode !== 0) {
                throw Error("could not find path to the git executable. " +
                    "Please ensure git is installed and added to the PATH environment variable.");
            }
            this.gitPath = x.data.trim();
            return this.gitPath;
        });
    }
}
