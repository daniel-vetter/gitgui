import { Component, OnInit, OnDestroy } from "@angular/core";
import { Repository, RepositoryCommit } from "../services/git/model";
import { EventAggregator, SubscriptionBag } from "../services/event-aggregator";
import { RepositoryOpener } from "../services/repository-opener";

@Component({
    selector: "repository",
    templateUrl: "./repository.component.html",
    styleUrls: ["./repository.component.scss"]
})
export class RepositoryComponent {
}
