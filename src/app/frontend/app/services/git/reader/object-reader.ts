import { Injectable } from "@angular/core";
import { GitRaw } from "../infrastructure/git-raw";
import { FileRef, BlobFileRef, HeadFileRef, IndexFileRef, DiskFileRef } from "../model";
import { FileSystem } from "../../file-system";
import { Path } from "../../path";

@Injectable()
export class ObjectReader {
    constructor(private gitRaw: GitRaw, private fileSystem: FileSystem) {
    }

    async getFileContent(gitRepositoryPath: string, fileRef: FileRef): Promise<string> {
        if (fileRef instanceof BlobFileRef) {
            return (await this.gitRaw.run(gitRepositoryPath, ["show", fileRef.blob])).data;
        } else if (fileRef instanceof HeadFileRef) {
            return (await this.gitRaw.run(gitRepositoryPath, ["show", "HEAD:" + fileRef.path])).data
        } else if (fileRef instanceof IndexFileRef) {
            return (await this.gitRaw.run(gitRepositoryPath, ["show", ":" + fileRef.path])).data
        } else if (fileRef instanceof DiskFileRef) {
            return this.fileSystem.readText(Path.makeAbsolute(fileRef.path, gitRepositoryPath));
        }
        throw Error("unsported FileRef Type");
    }
}
