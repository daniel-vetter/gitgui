import { Component, Input, OnChanges, ViewChild } from "@angular/core";
import { FileChangeTab } from "../tabs";
import { BlobDiffReader, Hunk, HunkContentType } from "../../../services/git/blob-diff-reader";

@Component({
    selector: "file-change-tab",
    templateUrl: "./file-change-tab.component.html",
    styleUrls: ["./file-change-tab.component.scss"]
})
export class FileChangeTabComponent implements OnChanges {
    @Input() tab: FileChangeTab = undefined;

    @ViewChild("editorLeft") editorLeft;
    @ViewChild("editorRight") editorRight;

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
                    this.update();
                });
        }

        this.update();
    }

    private update() {
        if (this.hunks && this.hunks.length > 0) {

            let strLeft = new RangeTrackingString();
            const leftDecorations: monaco.editor.IModelDeltaDecoration[] = [];
            let strRight = new RangeTrackingString();
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

            const editorLeft = monaco.editor.create(this.editorLeft.nativeElement, {
                value: strLeft.fullString,
                language: "javascript",
                readOnly: true,
                scrollBeyondLastLine: false,
                wrappingColumn: -1
            });
            editorLeft.deltaDecorations([], leftDecorations);

            const editorRight = monaco.editor.create(this.editorRight.nativeElement, {
                value: strRight.fullString,
                language: "javascript",
                readOnly: true,
                scrollBeyondLastLine: false,
                wrappingColumn: -1
            });
            editorRight.deltaDecorations([], rightDecorations);
            editorRight.onDidScrollChange(e => {
                editorLeft.setScrollPosition({
                    scrollLeft: e.scrollLeft,
                    scrollTop: e.scrollTop
                })
            });

            editorLeft.onDidScrollChange(e => {
                editorRight.setScrollPosition({
                    scrollLeft: e.scrollLeft,
                    scrollTop: e.scrollTop
                })
            });
            
        }
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

