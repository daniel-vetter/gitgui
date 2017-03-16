import * as Rx from "rxjs";
import { RepositoryReader } from "./git/repository-reader";
import { CurrentRepository } from "./current-repository";
import { Injectable } from "@angular/core";
import { EventAggregator } from "./event-aggregator";
import { Status } from "./status";
import { TabManager } from "./tab-manager";
import { HistoryTab } from "../main/tabs/tabs";

@Injectable()
export class RepositoryOpener {

    private _isOpening = false;

    get isOpening () {
        return this._isOpening;
    }

    constructor(private repositoryReader: RepositoryReader,
                private currentRepository: CurrentRepository,
                private eventAggregator: EventAggregator,
                private status: Status,
                private tabManager: TabManager) {}

    open(path: string) {
        const status = this.status.startProcess("Opening Repository");
        this._isOpening = true;
        this.eventAggregator.publish("OpenRepositoryStarted");
        this.currentRepository.set(undefined);
        this.repositoryReader.readRepository(path).subscribe(x => {
            this.tabManager.closeAllTabs();
            const tab = new HistoryTab();
            tab.repository = x;
            this.tabManager.createNewTab(tab, true);
            this._isOpening = false;
            this.eventAggregator.publish("OpenRepositoryEnded");
            status.completed();
        });
    }
}
