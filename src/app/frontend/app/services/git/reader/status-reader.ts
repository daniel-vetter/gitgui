import { Injectable } from "@angular/core";
import { GitRaw } from "./../infrastructure/git-raw";
import { FileChangeType, RepositoryStatus, FileRef, IndexChangedFile } from "../model";


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
            const path = line.substr(3);

            if ((line[0] === "!" && line[1] === "!") ||
                (line[0] === "?" && line[1] === "?")) {
                const indexFile = new IndexChangedFile();
                indexFile.newFile = FileRef.fromDisk(path);
                indexFile.oldFile = undefined;
                indexFile.type = FileChangeType.Added;
                indexFile.isStaged = false;
                result.indexChanges.push(indexFile);
            } else {
                const indexChangeType = this.parseChangeType(line[0]);
                const workTreeChangeType = this.parseChangeType(line[1]);

                if (indexChangeType) {
                    const indexFile = new IndexChangedFile();
                    if (indexChangeType !== FileChangeType.Added)
                        indexFile.oldFile = FileRef.fromHead(path);
                    if (indexChangeType !== FileChangeType.Deleted)
                        indexFile.newFile = FileRef.fromIndex(path);
                    indexFile.type = indexChangeType;
                    indexFile.isStaged = true;
                    result.indexChanges.push(indexFile);
                }
                if (workTreeChangeType) {
                    const workTreeFile = new IndexChangedFile();
                    if (workTreeChangeType !== FileChangeType.Added)
                        workTreeFile.oldFile = FileRef.fromIndex(path);
                    if (workTreeChangeType !== FileChangeType.Deleted)
                        workTreeFile.newFile = FileRef.fromDisk(path);
                    workTreeFile.type = workTreeChangeType;
                    workTreeFile.isStaged = false;
                    result.workTreeChanges.push(workTreeFile);
                }
            }
        }
        return result;

    }

    private parseChangeType(char: string): FileChangeType | undefined {
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
