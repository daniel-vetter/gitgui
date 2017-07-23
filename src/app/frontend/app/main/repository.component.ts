import { Component, OnInit, OnDestroy } from "@angular/core";
import { Repository, RepositoryCommit } from "../services/git/model";
import { EventAggregator, SubscriptionBag } from "../services/event-aggregator";
import { RepositoryOpener } from "../services/repository-opener";
import { SideBarManager } from "../services/side-bar-manager";
import * as Rx from "rxjs";

@Component({
    selector: "repository",
    templateUrl: "./repository.component.html",
    styleUrls: ["./repository.component.scss"]
})
export class RepositoryComponent implements OnInit, OnDestroy {

    showSideBar = false;
    private sub: Rx.Subscription;

    constructor(private sideBarManager: SideBarManager) {}

    ngOnInit(): void {
        this.sub = this.sideBarManager.onContentChanged.subscribe(() => this.onSideBarContentChanged());
        this.onSideBarContentChanged();
    }

    ngOnDestroy(): void {
        this.sub.unsubscribe();
    }

    private onSideBarContentChanged() {
        this.showSideBar = this.sideBarManager.currentContent !== undefined;
    }
}
