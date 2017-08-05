import { GitRaw } from "../infrastructure/git-raw";
import { Repository } from "../model";
import { Injectable } from "@angular/core";
import { CommonErrors } from "./common";

@Injectable()
export class ActionFetch {

    constructor(private gitRaw: GitRaw) { }

    async fetch(repository: Repository): Promise<GitFetchResult> {
        const result = await this.gitRaw.run(repository.location, ["fetch", "--all"]);

        if (result.exitCode === 0)
            return { success: true };

        if (result.exitCode === 128 && result.data.startsWith("fatal: Not a git repository"))
            return { success: false, errorType: "not_a_git_repository" }

        return {  success: false, errorType: "unknown_error" };
    }
}


export type GitFetchResult =
    { success: true }
    | CommonErrors;
