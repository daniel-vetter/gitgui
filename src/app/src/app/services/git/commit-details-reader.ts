import { GitRaw } from "./infrastructure/git-raw";
import * as Rx from "rxjs";
import { Injectable } from "@angular/core";

@Injectable()
export class CommitDetailsReader {

    constructor(private gitRaw: GitRaw) {
    }

    getLongCommitMessage(repositoryPath: string, commitHash: string): Rx.Observable<string> {
        return this.gitRaw.run(repositoryPath, ["rev-list", "--format=%B", "--max-count=1", commitHash]).map(x => x.data);
    }
}
