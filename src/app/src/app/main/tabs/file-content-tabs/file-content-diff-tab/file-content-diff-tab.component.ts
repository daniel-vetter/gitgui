import { Component, Input, OnChanges, ViewChild, AfterViewInit } from "@angular/core";
import { FileContentDiffTab } from "../../tabs";
import { Path } from "../../../../services/path";
import { Git } from "../../../../services/git/git";

@Component({
    selector: "file-content-diff-tab",
    templateUrl: "./file-content-diff-tab.component.html",
    styleUrls: ["./file-content-diff-tab.component.scss"]
})
export class FileContentDiffTabComponent implements OnChanges, AfterViewInit {
    @Input() tab: FileContentDiffTab;

    @ViewChild("container") container;

    leftFileName: string = "";
    rightFileName: string = "";
    leftContent: string = "";
    rightContent: string = "";
    isBinary: boolean = false;

    private editor: monaco.editor.IDiffEditor;

    constructor(private git: Git) {}

    ngAfterViewInit() {
        this.createEditors();
    }

    async ngOnChanges() {
        if (this.tab) {
            this.leftFileName = Path.getLastPart(this.tab.leftFile.path);
            this.rightFileName = Path.getLastPart(this.tab.rightFile.path);
            if (this.leftFileName.toLowerCase() === this.rightFileName.toLowerCase()) {
                this.tab.ui.title = this.leftFileName;
            } else {
                this.tab.ui.title = this.leftFileName + " - " + this.rightFileName;
            }
            this.leftContent = await this.git.getFileContent(this.tab.repository, this.tab.leftFile);
            this.rightContent = await this.git.getFileContent(this.tab.repository, this.tab.rightFile)
        } else {
            this.leftContent = "";
            this.rightContent = "";
        }
        this.update();
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

    private update() {
        if (!this.editor) return;
        if (this.tab) {
            this.editor.setModel({
                original: monaco.editor.createModel(this.leftContent, "text/plain"),
                modified: monaco.editor.createModel(this.rightContent, "text/plain")
            });
        }
    }
}
