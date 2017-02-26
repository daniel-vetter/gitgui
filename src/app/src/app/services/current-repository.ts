import { Repository } from "../model/model";
import { Injectable } from "@angular/core";
import { EventAggregator } from "./event-aggregator";

@Injectable()
export class CurrentRepository {

    private currentRepository: Repository;

    constructor(private eventAggregator: EventAggregator) {}

    get(): Repository {
        return this.currentRepository;
    }

    set(repository: Repository) {
        if (this.currentRepository !== repository) {
            this.currentRepository = repository;
            this.eventAggregator.publish("CurrentRepositoryChanged");
        }
    }
}
