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

    onRefreshClicked() {
        this.status.startProcess("Updating repository", async () => {
            const allOpenRepositories: Repository[] = [];
            for (const tab of this.tabManager.allTabPages) {
                const repositoryOrRepositoryPromise = <Repository | Promise<Repository>>((<any>tab)["repository"]); // TODO: Use a interface
                let repository: Repository | undefined;
                if (repositoryOrRepositoryPromise instanceof Repository)
                    repository = repositoryOrRepositoryPromise;
                else if (repositoryOrRepositoryPromise !== undefined)
                    repository = await repositoryOrRepositoryPromise;
                if (repository && allOpenRepositories.indexOf(repository) === -1) {
                    allOpenRepositories.push(repository);
                }
            }
            for (const rep of allOpenRepositories) {
                await this.git.updateRepository(rep);
            }
        });

    }
}
