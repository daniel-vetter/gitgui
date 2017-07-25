import { Component, Input, OnChanges, AfterViewInit, ViewChild, ElementRef } from "@angular/core";
import { FileContentTabData } from "../../tabs";
import { Path } from "../../../../services/path";
import { Git } from "../../../../services/git/git";
import { TabBase } from "app/services/tabs/tab-base";

@Component({
    selector: "file-content-tab",
    templateUrl: "file-content-tab.component.html",
    styleUrls: ["./file-content-tab.component.scss"]
})
export class FileContentTabComponent extends TabBase<FileContentTabData> implements AfterViewInit {

    @ViewChild("container") container: ElementRef;

    fileName = "";
    content = "";

    private editor: monaco.editor.IStandaloneCodeEditor;

    constructor(private git: Git) {
        super();
    }

    ngAfterViewInit() {
        this.createEditors();
    }

    async displayData(data: FileContentTabData): Promise<void> {

        this.page.title = Path.getLastPart(data.file.path);
        this.content = await this.git.getFileContent(data.repository, data.file);

        this.update();
    }

    private createEditors() {
        // HACK: wait till the monaco editor is loaded
        // TODO: move this to the app startup, so the app is not display till the editor is fully loaded.
        if (!(<any>window)["monaco"]) {
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
        this.editor.setModel(monaco.editor.createModel(this.content, "text/plain"));
    }
}
