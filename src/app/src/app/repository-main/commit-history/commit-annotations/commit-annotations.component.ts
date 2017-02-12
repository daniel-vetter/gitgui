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
        //this.updateRefs();
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
            const allAnnotation: AnnotationViewModel[] = [];
            for (const branch of commit.branches) {
                const annotation = new AnnotationViewModel();
                annotation.name = branch.localName ? branch.localName : branch.remoteName;
                annotation.isLocal = !!branch.localName;
                annotation.isRemote = !!branch.remoteName;
                allAnnotation.push(annotation);
            }
            for (const tag of commit.tags) {
                const annotation = new AnnotationViewModel();
                annotation.name = tag.name;
                annotation.isTag = true;
                allAnnotation.push(annotation);
            }

            // calculate position and width of annotations
            let totalWidth = 0;
            vm.annotations = [];
            for (const annotation of allAnnotation) {
                // calc width of annotation
                annotation.width = this.widthCalculator.getWidth(annotation.name, this.font);
                if (annotation.isLocal) annotation.width += 18;
                if (annotation.isRemote) annotation.width += 18;
                if (annotation.isTag) annotation.width += 18;
                annotation.width += 20;

                // make annotations smaller if the exceed the total width
                const overshoot = (totalWidth + annotation.width) - this.width + 50;
                if (overshoot > 0) {
                    annotation.width -= overshoot;

                    // check if annotation still is wider than a minimum width
                    if (annotation.width < 50) {
                        break;
                    }
                }

                // sum total width
                totalWidth += annotation.width + 10;

                vm.annotations.push(annotation);
            }

            vm.hiddenAnnotationCount = allAnnotation.length - vm.annotations.length;
            vm.hiddenAnnotationCountWidth = this.widthCalculator.getWidth("+" + vm.hiddenAnnotationCount, this.font) + 10;
            this.annotationBundles.push(vm);
        }
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
}
