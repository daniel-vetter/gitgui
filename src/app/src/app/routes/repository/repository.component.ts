import { Component, OnInit, OnDestroy } from "@angular/core";
import { Repository, RepositoryCommit } from "../../model/model";
import { CurrentRepository } from "../../services/current-repository";
import { EventAggregator, SubscriptionBag } from "../../services/event-aggregator";
import { CurrentRepositoryChanged } from "../../model/events";

@Component({
    selector: "repository",
    templateUrl: "./repository.component.html"
})
export class RepositoryComponent implements OnInit, OnDestroy {

    repository: Repository;
    selectedCommit: RepositoryCommit;
    private subscriptions = new SubscriptionBag(this.eventAggregator);

    constructor(private currentRepository: CurrentRepository,
        private eventAggregator: EventAggregator) {
    }

    ngOnInit() {
        this.subscriptions.subscribe(CurrentRepositoryChanged, () => this.displayCurrentRepository());
        this.displayCurrentRepository();
    }

    ngOnDestroy() {
        this.subscriptions.unsubscribeAll();
    }

    private displayCurrentRepository() {
        this.repository = this.currentRepository.get();
    }
}
