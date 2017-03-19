import { Component, Input } from "@angular/core";
import { HistoryTab } from "../tabs";
import { Repository, RepositoryCommit } from "../../../model/model";
import { SideBarManager } from "../../../services/side-bar-manager";

@Component({
    selector: "history-tab",
    templateUrl: "./history-tab.component.html"
})
export class HistoryTabComponent {
    @Input() tab: HistoryTab = undefined;

    repository: Repository;
    selectedCommit: RepositoryCommit;

    constructor(private sideBarManager: SideBarManager) {}


    ngOnChanges() {
        this.repository = this.tab.repository;
        if (this.repository) {
            this.tab.ui.isCloseable = false;
        }
    }

    onSelectedCommitChange() {
        this.sideBarManager.showCommitDetails(this.selectedCommit);
    }
}
