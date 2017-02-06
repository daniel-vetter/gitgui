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

    refBundles: RefBundleViewModel[] = [];

    constructor(private metrics: Metrics,
                private laneColorProvider: LaneColorProvider) {
    }

    ngOnChanges(changes: any) {
        this.updateRefs();
    }

    private updateRefs() {
        this.refBundles = [];
        if (!this.commits || !this.visibleRange) {
            return;
        }

        for (let i = Math.max(0, this.visibleRange.start); i < Math.min(this.visibleRange.end, this.commits.commits.length); i++) {
            const commit = this.commits.commits[i];
            if (commit.refs.length === 0)
                continue;

            const vm = new RefBundleViewModel();
            vm.top = this.metrics.commitHeight * commit.index;
            vm.colorLight = this.laneColorProvider.getColorForLane(commit.lane, 0.97);
            vm.color = this.laneColorProvider.getColorForLane(commit.lane);
            vm.refs = [];
            for (const ref of commit.refs) {
                const refVm = new RefViewModel();
                refVm.name = ref.shortName;
                vm.refs.push(refVm);
            }
            this.refBundles.push(vm);
        }
    }
}

class RefBundleViewModel {
    top: number;
    refs: RefViewModel[];
    color: string;
    colorLight: string;
}

class RefViewModel {
    name: string;
}
