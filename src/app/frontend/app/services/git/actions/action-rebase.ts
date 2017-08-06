import { CommonErrors } from "./common";
import { GitRaw } from "../infrastructure/git-raw";
import { Repository } from "../model";
import { Injectable } from "@angular/core";

@Injectable()
export class ActionRebase {

    constructor(private gitRaw: GitRaw) { }

    async rebase(repository: Repository, rebaseOnTo: string, branchToRebase?: string): Promise<GitRebaseResult> {
        const args = ["rebase", rebaseOnTo];
        if (branchToRebase) {
            args.push(branchToRebase);
        }

        const result = await this.gitRaw.run(repository.location, args);

        if (result.exitCode === 128 && result.data.startsWith("fatal: Not a git repository"))
            return { success: false, errorType: "not_a_git_repository" }

        if (result.exitCode === 128 && result.data.indexOf("Permission denied")) // TODO: better parser
            return { success: false, errorType: "access_denied" };

        if (result.exitCode === 0)
            return { success: true };

        return { success: false, errorType: "unknown_error" };
    }
}

export type GitRebaseResult =
    { success: true }
    | { success: false, errorType: "access_denied" }
    | CommonErrors;
