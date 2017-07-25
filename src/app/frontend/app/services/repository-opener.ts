import { Injectable } from "@angular/core";
import { EventAggregator } from "./event-aggregator";
import { Status } from "./status";
import { HistoryTabData } from "../main/tabs/tabs";
import { Git } from "./git/git";
import { Path } from "./path";
import { TabManager } from "app/services/tabs/tab-manager";

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
        const page = this.tabManager.createNewTab({
            type: "HistoryTab",
            repository: repository
        });
        page.title = Path.getLastPart(path);
        page.isCloseable = false;
        page.isPersistent = true;
        this.eventAggregator.publish("OpenRepositoryEnded");
        repository.then(() => status.completed());
    }
}
