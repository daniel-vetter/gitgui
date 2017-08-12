import { Injectable } from "@angular/core";
import { Git } from "../git/git";
import { Repository } from "../git/model";

@Injectable()
export class RebaseWorkflow {
    constructor(private git: Git) { }

    async run(repository: Repository, rebaseOnTo?: string, branchToRebase?: string): Promise<RebaseWorkflowResult> {
        while (true) {
            const rebaseResult = await this.git.rebase(repository, rebaseOnTo, branchToRebase);

            if (rebaseResult.success === true) {
                return { success: true };
            }

            if (rebaseResult.success === false) {
                if (rebaseResult.errorType === "access_denied") {
                    continue;
                }
                if (rebaseResult.errorType === "not_a_git_repository") {
                    return { success: false, errorType: "not_a_git_repository"}
                }
                if (rebaseResult.errorType === "unknown_error") {
                    return { success: false, errorType: "unknown_error" }
                }
            }
        }
    }
}

export type RebaseWorkflowResult
    = { success: true }
    | { success: false, errorType: "canceled_by_user" }
    | { success: false, errorType: "unknown_error" }
    | { success: false, errorType: "not_a_git_repository" };
