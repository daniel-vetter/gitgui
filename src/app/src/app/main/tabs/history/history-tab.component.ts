import { Component, Input, OnChanges } from "@angular/core";
import { HistoryTab } from "../tabs";
import { Repository, RepositoryCommit } from "../../../model/model";
import { SideBarManager } from "../../../services/side-bar-manager";

declare var monaco: any;
declare var global: any;

@Component({
    selector: "history-tab",
    templateUrl: "./history-tab.component.html"
})
export class HistoryTabComponent implements OnChanges {
    @Input() tab: HistoryTab = undefined;

    repository: Repository;
    selectedCommit: RepositoryCommit;

    constructor(private sideBarManager: SideBarManager) { }

    ngOnChanges() {
        if (this.tab && this.tab.repository) {
            this.repository = this.tab.repository;
            this.tab.ui.isCloseable = false;
        } else {
            this.repository = undefined;
        }
    }

    onSelectedCommitChange() {
        this.sideBarManager.showCommitDetails(this.selectedCommit);
    }
}
