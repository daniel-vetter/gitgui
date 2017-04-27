import { HistoryCommitEntry } from "../model/model";
import { Input, OnChanges, Component } from "@angular/core";
import { Metrics } from "../services/metrics";

@Component({
    selector: "commit-selection-background",
    templateUrl: "./commit-selection-background.component.html",
    styleUrls: ["./commit-selection-background.component.scss"]
})
export class CommitSelectionBackgroundComponent implements OnChanges {
    @Input() entryClicked: HistoryCommitEntry;
    @Input() entrySelected: HistoryCommitEntry;
    @Input() entryHighlighted: HistoryCommitEntry;

    entrySelectedTop: number = undefined;
    entryHighlightedTop: number = undefined;
    entryClickedTop: number = undefined;

    constructor(private metrics: Metrics) {}

    ngOnChanges() {
        this.updateHighlightBar();
    }

    private updateHighlightBar() {
        if (this.entryClicked) {
            this.entryClickedTop = this.entryClicked.index * this.metrics.commitHeight;
        } else {
            this.entryClickedTop = undefined;
        }
        if (this.entrySelected) {
            this.entrySelectedTop = this.entrySelected.index * this.metrics.commitHeight;
        } else {
            this.entrySelectedTop = undefined;
        }
        if (this.entryHighlighted) {
            this.entryHighlightedTop = this.entryHighlighted.index * this.metrics.commitHeight;
        } else {
            this.entryHighlightedTop = undefined;
        }

        if (this.entryHighlighted === this.entryClicked)
            this.entryHighlightedTop = undefined;
        if (this.entryHighlighted === this.entrySelected)
            this.entryHighlightedTop = undefined;
        if (this.entrySelected === this.entryClicked)
            this.entryClickedTop = undefined;
    }
}
