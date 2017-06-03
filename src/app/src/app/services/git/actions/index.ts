import { Repository, ChangedFile } from "../model";
import { GitRaw } from "../infrastructure/git-raw";
import { Injectable } from "@angular/core";

@Injectable()
export class Index {

    constructor(private gitRaw: GitRaw) {}

    async stageFile(repository: Repository, changedFile: ChangedFile) {
        return this.stageFolder(repository, this.getNewestFileRef(changedFile).path);
    }

    async unstageFile(repository: Repository, changedFile: ChangedFile) {
        return this.unstageFolder(repository, this.getNewestFileRef(changedFile).path);
    }

    async stageFolder(repository: Repository, folder: string): Promise<boolean> {
        return this.stagePath(repository, folder);
    }

    async unstageFolder(repository: Repository, folder: string): Promise<boolean> {
        return this.unstagePath(repository, folder);
    }

    private getNewestFileRef(changedFile: ChangedFile) {
        if (changedFile.newFile)
            return changedFile.newFile;
        return changedFile.oldFile;
    }

    private async stagePath(repository: Repository, path: string) {
        return (await this.gitRaw.run(repository.location, ["add", path])).exitCode === 0;
    }

    private async unstagePath(repository: Repository, path: string) {
        return (await this.gitRaw.run(repository.location, ["reset", path])).exitCode === 0;
    }
}
