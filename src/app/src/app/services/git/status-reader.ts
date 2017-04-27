import { Injectable } from "@angular/core";
import * as Rx from "rxjs";
import { GitRaw } from "./infrastructure/git-raw";
import { RepositoryStatus, FileStatus, FileStatusType } from "../../model/model";


@Injectable()
export class StatusReader {

    constructor(private gitRaw: GitRaw) { }

    readStatus(repositoryPath: string): Rx.Observable<RepositoryStatus> {
        return this.gitRaw.run(repositoryPath, ["status", "-z", "--porcelain=1"])
            .map(x => {
                const result = new RepositoryStatus();
                result.isMerge = false;
                result.isRebase = false;

                const lines = x.data.split("\0").filter(y => y !== "");
                for (const line of lines) {
                    console.log(line);
                    const p1 = line[0];
                    const p2 = line[1];
                    const path = line.substr(3);

                    const fileStatus = new FileStatus();
                    fileStatus.filePath = path;
                    fileStatus.type = FileStatusType.Modified; // TODO: parse status
                    result.unstaged.push(fileStatus); // TODO: check if staged or unstaged
                }

                console.log(result);
                return result;
            });
    }
}
