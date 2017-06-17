import { Repository } from "../services/git/model";
import { Injectable } from "@angular/core";
import { EventAggregator } from "./event-aggregator";

@Injectable()
export class CurrentRepository {

    private currentRepository: Repository | undefined;

    constructor(private eventAggregator: EventAggregator) {}

    get(): Repository | undefined {
        return this.currentRepository;
    }

    set(repository: Repository | undefined) {
        if (this.currentRepository !== repository) {
            this.currentRepository = repository;
            this.eventAggregator.publish("CurrentRepositoryChanged");
        }
    }
}
