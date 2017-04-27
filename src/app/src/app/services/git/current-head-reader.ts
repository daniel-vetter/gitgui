import { GitRaw } from "./infrastructure/git-raw";
import * as Rx from "rxjs";
import { Injectable } from "@angular/core";

@Injectable()
export class CurrentHeadReader {
    constructor(private gitRaw: GitRaw) {
    }

    readCurrentHeadHash(repositoryPath: string): Rx.Observable<string> {
        return this.gitRaw.run(repositoryPath, ["rev-parse", "head"]).map(x => x.data.trim());
    }
}
