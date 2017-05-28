import { Injectable } from "@angular/core";
import { GitRaw } from "./../infrastructure/git-raw";
import { ChangedFile, FileChangeType, RepositoryStatus, FileRef } from "../model";


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
            const path = line.substr(3);

            if ((line[0] === "!" && line[1] === "!") ||
                (line[0] === "?" && line[1] === "?")) {
                const indexFile = new ChangedFile();
                indexFile.newFile = FileRef.fromDisk(path);
                indexFile.oldFile = undefined;
                indexFile.type = FileChangeType.Added;
                result.indexChanges.push(indexFile);
            } else {
                const indexChangeType = this.parseChangeType(line[0]);
                const workTreeChangeType = this.parseChangeType(line[1]);

                if (indexChangeType) {
                    const indexFile = new ChangedFile();
                    if (indexChangeType !== FileChangeType.Added)
                        indexFile.oldFile = FileRef.fromHead(path);
                    if (indexChangeType !== FileChangeType.Deleted)
                        indexFile.newFile = FileRef.fromIndex(path);
                    indexFile.type = indexChangeType;
                    result.indexChanges.push(indexFile);
                }
                if (workTreeChangeType) {
                    const workTreeFile = new ChangedFile();
                    if (workTreeChangeType !== FileChangeType.Added)
                        workTreeFile.oldFile = FileRef.fromIndex(path);
                    if (workTreeChangeType !== FileChangeType.Deleted)
                        workTreeFile.newFile = FileRef.fromDisk(path);
                    workTreeFile.type = workTreeChangeType;
                    result.workTreeChanges.push(workTreeFile);
                }
            }
        }
        return result;

    }

    private parseChangeType(char: string): FileChangeType {
        if (char === " ") return undefined;
        else if (char === "M") return FileChangeType.Modified;
        else if (char === "A") return FileChangeType.Added;
        else if (char === "D") return FileChangeType.Deleted;
        else if (char === "R") return FileChangeType.Renamed;
        else if (char === "C") return FileChangeType.Copied;
        else if (char === "U") return FileChangeType.Unmerged;
        else throw Error("invalid index change type: " + char);
    }
}
