import { Injectable } from "@angular/core";
import { Git } from "../git/git";
import { Repository } from "../git/model";
import { Notifications } from "app/main/notification/notifications";
import { AccessDeniedNotificationComponent } from "./user-interactions/access-denied-notification/access-denied-notification.component";

@Injectable()
export class RebaseWorkflow {
    constructor(private git: Git, private notifications: Notifications) { }

    async run(repository: Repository, rebaseOnTo?: string, branchToRebase?: string): Promise<RebaseWorkflowResult> {
        while (true) {
            const rebaseResult = await this.git.rebase(repository, rebaseOnTo, branchToRebase);

            if (rebaseResult.success === true) {
                return { success: true };
            }

            if (rebaseResult.success === false) {
                if (rebaseResult.errorType === "access_denied") {
                    const result = await this.notifications.create(AccessDeniedNotificationComponent).showModal({ blockedFiles: [] })
                    if (result === "externally_resolved")
                        return { success: true };
                    if (result === "abort")
                        return { success: false, errorType: "canceled_by_user" };
                    if (result === "retry")
                        continue;
                    return this.assertNever(result);
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

    private assertNever(never: never): never {
        throw new Error("Invalid state: " + never);
    }
}

export type RebaseWorkflowResult
    = { success: true }
    | { success: false, errorType: "canceled_by_user" }
    | { success: false, errorType: "unknown_error" }
    | { success: false, errorType: "not_a_git_repository" };
