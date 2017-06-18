import { Injectable } from "@angular/core";
import { EventAggregator } from "./event-aggregator";
import { Status } from "./status";
import { TabManager } from "./tab-manager";
import { HistoryTab } from "../main/tabs/tabs";
import { Git } from "./git/git";
import { Path } from "./path";

@Injectable()
export class RepositoryOpener {

    private _isOpening = false;

    get isOpening() {
        return this._isOpening;
    }

    constructor(private git: Git,
        private eventAggregator: EventAggregator,
        private status: Status,
        private tabManager: TabManager) { }

    async open(path: string) {
        const status = this.status.startProcess("Opening Repository");
        this.eventAggregator.publish("OpenRepositoryStarted");
        const repository = this.git.readRepository(path);
        const tab = new HistoryTab();
        tab.repository = repository;
        tab.ui.title = Path.getLastPart(path);
        tab.ui.isCloseable = false;
        tab.ui.isPersistent = true;
        this.tabManager.createNewTab(tab);
        this.eventAggregator.publish("OpenRepositoryEnded");
        repository.then(() => status.completed());
    }
}
