import { HistoryCommit } from "../model/model";
import { Input, OnChanges, Component } from "@angular/core";
import { Metrics } from "../services/metrics";

@Component({
    selector: "commit-selection-background",
    templateUrl: "./commit-selection-background.component.html",
    styleUrls: ["./commit-selection-background.component.scss"]
})
export class CommitSelectionBackgroundComponent implements OnChanges {
    @Input() commitClicked: HistoryCommit;
    @Input() commitSelected: HistoryCommit;
    @Input() commitHighlighted: HistoryCommit;

    commitSelectedTop: number = undefined;
    commitHighlightedTop: number = undefined;
    commitClickedTop: number = undefined;

    constructor(private metrics: Metrics) {}

    ngOnChanges() {
        this.updateHighlightBar();
    }

    private updateHighlightBar() {
        if (this.commitClicked) {
            this.commitClickedTop = this.commitClicked.index * this.metrics.commitHeight;
        } else {
            this.commitClickedTop = undefined;
        }
        if (this.commitSelected) {
            this.commitSelectedTop = this.commitSelected.index * this.metrics.commitHeight;
        } else {
            this.commitSelectedTop = undefined;
        }
        if (this.commitHighlighted) {
            this.commitHighlightedTop = this.commitHighlighted.index * this.metrics.commitHeight;
        } else {
            this.commitHighlightedTop = undefined;
        }

        if (this.commitHighlighted === this.commitClicked)
            this.commitHighlightedTop = undefined;
        if (this.commitHighlighted === this.commitSelected)
            this.commitHighlightedTop = undefined;
        if (this.commitSelected === this.commitClicked)
            this.commitClickedTop = undefined;
    }
}
