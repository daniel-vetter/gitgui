import { Injectable } from "@angular/core";
import { GitRaw } from "./../infrastructure/git-raw";
import { ChangedFile, FileChangeType, RepositoryStatus } from "../model";


@Injectable()
export class StatusReader {

    constructor(private gitRaw: GitRaw) { }

    async readStatus(repositoryPath: string): Promise<RepositoryStatus> {
        const gitResult = await this.gitRaw.run(repositoryPath, ["status", "-u", "-z", "--porcelain=1"]);

        const result = new RepositoryStatus();
        result.isMerge = false;
        result.isRebase = false;

        const lines = gitResult.data.split("\0").filter(y => y !== "");
        for (const line of lines) {
            console.log(line);
            const stageType = line[0];
            // const unstageType = line[1];
            const path = line.substr(3);

            const fileStatus = new ChangedFile();
            fileStatus.path = path;
            fileStatus.type = FileChangeType.Modified; // TODO: parse status
            if (stageType === " " || stageType === "?")
                result.unstaged.push(fileStatus);
            else
                result.staged.push(fileStatus);
        }
        return result;

    }
}
