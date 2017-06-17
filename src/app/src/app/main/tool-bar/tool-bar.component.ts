import { Component } from "@angular/core";
import { FileOpenRepository } from "../../menu/handler/file-open-repository";
import { Notifications } from "../notifications/notifications";
import { Git } from "../../services/git/git";
import { TabManager } from "../../services/tab-manager";
import { Repository } from "../../services/git/model";
@Component({
    templateUrl: "./tool-bar.component.html",
    styleUrls: ["./tool-bar.component.scss"],
    selector: "tool-bar"
})
export class ToolBarComponent {

    constructor(private fileOpenRepository: FileOpenRepository,
                private git: Git,
                private tabManager: TabManager) {}

    onOpenClicked() {
        this.fileOpenRepository.onClick();
    }

    onPushClicked() {
        throw "Test";
    }

    onRefreshClicked() {
        const allOpenRepositories: Repository[] = [];
        for (const tab of this.tabManager.allTabs) {
            const repository = (<any>tab)["repository"]; // TODO: Use a interface
            if (repository && allOpenRepositories.indexOf(repository) === -1) {
                allOpenRepositories.push(repository);
            }
        }
        for (const rep of allOpenRepositories) {
            this.git.updateRepository(rep);
        }
    }
}
