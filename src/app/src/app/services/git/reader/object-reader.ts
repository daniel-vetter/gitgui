import { Injectable } from "@angular/core";
import { GitRaw } from "../infrastructure/git-raw";

@Injectable()
export class ObjectReader {
    constructor(private gitRaw: GitRaw) {
    }

    async getObjectData(gitRepositoryPath: string, objectId: string): Promise<string> {
        return (await this.gitRaw.run(gitRepositoryPath, ["show", objectId])).data;
    }
}
