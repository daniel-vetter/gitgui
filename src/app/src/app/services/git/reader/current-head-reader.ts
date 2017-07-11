import { GitRaw } from "../infrastructure/git-raw";
import { Injectable } from "@angular/core";

@Injectable()
export class CurrentHeadReader {
    constructor(private gitRaw: GitRaw) {
    }

    async readCurrentHeadHash(repositoryPath: string): Promise<string> {
        const result = await this.gitRaw.run(repositoryPath, ["rev-parse", "HEAD"]);
        if (result.exitCode !== 0) {
            throw new Error("Could not resolve HEAD to a hash. Exit code was " + result.exitCode + ". Output: " + result.data);
        }
        return result.data.trim();
    }
}
