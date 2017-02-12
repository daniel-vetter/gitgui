import { Component, Input, OnChanges } from "@angular/core";
import { HistoryRepository, VisibleRange, HistoryCommit, LaneSwitchPosition, Line } from "../model/model";
import { ReusePool, PoolableViewModel } from "../services/reuse-pool";
import { LaneColorProvider } from "../services/lane-color-provider";
import { Metrics } from "../services/metrics";
import { LineRangeQueryHelper } from "../services/line-range-query-helper";
@Component({
    selector: "commit-lanes",
    templateUrl: "./commit-lanes.component.html",
    styleUrls: ["./commit-lanes.component.scss"]
})
export class CommitLanesComponent implements OnChanges {

    @Input() commits: HistoryRepository = undefined;
    @Input() visibleRange: VisibleRange = undefined;
    @Input() horizontalScroll = 0;
    @Input() width = 0;

    visibleBubbles = new ReusePool<HistoryCommit, CommitBubbleViewModel>(() => new CommitBubbleViewModel());
    visibleLines = new ReusePool<Line, LineViewModel>(() => new LineViewModel());

    private lineQueryHelper = new LineRangeQueryHelper([]);
    private totalLaneCount = 0;

    constructor(private laneColorProvider: LaneColorProvider,
                private metrics: Metrics) {}

    ngOnChanges(changes: any) {
        if (changes.commits) {
            this.lineQueryHelper = new LineRangeQueryHelper(this.commits ? this.commits.commits : []);
            this.totalLaneCount = 0;
            if (this.commits && this.commits.commits) {
                for (const commit of this.commits.commits) {
                    if (commit.lane + 1 > this.totalLaneCount)
                        this.totalLaneCount = commit.lane + 1;
                }
            } else {
                this.totalLaneCount = 0;
            }
        }
        if (changes.visibleRange || changes.horizontalScroll || changes.width) {
            this.updateBubbles();
            this.updateLines();
        }
    }

    private updateBubbles() {
        if (!this.commits || !this.commits.commits)
            return;

        const start = Math.max(0, this.visibleRange.start);
        const end = this.visibleRange.end;

        this.visibleBubbles.makeAllInvisible();

        for (let i = start; i <= end && i < this.commits.commits.length; i++) {
            const commit = this.commits.commits[i];
            const vm = this.visibleBubbles.giveViewModelFor(commit);
            vm.data = commit;
            vm.id = commit.hash;
            vm.positionTop = this.metrics.getBubbleTop(i);
            vm.positionLeft = this.metrics.getBubbleLeft(commit.lane) - this.horizontalScroll;
            vm.color = this.laneColorProvider.getColorForLane(commit.lane);
            vm.showAnnotationLine = commit.tags.length > 0 || commit.branches.length > 0;
        }
    }

    private updateLines() {

        const startX = this.horizontalScroll / this.metrics.bubbleSpacing - 1;
        const endX = (this.width + this.horizontalScroll) / this.metrics.bubbleSpacing + 1;
        const linesToRender = this.lineQueryHelper.getLinesInRange(startX, this.visibleRange.start, endX, this.visibleRange.end);
        this.visibleLines.makeAllInvisible();

        for (const line of linesToRender) {

            const vm = this.visibleLines.giveViewModelFor(line);
            vm.data = line;
            vm.positionLeft = this.metrics.getBubbleCenterX(Math.min(line.laneStart, line.laneEnd)) - this.horizontalScroll;
            vm.width = this.metrics.getBubbleCenterX(Math.max(line.laneStart, line.laneEnd)) - vm.positionLeft - this.horizontalScroll;
            vm.width = (Math.max(line.laneStart, line.laneEnd) - Math.min(line.laneStart, line.laneEnd)) * this.metrics.bubbleSpacing;
            vm.positionTop = this.metrics.getBubbleCenterY(Math.min(line.indexStart, line.indexEnd));
            vm.height = this.metrics.getBubbleCenterY(Math.max(line.indexStart, line.indexEnd)) - vm.positionTop;

            vm.positionLeft -= 2;
            vm.width += 3;
            vm.positionTop -= 1;
            vm.height += 3;

            let color = "";

            if (line.laneSwitchPosition === LaneSwitchPosition.Start) {
                color = this.laneColorProvider.getColorForLane(line.laneEnd);
                vm.borderTopColor = color;
                if (line.laneStart > line.laneEnd) vm.borderLeftColor = color;
                if (line.laneStart <= line.laneEnd) vm.borderRightColor = color;
            } else {
                color = this.laneColorProvider.getColorForLane(line.laneStart);
                vm.borderBottomColor = color;
                if (line.laneStart > line.laneEnd) vm.borderRightColor = color;
                if (line.laneStart <= line.laneEnd) vm.borderLeftColor = color;
            }

            if (vm.borderTopColor && vm.borderRightColor) vm.borderRadius = "0% 15px 0% 0%";
            if (vm.borderTopColor && vm.borderLeftColor) vm.borderRadius = "15px 0% 0% 0%";
            if (vm.borderBottomColor && vm.borderLeftColor) vm.borderRadius = "0% 0% 0% 15px";
            if (vm.borderBottomColor && vm.borderRightColor) vm.borderRadius = "0% 0% 15px 0%";


            if (!vm.borderTopColor) vm.borderTopColor = "transparent";
            if (!vm.borderLeftColor) vm.borderLeftColor = "transparent";
            if (!vm.borderRightColor) vm.borderRightColor = "transparent";
            if (!vm.borderBottomColor) vm.borderBottomColor = "transparent";
        }
    }
}

export class CommitBubbleViewModel implements PoolableViewModel<HistoryCommit> {
    id: string;
    data: HistoryCommit;
    color: string;
    positionTop: number;
    positionLeft: number;
    profileImageUrl: string;
    showAnnotationLine: boolean;
    visible: boolean;

    clear() {
        this.id = undefined;
        this.data = undefined;
        this.color = undefined;
        this.positionTop = undefined;
        this.positionLeft = undefined;
        this.showAnnotationLine = undefined;
    }
}

export class LineViewModel implements PoolableViewModel<Line> {
    id: string;
    data: Line;
    positionTop: number;
    positionLeft: number;
    width: number;
    height: number;
    borderTopColor: string;
    borderLeftColor: string;
    borderRightColor: string;
    borderBottomColor: string;
    borderRadius: string;
    visible: boolean;

    clear() {
        this.id = undefined;
        this.data = undefined;
        this.positionTop = undefined;
        this.positionLeft = undefined;
        this.width = undefined;
        this.height = undefined;
        this.borderTopColor = undefined;
        this.borderLeftColor = undefined;
        this.borderRightColor = undefined;
        this.borderBottomColor = undefined;
        this.borderRadius = undefined;
    }
}
