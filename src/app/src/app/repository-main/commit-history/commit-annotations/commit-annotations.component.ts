import { Component, Input, OnChanges } from "@angular/core";
import { HistoryRepository, VisibleRange } from "../model/model";
import { Metrics } from "../services/metrics";
import { LaneColorProvider } from "../services/lane-color-provider";
@Component({
    selector: "commit-annotations",
    templateUrl: "./commit-annotations.component.html",
    styleUrls: ["./commit-annotations.component.scss"]
})
export class CommitAnnotationsComponent implements OnChanges {
    @Input() commits: HistoryRepository = undefined;
    @Input() visibleRange: VisibleRange = undefined;

    annotationBundles: AnnotationBundleViewModel[] = [];

    constructor(private metrics: Metrics,
                private laneColorProvider: LaneColorProvider) {
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
            const vm = new AnnotationBundleViewModel();
            vm.top = this.metrics.commitHeight * commit.index;
            vm.colorLight = this.laneColorProvider.getColorForLane(commit.lane, 0.97);
            vm.color = this.laneColorProvider.getColorForLane(commit.lane);
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
            if (vm.annotations.length > 0)
                this.annotationBundles.push(vm);
        }
    }
}

class AnnotationBundleViewModel {
    top: number;
    annotations: AnnotationViewModel[];
    color: string;
    colorLight: string;
}

class AnnotationViewModel {
    name: string;
    isTag: boolean;
    isLocal: boolean;
    isRemote: boolean;
}
