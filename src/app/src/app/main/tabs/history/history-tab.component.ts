import { Component, Input } from "@angular/core";
import { HistoryTab } from "../tabs";
import { Repository, RepositoryCommit } from "../../../model/model";

@Component({
    selector: "history-tab",
    templateUrl: "./history-tab.component.html"
})
export class HistoryTabComponent {
    @Input() tab: HistoryTab = undefined;

    repository: Repository;
    selectedCommit: RepositoryCommit;

    ngOnChanges() {
        this.repository = this.tab.repository;
        if (this.repository) {
            this.tab.title = this.repository.location;
            this.tab.isCloseable = false;
        }
    }
}
