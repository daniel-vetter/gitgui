import * as Rx from "rxjs";
import { Repository } from "../model";
import { GitRaw } from "../infrastructure/git-raw";
import { Injectable } from "@angular/core";

@Injectable()
export class Commiter {

    constructor(private gitRaw: GitRaw) {

    }

    commit(repository: Repository, message: string, amend: boolean): Rx.Observable<boolean> {

        const args = ["commit", "-m", message];
        if (amend) {
            args.push("--amend");
        }

        return this.gitRaw.run(repository.location, args).map(x => x.exitCode === 0);
    }
}
