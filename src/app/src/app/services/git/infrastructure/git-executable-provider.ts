import * as Rx from "rxjs";
import { Process } from "../infrastructure/process";
import { Injectable } from "@angular/core";

@Injectable()
export class GitPathProvider {

    gitPath: string = "C:\\Program Files\\Git\\cmd\\git.exe";

    constructor(private process: Process) {
    }

    getGitPath(): Rx.Observable<string> {
        if (this.gitPath) {
            return Rx.Observable.of(this.gitPath);
        }
        return this.process.runAndWait("cmd", ["/c", "where", "git"], ".").map(x => {
            if (x.exitCode !== 0) {
                throw Error("could not find path to the git executable. " +
                    "Please ensure git is installed and added to the PATH environment variable.");
            }
            this.gitPath = x.data.trim();
            return this.gitPath;
        });
    }
}
