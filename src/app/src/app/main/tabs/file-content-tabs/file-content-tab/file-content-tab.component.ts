import { Component, Input, OnChanges, AfterViewInit, ViewChild } from "@angular/core";
import { FileContentTab } from "../../tabs";
import { Path } from "../../../../services/path";
import { Git } from "../../../../services/git/git";

@Component({
    selector: "file-content-tab",
    templateUrl: "file-content-tab.component.html",
    styleUrls: ["./file-content-tab.component.scss"]
})
export class FileContentTabComponent implements OnChanges, AfterViewInit {
    @Input() tab: FileContentTab;
    @ViewChild("container") container;

    fileName: string = "";
    content: string = "";

    private editor: monaco.editor.IStandaloneCodeEditor;

    constructor(private git: Git) {}

    ngAfterViewInit() {
        this.createEditors();
    }

    async ngOnChanges() {
        if (this.tab) {
            this.tab.ui.title = Path.getLastPart(this.tab.file.path);
            this.content = await this.git.getFileContent(this.tab.repository, this.tab.file);
        } else {
            this.content = "";
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

        this.editor = monaco.editor.create(this.container.nativeElement, {
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
            this.editor.setModel(monaco.editor.createModel(this.content, "text/plain"));
        }
    }
}
