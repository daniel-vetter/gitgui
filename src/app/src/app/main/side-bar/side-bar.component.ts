import { Component, OnInit, Input } from "@angular/core";
import { SideBarManager, SideBarCommitDetails, SideBarRepositoryStatus } from "../../services/side-bar-manager";
import { Repository, RepositoryCommit } from "../../services/git/model";

@Component({
    selector: "side-bar",
    templateUrl: "./side-bar.component.html",
    styleUrls: ["./side-bar.component.scss"]
})
export class SideBarComponent implements OnInit {

    @Input() width: number;
    showCommitDetails: boolean;
    showRepositoryStatus: boolean;
    contentAvailable: boolean;

    commit: RepositoryCommit;
    repository: Repository;

    constructor(private sideBarManager: SideBarManager) {

    }

    ngOnInit() {
        this.sideBarManager.onContentChanged.subscribe(() => { this.update(); });
        this.update();
    }

    update() {
        this.showCommitDetails = false;
        this.showRepositoryStatus = false;

        if (this.sideBarManager.currentContent instanceof SideBarCommitDetails) {
            this.showCommitDetails = true;
            this.commit = this.sideBarManager.currentContent.commit;
        }

        if (this.sideBarManager.currentContent instanceof SideBarRepositoryStatus) {
            this.showRepositoryStatus = true;
            this.repository = this.sideBarManager.currentContent.repository;
        }

        this.contentAvailable = this.showCommitDetails || this.showRepositoryStatus;
    }
}
