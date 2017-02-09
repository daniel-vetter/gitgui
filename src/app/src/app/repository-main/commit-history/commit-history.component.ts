import { Component, Input, ViewChild, OnChanges } from "@angular/core";
import { LaneColorProvider } from "./services/lane-color-provider";
import { LaneAssigner } from "./services/lane-assigner";
import { Repository } from "../../model/model";
import { VisibleRange, HistoryRepository, HistoryCommit } from "./model/model";
import { RepositoryToHistoryRepositoryMapper } from "./services/repository-to-history-repository-mapper";
import { Metrics } from "./services/metrics";

@Component({
    selector: "commit-history",
    templateUrl: "./commit-history.component.html",
    styleUrls: ["./commit-history.component.scss"]
})
export class CommitHistoryComponent implements OnChanges {

    @Input() repository: Repository = undefined;
    @ViewChild("canvas") canvas;
    @ViewChild("scrollWrapper") scrollWrapper;
    @ViewChild("root") root;

    visibleRange: VisibleRange;
    currentLaneGridWidth = 0;
    totalLaneGridWidth = 0;
    laneGridScrollPosition = 0;
    maxScrollHeight = 0;
    annotationGridWidth = 200;
    isInLaneGridResizeMode = false;
    isInAnnotationGridResizeMode = false;
    historyRepository: HistoryRepository;
    mouseIsInLaneGrid = false;

    commitClicked: HistoryCommit;
    commitSelected: HistoryCommit;
    commitHighlighted: HistoryCommit;

    showLeftLaneGridBorder: boolean = false;
    showRightLaneGridBorder: boolean = false;


    constructor(private laneColorProvider: LaneColorProvider,
        private laneAssigner: LaneAssigner,
        private repositoryToHistoryRepositoryMapper: RepositoryToHistoryRepositoryMapper,
        private metrics: Metrics) {
    }

    ngOnChanges() {
        if (this.repository && this.repository.commits) {
            this.historyRepository = this.repositoryToHistoryRepositoryMapper.map(this.repository);
            this.totalLaneGridWidth = this.metrics.getBubbleRight(this.historyRepository.totalLaneCount - 1);
            this.currentLaneGridWidth = Math.min(this.totalLaneGridWidth, this.metrics.getBubbleRight(10));
            this.maxScrollHeight = this.historyRepository.commits.length * this.metrics.commitHeight;
            this.commitClicked = undefined;
            this.commitHighlighted = undefined;
            this.commitSelected = undefined;
        }
        this.updateVisibleRange();
    }

    onScroll(event) {
        this.commitHighlighted = undefined;
        this.updateVisibleRange();
    }

    private updateVisibleRange() {
        const startY = Math.floor(this.scrollWrapper.nativeElement.scrollTop / this.metrics.commitHeight);
        const endY = Math.floor(startY + this.scrollWrapper.nativeElement.clientHeight / this.metrics.commitHeight) + 1;
        const overdraw = 10;
        this.visibleRange = new VisibleRange(startY - overdraw, endY + overdraw);
    }

    onLaneGridScroll(event: UIEvent) {
        this.laneGridScrollPosition = (<HTMLDivElement>event.target).scrollLeft;
        this.updateShadowVisibility();
    }

    onLaneGridResizeMouseDown(event: MouseEvent) {
        this.isInLaneGridResizeMode = true;
    }

    onLaneGridResizeMouseUp(event: MouseEvent) {
        this.isInLaneGridResizeMode = false;
    }

    onLaneGridResizeMouseMove(event) {
        if (this.isInLaneGridResizeMode) {
            this.currentLaneGridWidth =
                event.clientX -
                this.scrollWrapper.nativeElement.getBoundingClientRect().left -
                this.annotationGridWidth;
            this.limitLaneGridWidth();
            this.updateShadowVisibility();
        }
    }

    onAnnotationGridResizeMouseDown(event: MouseEvent) {
        this.isInAnnotationGridResizeMode = true;
    }

    onAnnotationGridResizeMouseUp(event: MouseEvent) {
        this.isInAnnotationGridResizeMode = false;
    }

    onAnnotationGridResizeMouseMove(event) {
        if (this.isInAnnotationGridResizeMode) {
            this.annotationGridWidth =
                event.clientX -
                this.scrollWrapper.nativeElement.getBoundingClientRect().left;
            this.limitAnnotationGridWidth();
            this.updateShadowVisibility();
        }
    }

    private limitLaneGridWidth() {
        const minSize = this.metrics.bubbleWidth;
        const maxSizeBecauseOfComponentBorder = this.scrollWrapper.nativeElement.clientWidth - this.annotationGridWidth - 100;
        const maxSizeBecauseOfLaneCount = this.metrics.getBubbleRight(this.historyRepository.totalLaneCount - 1);
        this.currentLaneGridWidth = Math.min(maxSizeBecauseOfLaneCount, this.currentLaneGridWidth);
        this.currentLaneGridWidth = Math.min(maxSizeBecauseOfComponentBorder, this.currentLaneGridWidth);
        this.currentLaneGridWidth = Math.max(minSize, this.currentLaneGridWidth);
    }

    private limitAnnotationGridWidth() {
        const minSize = 10;
        const maxSizeBecauseOfComponentBorder = this.scrollWrapper.nativeElement.clientWidth - 100 - this.currentLaneGridWidth;
        this.annotationGridWidth = Math.min(maxSizeBecauseOfComponentBorder, this.annotationGridWidth);
        this.annotationGridWidth = Math.max(minSize, this.annotationGridWidth);
    }

    onMouseMove(event) {
        this.commitHighlighted = this.hitTest(event.clientX, event.clientY);

        const mouseX = event.clientX - this.scrollWrapper.nativeElement.getBoundingClientRect().left;
        this.mouseIsInLaneGrid = mouseX > this.annotationGridWidth && mouseX < this.annotationGridWidth + this.currentLaneGridWidth;
    }

    onMouseOut(event) {
        if (event === undefined || this.scrollWrapper.nativeElement === event.target) {
            this.commitHighlighted = undefined;
        }
    }

    onMouseDown(event) {
        this.commitSelected = this.commitClicked = this.hitTest(event.clientX, event.clientY);
    }

    onMouseUp(event) {
        this.commitClicked = undefined;
    }

    hitTest(x: number, y: number): HistoryCommit {
        const bounds = this.scrollWrapper.nativeElement.getBoundingClientRect();
        x -= this.annotationGridWidth + bounds.left;
        y -= bounds.top - this.scrollWrapper.nativeElement.scrollTop;
        if (x < 0 || x > this.scrollWrapper.nativeElement.clientWidth - this.annotationGridWidth ||
            y < 0 || y > this.maxScrollHeight)
            return undefined;
        const index = Math.floor(y / this.metrics.commitHeight);
        return this.historyRepository.commits[index];
    }

    onWindowResize() {
        this.updateVisibleRange();
        this.limitLaneGridWidth();
        this.updateShadowVisibility();
    }

    onKeyDown(event) {
        if (!this.commitSelected) return;
        let move = 0;
        if (event.keyCode === 40) move = 1;
        if (event.keyCode === 38) move = -1;
        if (event.keyCode === 33) move = -Math.floor(this.scrollWrapper.nativeElement.clientHeight / this.metrics.commitHeight);
        if (event.keyCode === 34) move = Math.floor(this.scrollWrapper.nativeElement.clientHeight / this.metrics.commitHeight);

        const newIndex = Math.min(Math.max(0, this.commitSelected.index + move), this.historyRepository.commits.length - 1);
        this.commitSelected = this.historyRepository.commits[newIndex];
        this.scrollToCurrentSelection();
    }

    private scrollToCurrentSelection() {
        if (!this.commitSelected) return;
        const commitTop = this.commitSelected.index * this.metrics.commitHeight;
        const commitBottom = commitTop + this.metrics.commitHeight;

        if (commitTop < this.scrollWrapper.nativeElement.scrollTop) {
            this.scrollWrapper.nativeElement.scrollTop = commitTop;
        }
        if (commitBottom > this.scrollWrapper.nativeElement.scrollTop + this.scrollWrapper.nativeElement.clientHeight) {
            this.scrollWrapper.nativeElement.scrollTop = commitBottom - this.scrollWrapper.nativeElement.clientHeight;
        }
    }

    private updateShadowVisibility() {
        this.showLeftLaneGridBorder = this.laneGridScrollPosition > 0;
        this.showRightLaneGridBorder = this.laneGridScrollPosition < this.totalLaneGridWidth - this.currentLaneGridWidth - 1;
    }
}
