import { GitRaw } from "../infrastructure/git-raw";
import { Injectable } from "@angular/core";

@Injectable()
export class CurrentHeadReader {
    constructor(private gitRaw: GitRaw) {
    }

    async readCurrentHeadHash(repositoryPath: string): Promise<string> {
        return (await this.gitRaw.run(repositoryPath, ["rev-parse", "head"])).data.trim();
    }
}
