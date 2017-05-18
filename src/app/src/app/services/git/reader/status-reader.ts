import { Injectable } from "@angular/core";
import { GitRaw } from "./../infrastructure/git-raw";
import { ChangedFile, FileChangeType, RepositoryStatus, IndexFileChangeType, IndexFile } from "../model";


@Injectable()
export class StatusReader {

    constructor(private gitRaw: GitRaw) { }

    async readStatus(repositoryPath: string): Promise<RepositoryStatus> {
        const gitResult = await this.gitRaw.run(repositoryPath, ["status", "-u", "-z", "--porcelain"]);

        const result = new RepositoryStatus();
        result.isMerge = false;
        result.isRebase = false;

        const lines = gitResult.data.split("\0").filter(y => y !== "");
        for (const line of lines) {
            if (line.startsWith("warning: "))
                continue;
            console.log(line);

            if ((line[0] === "!" && line[1] === "!") ||
                (line[0] === "?" && line[1] === "?")) {
                const indexFile = new IndexFile();
                indexFile.path = line.substr(3);
                indexFile.indexChangeType = IndexFileChangeType.Unmodified;
                indexFile.workTreeChangeType = IndexFileChangeType.Added;
                result.indexFiles.push(indexFile);
            } else {
                const indexFile = new IndexFile();
                indexFile.path = line.substr(3);
                indexFile.indexChangeType = this.parseChangeType(line[0]);
                indexFile.workTreeChangeType = this.parseChangeType(line[1]);
                result.indexFiles.push(indexFile);
            }
        }
        return result;

    }

    private parseChangeType(char: string): IndexFileChangeType {
        if (char === " ") return IndexFileChangeType.Unmodified;
        else if (char === "M") return IndexFileChangeType.Modified;
        else if (char === "A") return IndexFileChangeType.Added;
        else if (char === "D") return IndexFileChangeType.Deleted;
        else if (char === "R") return IndexFileChangeType.Renamed;
        else if (char === "C") return IndexFileChangeType.Copied;
        else if (char === "U") return IndexFileChangeType.UpdatedButUnmerged;
        else throw Error("invalid index change type: " + char);
    }
}
