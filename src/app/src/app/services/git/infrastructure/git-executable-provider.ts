import { Process } from "../infrastructure/process";
import { Injectable } from "@angular/core";
const process = (<any>window).require("electron").remote.process;

@Injectable()
export class GitPathProvider {

    private gitPath: string;

    constructor(private process: Process) {
    }

    async getGitPath(): Promise<string> {
        if (this.gitPath) {
            return this.gitPath;
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

        const processResult = await this.process.runAndWait(app, args, ".")
        if (processResult.exitCode !== 0) {
            throw Error("could not find path to the git executable. " +
                "Please ensure git is installed and added to the PATH environment variable.");
        }
        this.gitPath = processResult.data.trim();
        return this.gitPath;
    }
}
