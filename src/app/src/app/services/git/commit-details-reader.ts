import { GitRaw } from "./infrastructure/git-raw";
import * as Rx from "rxjs";
import { Injectable } from "@angular/core";
import { RepositoryCommit } from "../../model/model";

@Injectable()
export class CommitDetailsReader {

    constructor(private gitRaw: GitRaw) {
    }

    getLongCommitMessage(commit: RepositoryCommit): Rx.Observable<string> {
        return this.gitRaw.run(commit.repository.location, ["rev-list", "--format=%B", "--max-count=1", commit.hash])
            .map(x => {
                return x.data.substr(x.data.indexOf("\n") + 1).trim();
            });
    }

    getFileChangesOfCommit(commit: RepositoryCommit): Rx.Observable<ChangedFile[]> {
        return this.gitRaw.run(commit.repository.location, ["diff-tree", "--no-commit-id", "--name-status", "-r", "-m", "-z", commit.hash])
            .map(x => {
                const lines = x.data.split("\0").filter(y => y !== "");
                const list: ChangedFile[] = [];
                for (let i = 0; i < lines.length; i += 2) {
                    const item = new ChangedFile();
                    const type = lines[i + 0];
                    if (type === "A") item.type = ChangeType.Added;
                    if (type === "C") item.type = ChangeType.Copied;
                    if (type === "D") item.type = ChangeType.Deleted;
                    if (type === "M") item.type = ChangeType.Modified;
                    if (type === "R") item.type = ChangeType.Renamed;
                    if (type === "T") item.type = ChangeType.TypeChange;
                    if (type === "U") item.type = ChangeType.Unmerged;
                    if (type === "X") item.type = ChangeType.Unknown;
                    if (type === "B") item.type = ChangeType.Broken;
                    item.path = lines[i + 1];
                    list.push(item);
                }
                return list;
            });
    }
}

export class ChangedFile {
    path: string;
    type: ChangeType;
}

export enum ChangeType {
    Added,
    Copied,
    Deleted,
    Modified,
    Renamed,
    TypeChange,
    Unmerged,
    Unknown,
    Broken
}
