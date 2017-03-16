import { Input, OnChanges, Component } from "@angular/core";
import { HistoryCommit, HistoryRepository, VisibleRange } from "../model/model";
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

    @Input() commits: HistoryRepository = undefined;
    @Input() visibleRange: VisibleRange = undefined;

    visibleCommits = new ReusePool<HistoryCommit, CommitTitleViewModel>(() => new CommitTitleViewModel());

    constructor(private laneColorProvider: LaneColorProvider,
        private metrics: Metrics) {
        this.commits = new HistoryRepository();
        this.visibleRange = new VisibleRange(0, 0);
    }

    ngOnChanges(changes) {
        this.updateVisibleCommits();
    }

    private updateVisibleCommits() {
        if (!this.commits || !this.commits.commits)
            return;

        const start = Math.max(0, this.visibleRange.start);
        const end = this.visibleRange.end;

        this.visibleCommits.remapRange(this.commits.commits, start, end, (from, to) => {
            to.id = from.hash;
            to.data = from;
            to.title = from.title;
            to.positionTop = this.metrics.commitHeight * from.index;
            to.color = this.laneColorProvider.getColorForLane(from.lane);
            to.profileImageCommit = from.repositoryCommit;
            return true;
        });
    }

    show(item) {
        console.log(item);
    }
}

export class CommitTitleViewModel implements PoolableViewModel<HistoryCommit> {
    id: string;
    data: HistoryCommit;
    title: string;
    positionTop: number;
    color: string;
    profileImageUrl: string;
    visible: boolean;
    profileImageCommit: RepositoryCommit;

    clear() {
        this.id = undefined;
        this.data = undefined;
        this.title = undefined;
        this.positionTop = undefined;
        this.color = undefined;
        this.profileImageUrl = undefined;
    }
}
