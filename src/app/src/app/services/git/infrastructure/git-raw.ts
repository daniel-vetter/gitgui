import { Process, ProcessResult } from "./process";
import { GitPathProvider } from "./git-executable-provider";
import { Injectable } from "@angular/core";

@Injectable()
export class GitRaw {

    constructor(private process: Process, private gitPathProvider: GitPathProvider) { }

    async run(repositoryPath: string, args: string[]): Promise<ProcessResult> {
        const gitPath = await this.gitPathProvider.getGitPath();
        return this.process.runAndWait(gitPath, args, repositoryPath);
    }
}
