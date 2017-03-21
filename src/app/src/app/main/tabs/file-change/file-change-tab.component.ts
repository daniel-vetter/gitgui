import { Component, Input, OnChanges, ViewChild, OnInit, AfterViewInit } from "@angular/core";
import { FileChangeTab } from "../tabs";
import { BlobDiffReader, Hunk, HunkContentType } from "../../../services/git/blob-diff-reader";

@Component({
    selector: "file-change-tab",
    templateUrl: "./file-change-tab.component.html",
    styleUrls: ["./file-change-tab.component.scss"]
})
export class FileChangeTabComponent implements OnChanges, AfterViewInit {
    @Input() tab: FileChangeTab = undefined;

    @ViewChild("editorLeft") editorContainerLeft;
    @ViewChild("editorRight") editorContainerRight;

    hunks: Hunk[];

    private editorLeft: monaco.editor.IStandaloneCodeEditor;
    private editorRight: monaco.editor.IStandaloneCodeEditor;

    constructor(private blobDiffReader: BlobDiffReader) { }

    ngOnChanges() {
        if (this.tab &&
            this.tab.sourceBlob &&
            this.tab.destinationBlob) {
            this.blobDiffReader.getDiff(this.tab.repository.location, this.tab.sourceBlob, this.tab.destinationBlob)
                .subscribe(x => {
                    this.hunks = x;
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
        if (this.editorLeft && this.editorRight)
            return;

        this.editorLeft = monaco.editor.create(this.editorContainerLeft.nativeElement, {
            readOnly: true,
            scrollBeyondLastLine: false,
            wrappingColumn: -1,
            automaticLayout: true
        });

        this.editorRight = monaco.editor.create(this.editorContainerRight.nativeElement, {
            readOnly: true,
            scrollBeyondLastLine: false,
            wrappingColumn: -1,
            automaticLayout: true
        });

        this.editorRight.onDidScrollChange(e => {
            this.editorLeft.setScrollPosition({
                scrollLeft: e.scrollLeft,
                scrollTop: e.scrollTop
            });
        });

        this.editorLeft.onDidScrollChange(e => {
            this.editorRight.setScrollPosition({
                scrollLeft: e.scrollLeft,
                scrollTop: e.scrollTop
            });
        });

        this.update();
    }

    ngAfterViewInit() {
        this.createEditors();
    }

    private update() {
        if (!this.editorLeft || !this.editorRight) return;
        if (!this.hunks || this.hunks.length === 0) {
            this.editorLeft.setValue("");
            this.editorRight.setValue("");
            return;
        }

        const strLeft = new RangeTrackingString();
        const leftDecorations: monaco.editor.IModelDeltaDecoration[] = [];
        const strRight = new RangeTrackingString();
        const rightDecorations: monaco.editor.IModelDeltaDecoration[] = [];
        for (const part of this.hunks[0].content) {
            if (part.type === HunkContentType.Unchanged) {
                strLeft.append(part.text);
                strRight.append(part.text);
            }
            if (part.type === HunkContentType.Added) {
                const range = strRight.append(part.text);
                rightDecorations.push({ range: range, options: { inlineClassName: "addedText" } });

                const lineCount = this.getLineCount(part.text);
                strLeft.append(this.createNewLineString(lineCount));
            }
            if (part.type === HunkContentType.Removed) {
                const range = strLeft.append(part.text);
                leftDecorations.push({ range: range, options: { inlineClassName: "removedText" } });

                const lineCount = this.getLineCount(part.text);
                strRight.append(this.createNewLineString(lineCount));
            }
        }
        this.editorLeft.setValue(strLeft.fullString);
        this.editorRight.setValue(strRight.fullString);
    }

    private getLineCount(str: string): number {
        let count = 0;
        for (const ch of str) {
            if (ch === "\n")
                count++;
        }
        return count;
    }

    private createNewLineString(lines: number): string {
        let str = "";
        for (let i = 0; i < lines; i++) {
            str += "\n";
        }
        return str;
    }
}

export class RangeTrackingString {

    private curLine = 0;
    private curCol = 0;
    fullString: string = "";

    append(str: string): monaco.Range {
        const startCurLine = this.curLine;
        const startCurCol = this.curCol;

        this.fullString += str;

        for (const ch of str) {
            if (ch === "\n") {
                this.curLine++;
                this.curCol = 0;
            } else {
                this.curCol++;
            }
        }

        return new monaco.Range(startCurLine + 1, startCurCol + 1, this.curLine + 1, this.curCol + 1);
    }
}

