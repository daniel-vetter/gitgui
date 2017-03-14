import { Component, Input, Output, ViewChild, OnChanges, ChangeDetectorRef, EventEmitter } from "@angular/core";
import { LaneColorProvider } from "./services/lane-color-provider";
import { LaneAssigner } from "./services/lane-assigner";
import { Repository, RepositoryCommit } from "../../../model/model";
import { VisibleRange, HistoryRepository, HistoryCommit } from "./model/model";
import { RepositoryToHistoryRepositoryMapper } from "./services/repository-to-history-repository-mapper";
import { Metrics } from "./services/metrics";
import { OncePerFrame } from "./services/once-per-frame";

@Component({
    selector: "commit-history",
    templateUrl: "./commit-history.component.html",
    styleUrls: ["./commit-history.component.scss"]
})
export class CommitHistoryComponent implements OnChanges {

    @Input() repository: Repository = undefined;
    @Output() selectedCommitChange = new EventEmitter<RepositoryCommit>();
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
    commitHighlighted: HistoryCommit;
    commitSelected: HistoryCommit;

    showLeftLaneGridBorder: boolean = false;
    showRightLaneGridBorder: boolean = false;

    oncePerFrame = new OncePerFrame();

    constructor(private laneColorProvider: LaneColorProvider,
        private laneAssigner: LaneAssigner,
        private repositoryToHistoryRepositoryMapper: RepositoryToHistoryRepositoryMapper,
        private metrics: Metrics,
        private changeDetectorRef: ChangeDetectorRef) {
        changeDetectorRef.detach();
    }

    ngOnChanges(changes) {
        if (changes.repository) {
            this.historyRepository = this.repositoryToHistoryRepositoryMapper.map(this.repository);
            this.totalLaneGridWidth = this.metrics.getBubbleRight(this.historyRepository.totalLaneCount - 1);
            this.currentLaneGridWidth = Math.min(this.totalLaneGridWidth, this.metrics.getBubbleRight(10));
            this.maxScrollHeight = this.historyRepository.commits.length * this.metrics.commitHeight;
            this.commitClicked = undefined;
            this.commitHighlighted = undefined;
            this.commitSelected = undefined;
        }
        this.updateVisibleRange();
        this.updateShadowVisibility();
        this.changeDetectorRef.detectChanges();
    }

    onScroll(event) {
        this.oncePerFrame.run("scroll", () => {
            this.commitHighlighted = undefined;
            this.updateVisibleRange();
            this.changeDetectorRef.detectChanges();
        });
    }

    @Input()
    get selectedCommit() {
        if (this.commitSelected === undefined)
            return undefined;
        return this.commitSelected.repositoryCommit;
    }

    set selectedCommit(commit: RepositoryCommit) {

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
        this.changeDetectorRef.detectChanges();
    }

    onLaneGridResizeMouseDown(event: MouseEvent) {
        this.isInLaneGridResizeMode = true;
        this.changeDetectorRef.detectChanges();
    }

    onLaneGridResizeMouseUp(event: MouseEvent) {
        this.isInLaneGridResizeMode = false;
        this.changeDetectorRef.detectChanges();
    }

    onLaneGridResizeMouseMove(event) {
        if (this.isInLaneGridResizeMode) {
            this.currentLaneGridWidth =
                event.clientX -
                this.scrollWrapper.nativeElement.getBoundingClientRect().left -
                this.annotationGridWidth;
            this.limitLaneGridWidth();
            this.updateShadowVisibility();
            this.changeDetectorRef.detectChanges();
        }
    }

    onAnnotationGridResizeMouseDown(event: MouseEvent) {
        this.isInAnnotationGridResizeMode = true;
        this.changeDetectorRef.detectChanges();
    }

    onAnnotationGridResizeMouseUp(event: MouseEvent) {
        this.isInAnnotationGridResizeMode = false;
        this.changeDetectorRef.detectChanges();
    }

    onAnnotationGridResizeMouseMove(event) {
        if (this.isInAnnotationGridResizeMode) {
            this.annotationGridWidth =
                event.clientX -
                this.scrollWrapper.nativeElement.getBoundingClientRect().left;
            this.limitAnnotationGridWidth();
            this.updateShadowVisibility();
            this.changeDetectorRef.detectChanges();
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
        const minSize = 40;
        const maxSizeBecauseOfComponentBorder = this.scrollWrapper.nativeElement.clientWidth - 100 - this.currentLaneGridWidth;
        this.annotationGridWidth = Math.min(maxSizeBecauseOfComponentBorder, this.annotationGridWidth);
        this.annotationGridWidth = Math.max(minSize, this.annotationGridWidth);
    }

    onMouseMove(event) {
        const commitHighlighted = this.hitTest(event.clientX, event.clientY);
        const mouseX = event.clientX - this.scrollWrapper.nativeElement.getBoundingClientRect().left;
        const mouseIsInLaneGrid = mouseX > this.annotationGridWidth && mouseX < this.annotationGridWidth + this.currentLaneGridWidth;

        if (this.commitHighlighted !== commitHighlighted ||
            this.mouseIsInLaneGrid !== mouseIsInLaneGrid) {
            this.commitHighlighted = commitHighlighted;
            this.mouseIsInLaneGrid = mouseIsInLaneGrid;
            this.changeDetectorRef.detectChanges();
        }
    }

    onMouseOut(event) {
        if (event === undefined || this.scrollWrapper.nativeElement === event.target) {
            if (this.commitHighlighted !== undefined) {
                this.commitHighlighted = undefined;
                this.changeDetectorRef.detectChanges();
            }
        }
    }

    onMouseDown(event) {
        const clickedCommit = this.hitTest(event.clientX, event.clientY);
        if (clickedCommit) {
            this.commitSelected = this.commitClicked = clickedCommit;
            this.selectedCommitChange.emit(this.selectedCommit);
            this.changeDetectorRef.detectChanges();
        }

    }

    onMouseUp(event) {
        this.commitClicked = undefined;
        this.changeDetectorRef.detectChanges();
    }

    hitTest(x: number, y: number): HistoryCommit {
        const bounds = this.scrollWrapper.nativeElement.getBoundingClientRect();
        x -= bounds.left;
        y -= bounds.top - this.scrollWrapper.nativeElement.scrollTop;
        if (x < 0 || x > this.scrollWrapper.nativeElement.clientWidth ||
            y < 0 || y > this.maxScrollHeight)
            return undefined;
        const index = Math.floor(y / this.metrics.commitHeight);
        return this.historyRepository.commits[index];
    }

    onWindowResize() {
        this.updateVisibleRange();
        this.limitLaneGridWidth();
        this.updateShadowVisibility();
        this.changeDetectorRef.detectChanges();
    }

    onKeyDown(event) {
        this.oncePerFrame.run("keydown", () => {
            if (!this.commitSelected) return;
            let move = 0;
            if (event.keyCode === 40) move = 1;
            if (event.keyCode === 38) move = -1;
            if (event.keyCode === 33) move = -Math.floor(this.scrollWrapper.nativeElement.clientHeight / this.metrics.commitHeight);
            if (event.keyCode === 34) move = Math.floor(this.scrollWrapper.nativeElement.clientHeight / this.metrics.commitHeight);

            const newIndex = Math.min(Math.max(0, this.commitSelected.index + move), this.historyRepository.commits.length - 1);
            this.commitSelected = this.historyRepository.commits[newIndex];
            this.selectedCommitChange.emit(this.selectedCommit);
            this.scrollToCurrentSelection();
            this.changeDetectorRef.detectChanges();
        });
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
