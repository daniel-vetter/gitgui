import { Component } from "@angular/core";
import { FileOpenRepository } from "../../menu/handler/file-open-repository";
import { Git } from "../../services/git/git";
import { Repository } from "../../services/git/model";
import { Status } from "../../services/status";
import { TabManager } from "app/services/tabs/tab-manager";
import { Dialog } from "app/main/dialog/dialog";
import { TestDialogComponent } from "../test-dialog/test-dialog.component";
import { Notifications } from "../notification/notifications";
import { FetchRebaseWorkflow } from "app/services/git-ui-workflow/fetch-rebase-workflow";

@Component({
    templateUrl: "./tool-bar.component.html",
    styleUrls: ["./tool-bar.component.scss"],
    selector: "tool-bar"
})
export class ToolBarComponent {

    constructor(private fileOpenRepository: FileOpenRepository,
        private git: Git,
        private tabManager: TabManager,
        private status: Status,
        private dialog: Dialog,
        private notifications: Notifications,
        private fetchRebaseWorkflow: FetchRebaseWorkflow) { }

    onOpenClicked() {
        this.fileOpenRepository.onClick();
    }

    async onPushClicked() {
        const result = await this.dialog.create(TestDialogComponent).showModal(undefined);
        this.notifications.showInfo(result);
    }

    async onRefreshClicked() {
        this.status.startProcess("Updating repository", async () => {
            const allOpenRepositories: Repository[] = [];
            for (const tab of this.tabManager.allTabPages) {
                const repository = await Promise.resolve(tab.data.repository);
                await this.git.updateRepository(repository);
            }
        });
    }

    async onPullClicked() {
        const rep = await this.getCurrentRepository();
        if (rep) {
            this.fetchRebaseWorkflow.run(rep)
        }
    }

    private async getCurrentRepository(): Promise<Repository | undefined> {
        const selectedTab = this.tabManager.selectedTab;
        if (selectedTab !== undefined) {
            return await Promise.resolve(selectedTab.data.repository);
        }
        return undefined;
    }
}
