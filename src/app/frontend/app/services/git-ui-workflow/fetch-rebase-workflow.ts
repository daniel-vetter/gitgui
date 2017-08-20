import { Git } from "../git/git";
import { Injectable } from "@angular/core";
import { Repository } from "../git/model";
import { RebaseWorkflow } from "./rebase-workflow";
import { Workflow, WorkflowBase } from "./system/workflow";

@Injectable()
export class FetchRebaseWorkflow implements WorkflowBase<Repository, Promise<PullRebaseWorkflowResult>> {
    constructor(private git: Git, private workflow: Workflow) { }

    async run(repository: Repository): Promise<PullRebaseWorkflowResult> {
        const fetchResult = await this.git.fetch(repository);


        if (fetchResult.success === false) {
            if (fetchResult.errorType === "not_a_git_repository") {
                return { success: false, errorType: "not_a_git_repository" }
            }
            if (fetchResult.errorType === "unknown_error") {
                return { success: false, errorType: "unknown_error" }
            }
        }
        if (fetchResult.success === true) {

            const rebaseResult = await this.workflow.create(FetchRebaseWorkflow).asSubWorkflowTo(this).run(repository);
            if (rebaseResult.success === false) {
                if (rebaseResult.errorType === "canceled_by_user") {
                    return { success: false, errorType: "canceled_by_user" }
                }
                if (rebaseResult.errorType === "not_a_git_repository") {
                    return { success: false, errorType: "not_a_git_repository" }
                }
                if (rebaseResult.errorType === "unknown_error") {
                    return { success: false, errorType: "unknown_error" }
                }
            }
            if (rebaseResult.success === true) {
                return { success: true };
            }

            return this.assertNever(rebaseResult);
        }

        return this.assertNever(fetchResult);
    }

    private assertNever(never: never): never {
        throw new Error("Invalid state" + JSON.stringify(never));
    }
}

export type PullRebaseWorkflowResult
    = { success: true }
    | { success: false, errorType: "canceled_by_user" }
    | { success: false, errorType: "not_a_git_repository" }
    | { success: false, errorType: "unknown_error" };
