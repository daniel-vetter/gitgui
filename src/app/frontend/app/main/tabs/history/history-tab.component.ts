import { Component, Input, OnChanges } from "@angular/core";
import { HistoryTabData } from "../tabs";
import { Repository, RepositoryCommit } from "../../../services/git/model";
import { SideBarManager, SideBarCommitDetails, SideBarRepositoryStatus } from "../../../services/side-bar-manager";
import { LoadingOverlayType } from "../../../shared/loading-overlay/loading-overlay.component";
import { TabBase } from "../../../services/tabs/tab-base";

declare var monaco: any;
declare var global: any;

@Component({
    selector: "history-tab",
    templateUrl: "./history-tab.component.html"
})
export class HistoryTabComponent extends TabBase<HistoryTabData> {

    loadingOverlayType: LoadingOverlayType = "Full";
    repository?: Repository;
    selectedCommit?: RepositoryCommit;

    constructor(private sideBarManager: SideBarManager) {
        super();
     }

    async displayData(data: HistoryTabData): Promise<void> {
        this.repository = await data.repository;
        this.page.isCloseable = false;
    }

    onSelectedCommitChange() {
        if (this.selectedCommit) {
            this.sideBarManager.setContent(new SideBarCommitDetails(this.selectedCommit));
        } else {
            this.sideBarManager.setContent(new SideBarRepositoryStatus(this.repository!));
        }
    }
}
