import { Component, Input, Output, ViewChild, OnChanges, ChangeDetectorRef,
    EventEmitter, ElementRef, SimpleChanges, OnDestroy, OnInit, NgZone, AfterViewInit
} from "@angular/core";
import { LaneColorProvider } from "./services/lane-color-provider";
import { LaneAssigner } from "./services/lane-assigner";
import { Repository, RepositoryCommit, UpdatedElements } from "../../../../services/git/model";
import { VisibleRange, HistoryRepository, HistoryCommitEntry, HistoryEntryBase } from "./model/model";
import { RepositoryToHistoryRepositoryMapper } from "./services/repository-to-history-repository-mapper";
import { Metrics } from "./services/metrics";
import { OncePerFrame } from "./services/once-per-frame";
import { Subscription } from "../../../../services/event-aggregator";
import * as Rx from "rxjs";

@Component({
    selector: "commit-history",
    templateUrl: "./commit-history.component.html",
    styleUrls: ["./commit-history.component.scss"]
})
export class CommitHistoryComponent implements OnChanges, OnInit, OnDestroy, AfterViewInit {

    @Input() repository?: Repository;
    @Output() selectedCommitChange = new EventEmitter<RepositoryCommit>();
    @ViewChild("canvas") canvas: ElementRef;
    @ViewChild("scrollWrapper") scrollWrapper: ElementRef;
    @ViewChild("root") root: ElementRef;

    visibleRange: VisibleRange;
    currentLaneGridWidth = 0;
    totalLaneGridWidth = 0;
    laneGridScrollPosition = 0;
    maxScrollHeight = 0;
    annotationGridWidth = 200;
    isInLaneGridResizeMode = false;
    isInAnnotationGridResizeMode = false;
    historyRepository?: HistoryRepository;
    mouseIsInLaneGrid = false;

    entryClicked: HistoryEntryBase | undefined;
    entryHighlighted: HistoryEntryBase | undefined;
    entrySelected: HistoryEntryBase | undefined;

    showLeftLaneGridBorder = false;
    showRightLaneGridBorder = false;

    showLoadingAnimation = false;

    oncePerFrame = new OncePerFrame();
    onUpdateStartedSubscription: Subscription;
    onUpdateFinishedSubscription: Subscription;

    onDocumentMouseMoveWithoutChangeDetectionSubscription: Rx.Subscription;
    onScrollWrapperMouseMoveWithoutChangeDetectionSubscription: Rx.Subscription;
    onScrollWrapperScrollWithoutChangeDetectionSubscription: Rx.Subscription;

    constructor(private laneColorProvider: LaneColorProvider,
        private laneAssigner: LaneAssigner,
        private repositoryToHistoryRepositoryMapper: RepositoryToHistoryRepositoryMapper,
        private metrics: Metrics,
        private ngZone: NgZone) {
    }

    ngOnInit() {
        this.ngZone.runOutsideAngular(() => {
            this.onDocumentMouseMoveWithoutChangeDetectionSubscription =
                Rx.Observable.fromEvent(document, "mousemove").subscribe((x: MouseEvent) => {
                this.onDocumentMouseMoveWithoutChangeDetection(x);
            });
            this.onScrollWrapperMouseMoveWithoutChangeDetectionSubscription =
                Rx.Observable.fromEvent(this.scrollWrapper.nativeElement, "mousemove").subscribe((x: MouseEvent) => {
                this.onMouseMove(x);
            });
            this.onScrollWrapperScrollWithoutChangeDetectionSubscription =
                Rx.Observable.fromEvent(this.scrollWrapper.nativeElement, "scroll").subscribe((x: MouseEvent) => {
                this.onScroll(x);
            });
        })
    }

    ngOnDestroy() {
        this.onDocumentMouseMoveWithoutChangeDetectionSubscription.unsubscribe();
        this.onScrollWrapperMouseMoveWithoutChangeDetectionSubscription.unsubscribe();
        this.onScrollWrapperScrollWithoutChangeDetectionSubscription.unsubscribe();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.repository) {
            if (this.onUpdateStartedSubscription)
                this.onUpdateStartedSubscription.unsubscribe();
            if (this.onUpdateFinishedSubscription)
                this.onUpdateFinishedSubscription.unsubscribe();

            this.displayRepository();
            if (this.repository) {
                this.onUpdateStartedSubscription = this.repository.updateState.onUpdateStarted.subscribe((x: UpdatedElements) => {
                    this.showLoadingAnimation = x.commits || x.head;
                });
                this.onUpdateFinishedSubscription = this.repository.updateState.onUpdateFinished.subscribe((x: UpdatedElements) => {
                    this.showLoadingAnimation = false;
                    this.displayRepository();
                    this.updateVisibleRange();
                    this.updateShadowVisibility();
                });
                this.showLoadingAnimation = this.repository.updateState.isUpdating;
            }
        }

        this.updateVisibleRange();
        this.updateShadowVisibility();
    }

    ngAfterViewInit() {
        this.updateVisibleRange();
    }

    private displayRepository() {
        if (this.repository) {
            this.historyRepository = this.repositoryToHistoryRepositoryMapper.map(this.repository);
            this.totalLaneGridWidth = this.metrics.getBubbleRight(this.historyRepository.totalLaneCount - 1);
            this.currentLaneGridWidth = Math.min(this.totalLaneGridWidth, this.metrics.getBubbleRight(10));
            this.maxScrollHeight = this.historyRepository.entries.length * this.metrics.commitHeight;
        } else {
            this.historyRepository = undefined;
            this.totalLaneGridWidth = 0;
            this.currentLaneGridWidth = 0;
            this.maxScrollHeight = 0;
        }
        this.entryClicked = undefined;
        this.entryHighlighted = undefined;
        this.entrySelected = undefined;
    }

    onScroll(event: Event) {
        this.oncePerFrame.run("scroll", () => {
            this.entryHighlighted = undefined;
            this.updateVisibleRange();
        });
    }

    @Input()
    get selectedCommit(): RepositoryCommit | undefined {
        if (this.entrySelected === undefined)
            return undefined;
        if (!(this.entrySelected instanceof HistoryCommitEntry))
            return undefined;
        return this.entrySelected.repositoryCommit;
    }

    set selectedCommit(commit: RepositoryCommit | undefined) {
        // TODO
    }

    private updateVisibleRange() {

        const startY = Math.floor(this.scrollWrapper.nativeElement.scrollTop / this.metrics.commitHeight);
        const endY = Math.floor(startY + this.scrollWrapper.nativeElement.clientHeight / this.metrics.commitHeight) + 1;
        const overdraw = 5;
        const newVisibleRange = new VisibleRange(startY - overdraw, endY + overdraw);
        if (this.visibleRange === undefined ||
            this.visibleRange.start !== newVisibleRange.start ||
            this.visibleRange.end !== newVisibleRange.end)
            this.ngZone.run(() => {
                this.visibleRange = newVisibleRange;
            });
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

    private onDocumentMouseMoveWithoutChangeDetection(event: MouseEvent) {
        if (this.isInAnnotationGridResizeMode) {
            this.ngZone.run(() => {
                this.annotationGridWidth =
                    event.clientX -
                    this.scrollWrapper.nativeElement.getBoundingClientRect().left;
                this.limitAnnotationGridWidth();
                this.updateShadowVisibility();
            });
        }
        if (this.isInLaneGridResizeMode) {
            this.ngZone.run(() => {
                this.currentLaneGridWidth =
                    event.clientX -
                    this.scrollWrapper.nativeElement.getBoundingClientRect().left -
                    this.annotationGridWidth;
                this.limitLaneGridWidth();
                this.updateShadowVisibility();
            });
        }
    }

    onAnnotationGridResizeMouseDown(event: MouseEvent) {
        this.isInAnnotationGridResizeMode = true;
    }

    onAnnotationGridResizeMouseUp(event: MouseEvent) {
        this.isInAnnotationGridResizeMode = false;
    }

    private limitLaneGridWidth() {
        if (!this.historyRepository) return;
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

    onMouseMove(event: MouseEvent) {
        if (!this.repository)
            return;
        const commitHighlighted = this.hitTest(event.clientX, event.clientY);
        const mouseX = event.clientX - this.scrollWrapper.nativeElement.getBoundingClientRect().left;
        const mouseIsInLaneGrid = mouseX > this.annotationGridWidth && mouseX < this.annotationGridWidth + this.currentLaneGridWidth;

        if (this.entryHighlighted !== commitHighlighted ||
            this.mouseIsInLaneGrid !== mouseIsInLaneGrid) {
            this.ngZone.run(() => {
                this.entryHighlighted = commitHighlighted;
                this.mouseIsInLaneGrid = mouseIsInLaneGrid;
            })
        }
    }

    onMouseLeave(event: MouseEvent) {
        if (!this.repository)
            return;
        if (this.entryHighlighted !== undefined) {
            this.entryHighlighted = undefined;
        }
    }

    onMouseDown(event: MouseEvent) {
        if (!this.repository)
            return;
        const clickedCommit = this.hitTest(event.clientX, event.clientY);
        if (clickedCommit) {
            this.entrySelected = this.entryClicked = clickedCommit;
            this.selectedCommitChange.emit(this.selectedCommit);
        }

    }

    onMouseUp(event: MouseEvent) {
        if (!this.repository)
            return;
        this.entryClicked = undefined;
    }

    hitTest(x: number, y: number): HistoryEntryBase | undefined {
        if (!this.historyRepository)
            return undefined;
        const bounds = this.scrollWrapper.nativeElement.getBoundingClientRect();
        x -= bounds.left;
        y -= bounds.top - this.scrollWrapper.nativeElement.scrollTop;
        if (x < 0 || x > this.scrollWrapper.nativeElement.clientWidth ||
            y < 0 || y > this.maxScrollHeight)
            return undefined;
        const index = Math.floor(y / this.metrics.commitHeight);
        return this.historyRepository.entries[index];
    }

    onWindowResize() {
        if (!this.repository)
            return;
        this.updateVisibleRange();
        this.limitLaneGridWidth();
        this.updateShadowVisibility();
    }

    onKeyDown(event: KeyboardEvent) {
        this.oncePerFrame.run("keydown", () => {
            if (!this.entrySelected) return;
            if (!this.historyRepository) return;
            let move = 0;
            if (event.keyCode === 40) move = 1;
            if (event.keyCode === 38) move = -1;
            if (event.keyCode === 33) move = -Math.floor(this.scrollWrapper.nativeElement.clientHeight / this.metrics.commitHeight);
            if (event.keyCode === 34) move = Math.floor(this.scrollWrapper.nativeElement.clientHeight / this.metrics.commitHeight);

            const newIndex = Math.min(Math.max(0, this.entrySelected.index + move), this.historyRepository.entries.length - 1);
            this.entrySelected = this.historyRepository.entries[newIndex];
            this.selectedCommitChange.emit(this.selectedCommit);
            this.scrollToCurrentSelection();
        });
    }

    private scrollToCurrentSelection() {
        if (!this.entrySelected) return;
        const commitTop = this.entrySelected.index * this.metrics.commitHeight;
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
