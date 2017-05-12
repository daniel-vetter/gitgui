import { Input, OnChanges, Component } from "@angular/core";
import { HistoryCommitEntry, HistoryRepository, VisibleRange, HistoryEntryBase, HistoryCurrentChangesEntry } from "../model/model";
import { ReusePool, PoolableViewModel } from "../services/reuse-pool";
import { LaneColorProvider } from "../services/lane-color-provider";
import { Metrics } from "../services/metrics";
import { RepositoryCommit } from "../../../../../model/model";

@Component({
    selector: "commit-titles",
    templateUrl: "./commit-titles.component.html",
    styleUrls: ["./commit-titles.component.scss"]
})
export class CommitTitlesComponent implements OnChanges {

    @Input() historyRepository: HistoryRepository = undefined;
    @Input() visibleRange: VisibleRange = undefined;

    visibleCommits = new ReusePool<HistoryEntryBase, CommitTitleViewModel>(() => new CommitTitleViewModel());

    constructor(private laneColorProvider: LaneColorProvider,
        private metrics: Metrics) {
        this.historyRepository = new HistoryRepository();
        this.visibleRange = new VisibleRange(0, 0);
    }

    ngOnChanges(changes) {
        this.updateVisibleCommits();
    }

    private updateVisibleCommits() {
        if (!this.historyRepository || !this.historyRepository.entries)
            return;

        const start = Math.max(0, this.visibleRange.start);
        const end = this.visibleRange.end;

        this.visibleCommits.remapRange(this.historyRepository.entries, start, end, (from, to) => {
            if (from instanceof HistoryCommitEntry) {
                to.id = from.hash;
                to.data = from;
                to.title = from.title;
                to.positionTop = this.metrics.commitHeight * from.index;
                to.color = this.laneColorProvider.getColorForLane(from.lane);
                to.profileImageCommit = from.repositoryCommit;
                to.isVirtual = false;
            }
            if (from instanceof HistoryCurrentChangesEntry) {
                to.isVirtual = true;
                to.title = "Uncommited changes";
            }
            return true;
        });
    }

    show(item) {
        console.log(item);
    }
}

export class CommitTitleViewModel implements PoolableViewModel<HistoryEntryBase> {
    id: string;
    data: HistoryEntryBase;
    title: string;
    positionTop: number;
    color: string;
    profileImageUrl: string;
    visible: boolean;
    profileImageCommit: RepositoryCommit;
    isVirtual: boolean;


    clear() {
        this.id = undefined;
        this.data = undefined;
        this.title = undefined;
        this.positionTop = undefined;
        this.color = undefined;
        this.profileImageUrl = undefined;
        this.isVirtual = undefined;
    }
}
