import { GitRaw } from "./infrastructure/git-raw";
import * as Rx from "rxjs";
import { Injectable } from "@angular/core";
import { RepositoryCommit } from "../../model/model";

@Injectable()
export class CommitDetailsReader {

    constructor(private gitRaw: GitRaw) {
    }

    getLongCommitMessage(commit: RepositoryCommit): Rx.Observable<LongCommitMessageResult> {
        return this.gitRaw.run(commit.repository.location, ["rev-list", "--format=%B", "--max-count=1", commit.hash])
            .map(x => {
                const firstLineEnd = x.data.indexOf('\n');
                return new LongCommitMessageResult(commit, x.data.substr(firstLineEnd + 1).trim());
            });
    }
}

export class LongCommitMessageResult {
    constructor(public commit: RepositoryCommit, public message: string) { }
}
