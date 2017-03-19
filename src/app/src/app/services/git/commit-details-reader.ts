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
        const params = ["diff-tree", "--no-commit-id", "-r", "-m", "-z", commit.hash]
        if (commit.parents.length === 0) {
            params.push("4b825dc642cb6eb9a060e54bf8d69288fbee4904");
        }
        return this.gitRaw.run(commit.repository.location, params)
            .map(x => {
                const lines = x.data.split("\0").filter(y => y !== "");
                const list: ChangedFile[] = [];
                for (let i = 0; i < lines.length; i += 2) {
                    const item = new ChangedFile();
                    const metainfos = lines[i + 0];
                    const metainfosParts = metainfos.split(" ");
                    if (metainfos[0] !== ":" || metainfosParts.length !== 5)
                         throw Error("Invalid data returned from diff-tree.")
                    item.sourceMode = metainfosParts[0];
                    if (item.sourceMode === "000000")
                        item.sourceMode = undefined;
                    item.destinationMode = metainfosParts[1];
                    if (item.destinationMode === "000000")
                        item.destinationMode = undefined;
                    item.sourceBlob = metainfosParts[2];
                    if (item.sourceBlob === "0000000000000000000000000000000000000000")
                        item.sourceBlob = undefined;
                    item.destinationBlob = metainfosParts[3];
                    if (item.destinationBlob === "0000000000000000000000000000000000000000")
                        item.destinationBlob = undefined;
                    const type = metainfosParts[4];
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
    sourceMode: string;
    sourceBlob: string;
    destinationBlob: string;
    destinationMode: string;
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
