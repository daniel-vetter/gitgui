import { Input, OnChanges, Component } from "@angular/core";
import { HistoryCommit, HistoryRepository, VisibleRange } from "../model/model";
import { ReusePool, PoolableViewModel } from "../services/reuse-pool";
import { LaneColorProvider } from "../services/lane-color-provider";
import { Metrics } from "../services/metrics";
import { GravatarUrlBuilder } from "../services/gravatar-url-builder";

@Component({
    selector: "commit-titles",
    templateUrl: "./commit-titles.component.html",
    styleUrls: ["./commit-titles.component.scss"]
})
export class CommitTitlesComponent implements OnChanges {

    @Input() commits: HistoryRepository =  undefined;
    @Input() visibleRange: VisibleRange = undefined;

    visibleCommits = new ReusePool<HistoryCommit, CommitTitleViewModel>(() => new CommitTitleViewModel());

    constructor(private laneColorProvider: LaneColorProvider,
                private metrics: Metrics,
                private gravatarUrlBuilder: GravatarUrlBuilder) {
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

        this.visibleCommits.makeAllInvisible();
        for (let i = start; i <= end && i < this.commits.commits.length; i++) {
            const commit = this.commits.commits[i];
            const vm = this.visibleCommits.giveViewModelFor(commit);
            vm.id = commit.hash;
            vm.data = commit;
            vm.title = commit.title;
            vm.positionTop = this.metrics.commitHeight * i;
            vm.color = this.laneColorProvider.getColorForLane(commit.lane);
            vm.profileImageUrl = this.gravatarUrlBuilder.getUrlFor(commit.authorMail);
        }
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

    clear() {
        this.id = undefined;
        this.data = undefined;
        this.title = undefined;
        this.positionTop = undefined;
        this.color = undefined;
        this.profileImageUrl = undefined;
    }
}
