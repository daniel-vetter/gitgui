import { Component } from "@angular/core";
import { FileOpenRepository } from "../../menu/handler/file-open-repository";
import { Notifications } from "../notifications/notifications";
import { Git } from "../../services/git/git";
import { Repository } from "../../services/git/model";
import { Status } from "../../services/status";
import { TabManager } from "app/services/tabs/tab-manager";
@Component({
    templateUrl: "./tool-bar.component.html",
    styleUrls: ["./tool-bar.component.scss"],
    selector: "tool-bar"
})
export class ToolBarComponent {

    constructor(private fileOpenRepository: FileOpenRepository,
        private git: Git,
        private tabManager: TabManager,
        private status: Status) { }

    onOpenClicked() {
        this.fileOpenRepository.onClick();
    }

    onPushClicked() {
        throw new Error("Test");
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
}
