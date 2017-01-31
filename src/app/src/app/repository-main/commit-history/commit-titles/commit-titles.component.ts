import { Input, OnChanges, Component } from "@angular/core";
import { HistoryCommit, HistoryRepository, VisibleRange } from "../model/model";
import { ReusePool, PoolableViewModel } from "../services/reuse-pool";
import { LaneColorProvider } from "../services/lane-color-provider";
import { Metrics } from "../services/metrics";

@Component({
    selector: "commit-titles",
    templateUrl: "./commit-titles.component.html",
    styleUrls: ["./commit-titles.component.scss"]
})
export class CommitTitlesComponent implements OnChanges {

    @Input() commits: HistoryRepository =  undefined;
    @Input() visibleRange: VisibleRange = undefined;
    @Input() commitHighlighted: HistoryCommit = undefined;
    @Input() commitClicked: HistoryCommit = undefined;
    @Input() commitSelected: HistoryCommit = undefined;

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

        this.visibleCommits.markAllUnused();
        for (let i = start; i <= end && i < this.commits.commits.length; i++) {
            const commit = this.commits.commits[i];
            const vm = this.visibleCommits.giveViewModelFor(commit);
            vm.id = commit.hash;
            vm.data = commit;
            vm.title = commit.title;
            vm.positionTop = this.metrics.commitHeight * i;
            vm.color = this.laneColorProvider.getColorForLane(commit.lane);
            vm.highlighted = this.commitHighlighted === commit;
            vm.clicked = this.commitClicked === commit;
            vm.selected = this.commitSelected === commit;
        }
        this.visibleCommits.clearUp();
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
    highlighted: boolean;
    selected: boolean;
    clicked: boolean;

    clear() {
        this.id = undefined;
        this.data = undefined;
        this.title = undefined;
        this.positionTop = undefined;
        this.color = undefined;
        this.highlighted = undefined;
    }
}
