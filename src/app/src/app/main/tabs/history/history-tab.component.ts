import { Component, Input, OnChanges } from "@angular/core";
import { HistoryTab } from "../tabs";
import { Repository, RepositoryCommit } from "../../../services/git/model";
import { SideBarManager, SideBarCommitDetails, SideBarRepositoryStatus } from "../../../services/side-bar-manager";
import { LoadingOverlayType } from "../../../shared/loading-overlay/loading-overlay.component";

declare var monaco: any;
declare var global: any;

@Component({
    selector: "history-tab",
    templateUrl: "./history-tab.component.html"
})
export class HistoryTabComponent implements OnChanges {
    @Input() tab: HistoryTab;

    loadingOverlayType: LoadingOverlayType = "Full";
    repository?: Repository;
    selectedCommit?: RepositoryCommit;

    constructor(private sideBarManager: SideBarManager) { }

    async ngOnChanges() {
        if (this.tab && this.tab.repository) {
            this.repository = await this.tab.repository;
            this.tab.ui.isCloseable = false;
        } else {
            this.repository = undefined;
            this.selectedCommit = undefined;
            this.onSelectedCommitChange();
        }
    }

    onSelectedCommitChange() {
        if (this.selectedCommit) {
            this.sideBarManager.setContent(new SideBarCommitDetails(this.selectedCommit));
        } else {
            this.sideBarManager.setContent(new SideBarRepositoryStatus(this.repository!));
        }
    }
}
