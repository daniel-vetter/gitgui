import { Component, Input, OnChanges } from "@angular/core";
import { HistoryRepository, VisibleRange, HistoryCommitEntry, LaneSwitchPosition, Line, HistoryEntryBase } from "../model/model";
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

    @Input() historyRepository: HistoryRepository;
    @Input() visibleRange: VisibleRange;
    @Input() horizontalScroll = 0;
    @Input() width = 0;

    visibleBubbles = new ReusePool<HistoryEntryBase, CommitBubbleViewModel>(() => new CommitBubbleViewModel());
    visibleLines = new ReusePool<Line, LineViewModel>(() => new LineViewModel());

    private lineQueryHelper = new LineRangeQueryHelper([]);
    private totalLaneCount = 0;

    constructor(private laneColorProvider: LaneColorProvider,
        private metrics: Metrics) { }

    ngOnChanges(changes: any) {
        if (!this.historyRepository)
            return;
        if (changes.historyRepository) {
            this.lineQueryHelper = new LineRangeQueryHelper(this.historyRepository ? this.historyRepository.entries : []);
            this.totalLaneCount = 0;
            if (this.historyRepository && this.historyRepository.entries) {
                for (const commit of this.historyRepository.entries) {
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
        if (!this.historyRepository || !this.historyRepository.entries)
            return;

        const start = Math.max(0, this.visibleRange.start);
        const end = this.visibleRange.end;

        this.visibleBubbles.makeAllInvisible();
        this.visibleBubbles.remapRange(this.historyRepository.entries, start, end, (entry, vm) => {

            vm.positionTop = this.metrics.getBubbleTop(entry.index);
            vm.positionLeft = this.metrics.getBubbleLeft(entry.lane) - this.horizontalScroll;
            vm.lineWidth = Math.max(0, vm.positionLeft + this.metrics.bubbleWidth / 2);
            vm.color = this.laneColorProvider.getColorForLane(entry.lane);
            if (entry instanceof HistoryCommitEntry) {
                vm.showAnnotationLine = entry.tags.length > 0 || entry.branches.length > 0;
            } else {
                vm.showAnnotationLine = false;
            }

            return true;
        });
    }

    private updateLines() {

        const startX = this.horizontalScroll / this.metrics.bubbleSpacing - 1;
        const endX = (this.width + this.horizontalScroll) / this.metrics.bubbleSpacing + 1;
        const linesToRender = this.lineQueryHelper.getLinesInRange(startX, this.visibleRange.start, endX, this.visibleRange.end);
        this.visibleLines.makeAllInvisible();

        this.visibleLines.remap(linesToRender, (line, vm) => {
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

            return true;
        });
    }
}

export class CommitBubbleViewModel implements PoolableViewModel<HistoryCommitEntry> {
    data: HistoryCommitEntry | undefined;
    color: string;
    positionTop: number;
    positionLeft: number;
    lineWidth: number;
    profileImageUrl: string;
    showAnnotationLine: boolean;
    visible: boolean;

    clear() {
        this.data = undefined;
        this.color = "#000000";
        this.positionTop = 0;
        this.positionLeft = 0;
        this.lineWidth = 0;
        this.showAnnotationLine = false;
        this.visible = false;
    }
}

export class LineViewModel implements PoolableViewModel<Line> {
    data: Line | undefined;
    positionTop: number;
    positionLeft: number;
    width: number;
    height: number;
    borderTopColor: string | undefined;
    borderLeftColor: string | undefined;
    borderRightColor: string | undefined;
    borderBottomColor: string | undefined;
    borderRadius: string;
    visible: boolean;

    clear() {
        this.data = undefined;
        this.positionTop = 0;
        this.positionLeft = 0;
        this.width = 0;
        this.height = 0;
        this.borderTopColor = undefined;
        this.borderLeftColor = undefined;
        this.borderRightColor = undefined;
        this.borderBottomColor = undefined;
        this.borderRadius = "0%";
        this.visible = false;
    }
}
