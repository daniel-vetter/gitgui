import { Repository } from "../model";
import { GitRaw } from "../infrastructure/git-raw";
import { Injectable } from "@angular/core";

@Injectable()
export class ActionCommit {

    constructor(private gitRaw: GitRaw) {

    }

    async commit(repository: Repository, message: string, amend: boolean): Promise<boolean> {

        const args = ["commit", "-m", message];
        if (amend) {
            args.push("--amend");
        }

        return (await this.gitRaw.run(repository.location, args)).exitCode === 0;
    }
}
