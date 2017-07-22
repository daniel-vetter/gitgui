import { GitRaw } from "../infrastructure/git-raw";
import { Injectable } from "@angular/core";
import { RepositoryCommit, FileChangeType, ChangedFile, FileRef } from "../model";

@Injectable()
export class CommitDetailsReader {

    constructor(private gitRaw: GitRaw) {
    }

    async getLongCommitMessage(commit: RepositoryCommit): Promise<string> {
        const args = ["rev-list", "--format=%B", "--max-count=1", commit.hash];
        const result = await this.gitRaw.run(commit.repository.location, args);
        return result.data.substr(result.data.indexOf("\n") + 1).trim();
    }

    async getFileChangesOfCommit(commit: RepositoryCommit): Promise<ChangedFile[]> {
        const params = ["diff-tree", "--no-commit-id", "-r", "-m", "-z"];
        if (commit.parents.length === 0) 
            params.push("4b825dc642cb6eb9a060e54bf8d69288fbee4904");
        params.push(commit.hash);

        const x = await this.gitRaw.run(commit.repository.location, params);
        const lines = x.data.split("\0").filter(y => y !== "");
        const list: ChangedFile[] = [];
        for (let i = 0; i < lines.length; i += 2) {
            const item = new ChangedFile();
            const metainfos = lines[i + 0];
            const metainfosParts = metainfos.split(" ");
            if (metainfos[0] !== ":" || metainfosParts.length !== 5)
                throw Error("Invalid data returned from diff-tree.");

            const sourceMode = metainfosParts[0];
            const destinationMode = metainfosParts[1];
            const sourceBlob = metainfosParts[2];
            const destinationBlob = metainfosParts[3];
            const type = metainfosParts[4];
            const path = lines[i + 1];

            if (sourceMode !== "000000" && sourceBlob !== "0000000000000000000000000000000000000000")
                item.oldFile = FileRef.fromBlob(sourceBlob, path);
            if (destinationMode !== "000000" && destinationBlob !== "0000000000000000000000000000000000000000")
                item.newFile = FileRef.fromBlob(destinationBlob, path)
            
            if (type === "A") item.type = FileChangeType.Added;
            if (type === "C") item.type = FileChangeType.Copied;
            if (type === "D") item.type = FileChangeType.Deleted;
            if (type === "M") item.type = FileChangeType.Modified;
            if (type === "R") item.type = FileChangeType.Renamed;
            if (type === "T") item.type = FileChangeType.TypeChange;
            if (type === "U") item.type = FileChangeType.Unmerged;
            if (type === "X") throw Error("Unsupported file change: Unknown");
            if (type === "B") throw Error("Unsupported file change: Broken");

            list.push(item);
        }
        return list;
    }
}
