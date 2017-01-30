import { Component, Input, ViewChild, OnChanges, ChangeDetectorRef, ChangeDetectionStrategy, DoCheck  } from "@angular/core";
import { LaneColorProvider } from "./services/lane-color-provider";
import { LineIndex } from "./services/line-index";
import { LaneAssigner } from "./services/lane-assigner";
import { Repository, RepositoryCommit } from "../../model/model";
import { VisibleRange, HistoryRepository, HistoryCommit } from "./model/model";
import { RepositoryToHistoryRepositoryMapper } from "./services/repository-to-history-repository-mapper";

@Component({
    selector: "commit-history",
    templateUrl: "./commit-history.component.html",
    styleUrls: ["./commit-history.component.scss"]
})
export class CommitHistoryComponent implements OnChanges  {

    @Input() repository: Repository = undefined;
    @ViewChild("canvas") canvas;
    @ViewChild("scrollWrapper") scrollWrapper;

    visibleRange: VisibleRange;
    currentLaneGridWidth = 0;
    totalLaneGridWidth = 0;
    laneGridScrollPosition = 0;
    maxScrollHeight = 0;
    annotationGridWidth = 200;
    isInLaneGridResizeMode = false;
    historyRepository: HistoryRepository;

    commitClicked: HistoryCommit;
    commitSelected: HistoryCommit;
    commitHighlighted: HistoryCommit;

    mouseIsIn = false;
    lastMouseX = 0;
    lastMouseY = 0;

    constructor(private laneColorProvider: LaneColorProvider,
        private laneAssigner: LaneAssigner,
        private repositoryToHistoryRepositoryMapper: RepositoryToHistoryRepositoryMapper,
        private changeDetector: ChangeDetectorRef) {
            changeDetector.detach();
    }

    ngOnChanges() {
        if (this.repository && this.repository.commits) {
            this.historyRepository = this.repositoryToHistoryRepositoryMapper.map(this.repository);
            this.currentLaneGridWidth = Math.min(this.historyRepository.totalLaneCount * 30, 200);
            this.totalLaneGridWidth = this.historyRepository.totalLaneCount * 30;
            this.maxScrollHeight = this.historyRepository.commits.length * 30;
            this.commitClicked = undefined;
            this.commitHighlighted = undefined;
            this.commitSelected = undefined;
        }
        this.update();
    }

    request = false;
    onScroll(event) {
        if (this.request === true)
            return;
        this.request = true;
        requestAnimationFrame(() => {
            this.commitHighlighted = undefined;
            this.update();
            this.request = false;
        });
    }

    private update() {
        const overdraw = 0;
        const startY = Math.floor(this.scrollWrapper.nativeElement.scrollTop / 30);
        const endY = Math.floor(startY + this.scrollWrapper.nativeElement.clientHeight / 30) + 1;
        this.visibleRange = new VisibleRange(startY - overdraw, endY + overdraw);
        this.changeDetector.detectChanges();

    }

    onLaneGridScroll(event: UIEvent) {
        this.laneGridScrollPosition = (<HTMLDivElement>event.target).scrollLeft;
    }

    onResizeMouseDown(event: MouseEvent) {
        this.isInLaneGridResizeMode = true;
    }

    onResizeMouseUp(event: MouseEvent) {
        this.isInLaneGridResizeMode = false;
    }

    mouseMove(event) {
        if (this.isInLaneGridResizeMode) {
            this.currentLaneGridWidth =
                event.clientX -
                this.scrollWrapper.nativeElement.getBoundingClientRect().left -
                this.annotationGridWidth;
            if (this.currentLaneGridWidth < 30)
                this.currentLaneGridWidth = 30;
        }
        this.changeDetector.detectChanges();
    }

    onMouseMove(event) {
        this.mouseIsIn = true;
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
        this.commitHighlighted = this.hitTest(event.clientX, event.clientY);
    }

    onMouseOut(event) {
        if (event === undefined || this.scrollWrapper.nativeElement === event.target) {
            this.commitHighlighted = undefined;
            this.mouseIsIn = false;
        }
    }

    hitTest(x: number, y: number): HistoryCommit {
        const bounds = this.scrollWrapper.nativeElement.getBoundingClientRect();
        x -= this.annotationGridWidth + bounds.left;
        y -= bounds.top - this.scrollWrapper.nativeElement.scrollTop;
        if (x < 0 || x > this.scrollWrapper.nativeElement.clientWidth ||
            y < 0 || y > this.maxScrollHeight)
            return undefined;
        const index = Math.floor(y / 30);
        return this.historyRepository.commits[index];
    }

    onWindowResize() {
        this.update();
    }
}
