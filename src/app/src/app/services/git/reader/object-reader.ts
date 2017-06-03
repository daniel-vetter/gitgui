import { Injectable } from "@angular/core";
import { GitRaw } from "../infrastructure/git-raw";
import { FileRef, BlobFileRef } from "../model";

@Injectable()
export class ObjectReader {
    constructor(private gitRaw: GitRaw) {
    }

    async getFileContent(gitRepositoryPath: string, fileRef: FileRef): Promise<string> {
        if (fileRef instanceof BlobFileRef) {
            return (await this.gitRaw.run(gitRepositoryPath, ["show", fileRef.blob])).data;
        } else {
            return "unsported FileRef Type";
        }
    }
}
