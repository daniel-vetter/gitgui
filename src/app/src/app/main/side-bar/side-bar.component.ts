import { Component, OnInit } from "@angular/core";
import { SideBarManager } from "../../services/side-bar-manager";
import { Repository, RepositoryCommit } from "../../model/model";

@Component({
    selector: "side-bar",
    templateUrl: "./side-bar.component.html",
    styleUrls: ["./side-bar.component.scss"]
})
export class SideBarComponent implements OnInit {

    commit: RepositoryCommit;

    constructor(private sideBarManager: SideBarManager) {

    }

    ngOnInit() {
        this.sideBarManager.onContentChanged.subscribe(() => { this.update(); });
        this.update();
    }

    update() {
        this.commit = this.sideBarManager.commit;
    }
}
