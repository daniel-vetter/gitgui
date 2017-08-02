import { GitRaw } from "../infrastructure/git-raw";
import { Repository } from "../model";
import { Injectable } from "@angular/core";

@Injectable()
export class Fetcher {

    constructor(private gitRaw: GitRaw) { }

    async fetch(repository: Repository): Promise<GitFetchResult> {
        const result = await this.gitRaw.run(repository.location, ["fetch"]);

        if (result.exitCode === 0)
            return { result: "success" };

        return { result: "unknown_error" };
    }
}

export type CommonErrors = { result: "not_a_git_repository" } | { result: "unknown_error" };

export type GitFetchResult =
    { result: "success" }
    | { result: "no_upstream" }
    | CommonErrors;
