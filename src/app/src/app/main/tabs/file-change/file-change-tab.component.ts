import { Component, Input, OnChanges } from "@angular/core";
import { FileChangeTab } from "../tabs";
import { BlobDiffReader, Hunk } from "../../../services/git/blob-diff-reader";

@Component({
    selector: "file-change-tab",
    templateUrl: "./file-change-tab.component.html",
    styleUrls: ["./file-change-tab.component.scss"]
})
export class FileChangeTabComponent implements OnChanges {
    @Input() tab: FileChangeTab = undefined;

    constructor(private blobDiffReader: BlobDiffReader) { }

    hunks: Hunk[];

    ngOnChanges() {
        if (this.tab &&
            this.tab.sourceBlob &&
            this.tab.destinationBlob) {
            this.blobDiffReader.getDiff(this.tab.repository.location, this.tab.sourceBlob, this.tab.destinationBlob)
                .subscribe(x => {
                    console.log(x)
                    this.hunks = x;
                });
        }
    }
}