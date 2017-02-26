import { Component, OnInit, OnDestroy } from "@angular/core";
import { Repository, RepositoryCommit } from "../../model/model";
import { CurrentRepository } from "../../services/current-repository";
import { EventAggregator, SubscriptionBag } from "../../services/event-aggregator";
import { RepositoryOpener } from "../../services/repository-opener";

@Component({
    selector: "repository",
    templateUrl: "./repository.component.html",
    styleUrls: ["./repository.component.scss"]
})
export class RepositoryComponent implements OnInit, OnDestroy {

    repository: Repository;
    selectedCommit: RepositoryCommit;
    repositoryIsOpening: boolean;
    private subscriptions = new SubscriptionBag(this.eventAggregator);

    constructor(private currentRepository: CurrentRepository,
        private eventAggregator: EventAggregator,
        private repositoryOpener: RepositoryOpener) {
    }

    ngOnInit() {
        this.eventAggregator.subscribe("CurrentRepositoryChanged", () => this.displayCurrentRepository());
        this.eventAggregator.subscribe("OpenRepositoryStarted", () => this.repositoryIsOpening = true);
        this.eventAggregator.subscribe("OpenRepositoryEnded", () => this.repositoryIsOpening = false);
        this.repositoryIsOpening = this.repositoryOpener.isOpening;
        this.displayCurrentRepository();
    }

    ngOnDestroy() {
        this.subscriptions.unsubscribeAll();
    }

    private displayCurrentRepository() {
        this.repository = this.currentRepository.get();
    }
}
