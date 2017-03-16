import { Component, Input, OnChanges, ElementRef, ChangeDetectorRef } from "@angular/core";
import { HistoryRepository, VisibleRange, HistoryCommit } from "../model/model";
import { Metrics } from "../services/metrics";
import { LaneColorProvider } from "../services/lane-color-provider";
import { WidthCalculator } from "./services/width-calculator";
import { ReusePool, PoolableViewModel } from "../services/reuse-pool";

@Component({
    selector: "commit-annotations",
    templateUrl: "./commit-annotations.component.html",
    styleUrls: ["./commit-annotations.component.scss"]
})
export class CommitAnnotationsComponent implements OnChanges {
    @Input() commits: HistoryRepository = undefined;
    @Input() visibleRange: VisibleRange = undefined;
    @Input() width = undefined;

    annotationBundles = new ReusePool<HistoryCommit, AnnotationBundleViewModel>(() => new AnnotationBundleViewModel());
    font: string;
    currentExpandedCommit: HistoryCommit;

    constructor(private metrics: Metrics,
        private laneColorProvider: LaneColorProvider,
        private widthCalculator: WidthCalculator,
        private elementRef: ElementRef,
        private changeDetectorRef: ChangeDetectorRef) {
        this.font = window.getComputedStyle(document.body, null).font;
    }

    ngOnChanges(changes: any) {
        this.updateRefs();
    }

    private updateRefs() {

        if (!this.commits || !this.visibleRange) {
            return;
        }

        this.annotationBundles.remapRange(this.commits.commits, this.visibleRange.start, this.visibleRange.end, (commit, vm) => {
            if (commit.tags.length === 0 &&
                commit.branches.length === 0)
                return false;

            vm.top = this.metrics.commitHeight * commit.index;
            vm.colorLight = this.laneColorProvider.getColorForLane(commit.lane, 0.05);
            vm.color = this.laneColorProvider.getColorForLane(commit.lane);

            // fill bundle with annotations (tag, branches)
            vm.annotations = [];
            for (const branch of commit.branches) {
                const annotation = new AnnotationViewModel();
                annotation.name = branch.localName ? branch.localName : branch.remoteName;
                annotation.isLocal = !!branch.localName;
                annotation.isRemote = !!branch.remoteName;
                vm.annotations.push(annotation);
            }
            for (const tag of commit.tags) {
                const annotation = new AnnotationViewModel();
                annotation.name = tag.name;
                annotation.isTag = true;
                vm.annotations.push(annotation);
            }

            // calculate position and width of annotations
            let leftPos = 0;
            for (const annotation of vm.annotations) {
                annotation.left = leftPos;
                annotation.width = this.getEstimatedAnnotationWidth(annotation);
                leftPos += annotation.width + 10;
            }

            if (commit !== this.currentExpandedCommit) {
                // go in reverse order through all annotations and shorten or remove them if they exceed the component width
                const borderRight = 10;
                const borderLeft = 5;
                const minAnnotationWidth = 50;
                vm.hiddenAnnotationCount = 0;
                while (true) {

                    // get last annotation
                    if (vm.annotations.length === 0)
                        break;
                    const lastAnnotation = vm.annotations[vm.annotations.length - 1];

                    // calc max width for this annotation
                    const moreAnnotationsMarkerWidth = vm.hiddenAnnotationCount === 0
                        ? 0
                        : this.getEstimatedHiddenAnnotationCountWidth(vm.hiddenAnnotationCount) + borderRight + borderLeft;
                    const maxWidth = this.width - lastAnnotation.left - borderRight - borderLeft - moreAnnotationsMarkerWidth;

                    // if this annotation is small enough, everything is fine
                    if (lastAnnotation.width < maxWidth)
                        break;

                    // if the annotation can be shorten -> shorten it and then we are done
                    if (minAnnotationWidth < maxWidth) {
                        lastAnnotation.width = maxWidth;
                        break;
                    }

                    // this annotation can not be shorten enough, so we remove it
                    vm.annotations.splice(vm.annotations.length - 1, 1);
                    vm.hiddenAnnotationCount++;
                }
            }

            vm.hiddenAnnotationCountWidth = this.getEstimatedHiddenAnnotationCountWidth(vm.hiddenAnnotationCount);

            if (vm.annotations.length > 0) {
                const lastAnnotation = vm.annotations[vm.annotations.length - 1];
                vm.totalWidth = lastAnnotation.left + lastAnnotation.width + vm.hiddenAnnotationCountWidth;
            } else {
                vm.totalWidth = 0;
            }

            return true;
        });
    }

    private getEstimatedAnnotationWidth(annotation: AnnotationViewModel): number {
        let width = this.widthCalculator.getWidth(annotation.name, this.font);
        if (annotation.isLocal) width += 18;
        if (annotation.isRemote) width += 18;
        if (annotation.isTag) width += 18;
        return width + 10;
    }

    private getEstimatedHiddenAnnotationCountWidth(countToDisplay: number): number {
        if (countToDisplay === 0)
            return 0;
        return this.widthCalculator.getWidth("+" + countToDisplay, this.font) + 10;
    }

    onMouseEnter(vm: AnnotationBundleViewModel) {
        if (vm.data !== this.currentExpandedCommit) {
            this.currentExpandedCommit = vm.data;
            this.updateRefs();
            this.changeDetectorRef.detectChanges();
        }
    }

    onMouseLeave(vm: AnnotationBundleViewModel) {
        if (this.currentExpandedCommit !== undefined) {
            this.currentExpandedCommit = undefined;
            this.updateRefs();
            this.changeDetectorRef.detectChanges();
        }
    }
}

class AnnotationBundleViewModel implements PoolableViewModel<HistoryCommit> {
    top: number;
    annotations: AnnotationViewModel[];
    color: string;
    colorLight: string;
    hiddenAnnotationCount: number;
    hiddenAnnotationCountWidth: number;
    totalWidth: number;
    data: HistoryCommit;
    visible: boolean;
    clear() {
        this.top = undefined;
        this.annotations = undefined;
        this.color = undefined;
        this.colorLight = undefined;
        this.hiddenAnnotationCount = undefined;
        this.hiddenAnnotationCountWidth = undefined;
        this.totalWidth = undefined;
    }
}

class AnnotationViewModel {
    name: string;
    isTag: boolean;
    isLocal: boolean;
    isRemote: boolean;
    width: number;
    left: number;
}
