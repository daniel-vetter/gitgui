import { Component, Input, ViewChild, OnChanges, ChangeDetectorRef, ChangeDetectionStrategy } from "@angular/core";
import { LaneColorProvider } from "./services/lane-color-provider";
import { LineIndex } from "./services/line-index";
import { LaneAssigner } from "./services/lane-assigner";
import { Repository, RepositoryCommit } from "../../model/model";
import { VisibleRange, HistoryRepository, HistoryCommit } from "./model/model";

@Component({
    selector: "commit-history",
    templateUrl: "./commit-history.component.html",
    styleUrls: ["./commit-history.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommitHistoryComponent implements OnChanges {

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

    constructor(private laneColorProvider: LaneColorProvider,
        private laneAssigner: LaneAssigner,
        private changeDetectionRef: ChangeDetectorRef) {
    }

    ngOnChanges() {
        if (this.repository && this.repository.commits) {
            this.historyRepository = this.convertRepositoryToHistoryRepository(this.repository);
            this.currentLaneGridWidth = Math.min(this.historyRepository.totalLaneCount * 30, 200);
            this.totalLaneGridWidth = this.historyRepository.totalLaneCount * 30;
            this.maxScrollHeight = this.historyRepository.commits.length * 30;
        }
        this.update();
    }

    private convertRepositoryToHistoryRepository(repository: Repository): HistoryRepository {
        const historyRepository = new HistoryRepository();
        historyRepository.commits = [];
        const hashToHistoryCommitMap = new Map<string, HistoryCommit>();
        const hashToRepositoryCommitMap = new Map<string, RepositoryCommit>();
        for (let i = 0; i < repository.commits.length; i++) {
            const commit = repository.commits[i];
            const r = new HistoryCommit();
            r.index = i;
            r.hash = commit.hash;
            r.title = commit.title;
            r.committerName = commit.committerName;
            r.committerMail = commit.committerMail;
            r.commitDate = commit.commitDate;
            r.authorName = commit.authorName;
            r.authorMail = commit.authorMail;
            r.authorDate = commit.authorDate;
            r.parents = [];
            r.children = [];
            historyRepository.commits.push(r);
            hashToHistoryCommitMap.set(r.hash, r);
            hashToRepositoryCommitMap.set(commit.hash, commit);
        }

        for (const historyCommit of historyRepository.commits) {
            const repositoryCommit = hashToRepositoryCommitMap.get(historyCommit.hash);
            for (const parent of repositoryCommit.parents) {
                const parentHistoryCommit = hashToHistoryCommitMap.get(parent.hash)
                historyCommit.parents.push(parentHistoryCommit);
                parentHistoryCommit.children.push(historyCommit);
            }
        }

        this.laneAssigner.assignLanes(historyRepository);

        return historyRepository;
    }

    onScroll() {
        this.update();
    }

    private update() {
        const overdraw = 0;
        const startY = Math.floor(this.scrollWrapper.nativeElement.scrollTop / 30);
        const endY = Math.floor(startY + this.scrollWrapper.nativeElement.clientHeight / 30) + 1;
        this.visibleRange = new VisibleRange(startY - overdraw, endY + overdraw);
        this.changeDetectionRef.markForCheck();
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
    }
}
