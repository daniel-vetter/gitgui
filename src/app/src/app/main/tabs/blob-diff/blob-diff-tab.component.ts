import { Component, Input, OnChanges, ViewChild, OnInit, AfterViewInit } from "@angular/core";
import { BlobDiffTab } from "../tabs";
import { BlobDiffReader, Hunk, HunkContentType } from "../../../services/git/blob-diff-reader";
import { Path } from "../../../services/path";

@Component({
    selector: "blob-diff-tab",
    templateUrl: "./blob-diff-tab.component.html",
    styleUrls: ["./blob-diff-tab.component.scss"]
})
export class BlobDiffTabComponent implements OnChanges, AfterViewInit {
    @Input() tab: BlobDiffTab = undefined;

    @ViewChild("container") container;

    leftFileName: string;
    rightFileName: string;
    private isBinary: boolean = false;

    private hunks: Hunk[];
    private editor: monaco.editor.IDiffEditor;

    constructor(private blobDiffReader: BlobDiffReader) { }

    ngOnChanges() {
        if (this.tab &&
            this.tab.sourceBlob &&
            this.tab.destinationBlob) {
            this.leftFileName = Path.getLastPart(this.tab.sourcePath);
            this.rightFileName = Path.getLastPart(this.tab.destinationPath);
            if (this.leftFileName.toLowerCase() === this.rightFileName.toLowerCase()) {
                this.tab.ui.title = this.leftFileName;
            } else {
                this.tab.ui.title = this.leftFileName + " - " + this.rightFileName;
            }

            this.blobDiffReader.getDiff(this.tab.repository.location, this.tab.sourceBlob, this.tab.destinationBlob)
                .subscribe(x => {
                    this.hunks = x.hunks;
                    this.isBinary = x.isBinary;
                    console.log(this.isBinary);
                    this.update();
                });
        }
    }

    private createEditors() {
        // HACK: wait till the monaco editor is loaded
        // TODO: move this to the app startup, so the app is not display till the editor is fully loaded.
        if (!window["monaco"]) {
            setTimeout(() => this.createEditors(), 0);
            return;
        }
        if (this.editor)
            return;

        this.editor = monaco.editor.createDiffEditor(this.container.nativeElement, {
            readOnly: true,
            scrollBeyondLastLine: false,
            wrappingColumn: -1,
            automaticLayout: true
        });

        this.update();
    }

    ngAfterViewInit() {
        this.createEditors();
    }

    private update() {
        if (!this.editor) return;
        if (!this.hunks || this.hunks.length === 0) {
            this.editor.setModel({
                original: monaco.editor.createModel("", "text/plain"),
                modified: monaco.editor.createModel("", "text/plain")
            });
            return;
        }

        let strLeft = "";
        let strRight = "";
        for (const part of this.hunks[0].content) {
            if (part.type === HunkContentType.Unchanged) {
                strLeft += part.text;
                strRight += part.text;
            }
            if (part.type === HunkContentType.Added) {
                strRight += part.text;
            }
            if (part.type === HunkContentType.Removed) {
                strLeft += part.text;
            }
        }
        this.editor.setModel({
            original: monaco.editor.createModel(strLeft, "text/plain"),
            modified: monaco.editor.createModel(strRight, "text/plain")
        });
    }
}
