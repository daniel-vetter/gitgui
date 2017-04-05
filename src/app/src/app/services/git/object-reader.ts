import { Injectable } from "@angular/core";
import { GitRaw } from "./infrastructure/git-raw";
import * as Rx from "rxjs";

@Injectable()
export class ObjectReader {
    constructor(private gitRaw: GitRaw) {
    }

    getObjectData(gitRepositoryPath: string, objectId: string): Rx.Observable<string> {
        return this.gitRaw.run(gitRepositoryPath, ["show", objectId]).map(x => x.data);
    }
}
