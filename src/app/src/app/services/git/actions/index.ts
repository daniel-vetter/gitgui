import { Repository, ChangedFile, FileRef } from "../model";
import { GitRaw } from "../infrastructure/git-raw";
import { Injectable } from "@angular/core";

@Injectable()
export class Index {

    constructor(private gitRaw: GitRaw) {}

    async stage(repository: Repository, changedFile: ChangedFile | string) {
        if (changedFile instanceof ChangedFile) {
            changedFile = this.getNewestFileRef(changedFile).path;
        }
        return (await this.gitRaw.run(repository.location, ["add", changedFile])).exitCode === 0;
    }

    async unstage(repository: Repository, changedFile: ChangedFile | string) {
        if (changedFile instanceof ChangedFile) {
            changedFile = this.getNewestFileRef(changedFile).path;
        }
        return (await this.gitRaw.run(repository.location, ["reset", changedFile])).exitCode === 0;
    }

    private getNewestFileRef(changedFile: ChangedFile): FileRef {
        if (changedFile.newFile)
            return changedFile.newFile;
        if (changedFile.oldFile)
            return changedFile.oldFile;
        throw Error("Invalid state in ChangedFile");
    }
}
