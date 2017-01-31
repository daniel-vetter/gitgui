import { Component, Input, ViewChild, OnChanges } from "@angular/core";
import { LaneColorProvider } from "./services/lane-color-provider";
import { LaneAssigner } from "./services/lane-assigner";
import { Repository } from "../../model/model";
import { VisibleRange, HistoryRepository, HistoryCommit } from "./model/model";
import { RepositoryToHistoryRepositoryMapper } from "./services/repository-to-history-repository-mapper";

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
    historyRepository: HistoryRepository;
    mouseIsInLaneGrid = false;

    commitClicked: HistoryCommit;
    commitSelected: HistoryCommit;
    commitHighlighted: HistoryCommit;

    constructor(private laneColorProvider: LaneColorProvider,
        private laneAssigner: LaneAssigner,
        private repositoryToHistoryRepositoryMapper: RepositoryToHistoryRepositoryMapper) {
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
    onScroll(event) {
        this.commitHighlighted = undefined;
        this.update();
    }

    private update() {
        const startY = Math.floor(this.scrollWrapper.nativeElement.scrollTop / 30);
        const endY = Math.floor(startY + this.scrollWrapper.nativeElement.clientHeight / 30) + 1;
        const overdraw = 10;
        this.visibleRange = new VisibleRange(startY - overdraw, endY + overdraw);
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

    onResizeMouseMove(event) {
        if (this.isInLaneGridResizeMode) {
            this.currentLaneGridWidth =
                event.clientX -
                this.scrollWrapper.nativeElement.getBoundingClientRect().left -
                this.annotationGridWidth;
            this.limitLaneGridWidth();
        }
    }

    private limitLaneGridWidth() {
        const minSize = 30;
        const maxSize = this.scrollWrapper.nativeElement.clientWidth - this.annotationGridWidth - 100;
        this.currentLaneGridWidth = Math.min(maxSize, this.currentLaneGridWidth);
        this.currentLaneGridWidth = Math.max(minSize, this.currentLaneGridWidth);
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
        const index = Math.floor(y / 30);
        return this.historyRepository.commits[index];
    }

    onWindowResize() {
        this.update();
        this.limitLaneGridWidth();
    }

    onKeyDown(event) {
        if (!this.commitSelected) return;
        let move = 0;
        if (event.keyCode === 40) move = 1;
        if (event.keyCode === 38) move = -1;
        if (event.keyCode === 33) move = -Math.floor(this.scrollWrapper.nativeElement.clientHeight / 30);
        if (event.keyCode === 34) move = Math.floor(this.scrollWrapper.nativeElement.clientHeight / 30);

        const newIndex = Math.min(Math.max(0, this.commitSelected.index + move), this.historyRepository.commits.length - 1);
        this.commitSelected = this.historyRepository.commits[newIndex];

        this.scrollToCurrentSelection();
    }

    private scrollToCurrentSelection() {
        if (!this.commitSelected) return;
        const commitTop = this.commitSelected.index * 30;
        const commitBottom = commitTop + 30;

        if (commitTop < this.scrollWrapper.nativeElement.scrollTop) {
            this.scrollWrapper.nativeElement.scrollTop = commitTop;
        }
        if (commitBottom > this.scrollWrapper.nativeElement.scrollTop + this.scrollWrapper.nativeElement.clientHeight) {
            this.scrollWrapper.nativeElement.scrollTop = commitBottom - this.scrollWrapper.nativeElement.clientHeight;
        }
    }
}
