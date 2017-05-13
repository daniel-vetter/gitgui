import { Repository } from "../model";
import * as Rx from "rxjs";
import { GitRaw } from "../infrastructure/git-raw";
import { Injectable } from "@angular/core";

@Injectable()
export class Index {

    constructor(private gitRaw: GitRaw) {}

    stageFile(repository: Repository, filePath: string): Rx.Observable<boolean> {
        return this.gitRaw.run(repository.location, ["add", filePath]).map(x => x.exitCode === 0);
    }

    unstageFile(repository: Repository, filePath: string): Rx.Observable<boolean> {
        return this.gitRaw.run(repository.location, ["reset", filePath]).map(x => x.exitCode === 0);
    }
}
