import { Process } from "../infrastructure/process";
import { Injectable } from "@angular/core";
const nodeProcess = (<any>window).require("electron").remote.process;

@Injectable()
export class GitPathProvider {

    private gitPath: string;

    constructor(private process: Process) {
    }

    async getGitPath(): Promise<string> {
        if (this.gitPath) {
            return this.gitPath;
        }

        let command: string;
        if (nodeProcess.platform === "win32") {
            command = "where git";
        } else if (nodeProcess.platform === "linux") {
            command = "which git";
        } else {
            throw new Error("Unsupported platform")
        }

        const processResult = await this.process.runAndWait(command, [], ".", true)
        if (processResult.exitCode !== 0) {
            throw Error("could not find path to the git executable. " +
                "Please ensure git is installed and added to the PATH environment variable. Output: " + processResult.data);
        }
        this.gitPath = processResult.data.trim();
        return this.gitPath;
    }
}
