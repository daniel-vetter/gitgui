import { Component, Input, OnChanges, ElementRef } from "@angular/core";
import { HistoryRepository, VisibleRange } from "../model/model";
import { Metrics } from "../services/metrics";
import { LaneColorProvider } from "../services/lane-color-provider";
import { WidthCalculator } from "./services/width-calculator";
@Component({
    selector: "commit-annotations",
    templateUrl: "./commit-annotations.component.html",
    styleUrls: ["./commit-annotations.component.scss"]
})
export class CommitAnnotationsComponent implements OnChanges {
    @Input() commits: HistoryRepository = undefined;
    @Input() visibleRange: VisibleRange = undefined;
    @Input() width = undefined;

    annotationBundles: AnnotationBundleViewModel[] = [];
    font: string;

    constructor(private metrics: Metrics,
        private laneColorProvider: LaneColorProvider,
        private widthCalculator: WidthCalculator,
        private elementRef: ElementRef) {
        this.font = window.getComputedStyle(document.body, null).font;
    }

    ngOnChanges(changes: any) {
        this.updateRefs();
    }

    private updateRefs() {
        this.annotationBundles = [];
        if (!this.commits || !this.visibleRange) {
            return;
        }

        for (let i = Math.max(0, this.visibleRange.start); i < Math.min(this.visibleRange.end, this.commits.commits.length); i++) {
            const commit = this.commits.commits[i];
            if (commit.tags.length === 0 &&
                commit.branches.length === 0)
                continue;

            // create one annotation bundle for each commit with refs
            const vm = new AnnotationBundleViewModel();
            vm.top = this.metrics.commitHeight * commit.index;
            vm.colorLight = this.laneColorProvider.getColorForLane(commit.lane, 0.97);
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

            // go in reverse order through all annotations and shorten or remove them if they exceed the component width
            const border = 10;
            const minAnnotationWidth = 50;
            let removedCount = 0;
            while (true) {

                // get last annotation
                if (vm.annotations.length === 0)
                    break;
                const lastAnnotation = vm.annotations[vm.annotations.length - 1];

                // calc max width for this annotation
                const moreAnnotationsMarkerWidth = removedCount === 0
                    ? 0
                    : this.getEstimatedHiddenAnnotationCountWidth(removedCount) + border;
                const maxWidth = this.width - lastAnnotation.left - border - moreAnnotationsMarkerWidth;

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
                removedCount++;
            }

            vm.hiddenAnnotationCount = removedCount;
            vm.hiddenAnnotationCountWidth = this.getEstimatedHiddenAnnotationCountWidth(removedCount);

            this.annotationBundles.push(vm);
        }
    }

    private getEstimatedAnnotationWidth(annotation: AnnotationViewModel): number {
        let width = this.widthCalculator.getWidth(annotation.name, this.font);
        if (annotation.isLocal) width += 18;
        if (annotation.isRemote) width += 18;
        if (annotation.isTag) width += 18;
        return width + 10;
    }

    private getEstimatedHiddenAnnotationCountWidth(countToDisplay: number): number {
        return this.widthCalculator.getWidth("+" + countToDisplay, this.font) + 10;
    }
}

class AnnotationBundleViewModel {
    top: number;
    annotations: AnnotationViewModel[];
    color: string;
    colorLight: string;
    hiddenAnnotationCount: number;
    hiddenAnnotationCountWidth: number;
}

class AnnotationViewModel {
    name: string;
    isTag: boolean;
    isLocal: boolean;
    isRemote: boolean;
    width: number;
    left: number;
}
