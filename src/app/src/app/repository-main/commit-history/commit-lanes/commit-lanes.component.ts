import { Component, Input, OnChanges } from "@angular/core";
import { HistoryRepository, VisibleRange, HistoryCommit, LaneSwitchPosition, Line } from "../model/model";
import { ReusePool, PoolableViewModel } from "../services/reuse-pool";
import { LaneColorProvider } from "../services/lane-color-provider";
import { LineIndex } from "../services/line-index";
import { GravatarUrlBuilder } from "../services/gravatar-url-builder";
import { Metrics } from "../services/metrics";
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
    @Input() commitHighlighted: HistoryCommit = undefined;
    @Input() commitClicked: HistoryCommit = undefined;
    @Input() commitSelected: HistoryCommit = undefined;

    leftBorderVisible = false;
    rightBorderVisible = false;

    visibleBubbles = new ReusePool<HistoryCommit, CommitBubbleViewModel>(() => new CommitBubbleViewModel());
    visibleLines = new ReusePool<Line, LineViewModel>(() => new LineViewModel());

    commitSelectedTop: number = undefined;
    commitHighlightedTop: number = undefined;
    commitClickedTop: number = undefined;

    private lineIndex = new LineIndex([]);
    private totalLaneCount = 0;

    constructor(private laneColorProvider: LaneColorProvider,
                private gravatarUrlBuilder: GravatarUrlBuilder,
                private metrics: Metrics) {}

    ngOnChanges(changes: any) {
        if (changes.commits) {
            this.lineIndex = new LineIndex(this.commits ? this.commits.commits : []);
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
            this.leftBorderVisible = this.horizontalScroll > 0 ;
            this.rightBorderVisible = this.metrics.getBubbleRight(this.totalLaneCount - 1) - this.width - this.horizontalScroll > 1;
            this.updateBubbles();
            this.updateLines();
        }

        if (changes.commitHighlighted || changes.commitSelected || changes.commitClicked) {
            this.updateHighlightBar();
        }
    }

    private updateHighlightBar() {
        if (this.commitClicked) {
            this.commitClickedTop = this.commitClicked.index * this.metrics.commitHeight;
        } else {
            this.commitClickedTop = undefined;
        }
        if (this.commitSelected) {
            this.commitSelectedTop = this.commitSelected.index * this.metrics.commitHeight;
        } else {
            this.commitSelectedTop = undefined;
        }
        if (this.commitHighlighted) {
            this.commitHighlightedTop = this.commitHighlighted.index * this.metrics.commitHeight;
        } else {
            this.commitHighlightedTop = undefined;
        }

        if (this.commitHighlighted === this.commitClicked)
            this.commitHighlightedTop = undefined;
        if (this.commitHighlighted === this.commitSelected)
            this.commitHighlightedTop = undefined;
        if (this.commitSelected === this.commitClicked)
            this.commitClickedTop = undefined;
    }

    private updateBubbles() {
        if (!this.commits || !this.commits.commits)
            return;

        const start = Math.max(0, this.visibleRange.start);
        const end = this.visibleRange.end;

        this.visibleBubbles.markAllUnused();

        for (let i = start; i <= end && i < this.commits.commits.length; i++) {
            const commit = this.commits.commits[i];
            const vm = this.visibleBubbles.giveViewModelFor(commit);
            vm.data = commit;
            vm.id = commit.hash;
            vm.positionTop = this.metrics.getBubbleTop(i);
            vm.positionLeft = this.metrics.getBubbleLeft(commit.lane) - this.horizontalScroll;
            vm.positionLeft = Math.max(vm.positionLeft, 0);
            vm.positionLeft = Math.min(vm.positionLeft, this.width - this.metrics.bubbleWidth);
            vm.profileImageUrl = this.gravatarUrlBuilder.getUrlFor(commit.authorMail);
            vm.color = this.laneColorProvider.getColorForLane(commit.lane);
        }

        this.visibleBubbles.clearUp();
    }

    private updateLines() {

        const startX = this.horizontalScroll / this.metrics.bubbleSpacing - 1;
        const endX = (this.width + this.horizontalScroll) / this.metrics.bubbleSpacing + 1;
        const linesToRender = this.lineIndex.getLinesInRangeRange(startX, this.visibleRange.start, endX, this.visibleRange.end);
        this.visibleLines.markAllUnused();

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

        this.visibleLines.clearUp();
    }
}

export class CommitBubbleViewModel implements PoolableViewModel<HistoryCommit> {
    id: string;
    data: HistoryCommit;
    color: string;
    positionTop: number;
    positionLeft: number;
    profileImageUrl: string;

    clear() {
        this.id = undefined;
        this.data = undefined;
        this.color = undefined;
        this.positionTop = undefined;
        this.positionLeft = undefined;
        this.profileImageUrl = undefined;
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
