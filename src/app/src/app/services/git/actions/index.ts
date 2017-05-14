import { Repository } from "../model";
import { GitRaw } from "../infrastructure/git-raw";
import { Injectable } from "@angular/core";

@Injectable()
export class Index {

    constructor(private gitRaw: GitRaw) {}

    async stageFile(repository: Repository, filePath: string): Promise<boolean> {
        return (await this.gitRaw.run(repository.location, ["add", filePath])).exitCode === 0;
    }

    async unstageFile(repository: Repository, filePath: string): Promise<boolean> {
        return (await this.gitRaw.run(repository.location, ["reset", filePath])).exitCode === 0;
    }
}
