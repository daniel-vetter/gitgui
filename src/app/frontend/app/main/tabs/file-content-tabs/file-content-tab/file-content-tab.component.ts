import { Component, Input, OnChanges, AfterViewInit, ViewChild, ElementRef, AfterContentInit } from "@angular/core";
import { FileContentTabData } from "../../tabs";
import { Path } from "../../../../services/path";
import { Git } from "../../../../services/git/git";
import { TabBase } from "app/services/tabs/tab-base";
import { MonacoEditorHelper } from "../monaco-editor-helper";

@Component({
    selector: "file-content-tab",
    templateUrl: "file-content-tab.component.html",
    styleUrls: ["./file-content-tab.component.scss"]
})
export class FileContentTabComponent extends TabBase<FileContentTabData> implements AfterContentInit {

    @ViewChild("container") container: ElementRef;

    fileName = "";
    content = "";

    private editor: monaco.editor.IStandaloneCodeEditor;

    constructor(private git: Git, private monacoEditorHelper: MonacoEditorHelper) {
        super();
    }

    ngAfterContentInit() {
        this.createEditors();
    }

    async displayData(data: FileContentTabData): Promise<void> {

        this.page.title = Path.getLastPart(data.file.path);
        this.content = await this.git.getFileContent(data.repository, data.file);

        this.update();
    }

    private async createEditors() {
        if (this.editor)
            return;

        await this.monacoEditorHelper.waitTillLibIsLoaded();

        this.editor = monaco.editor.create(this.container.nativeElement, {
            readOnly: true,
            scrollBeyondLastLine: false,
            wrappingColumn: -1,
            automaticLayout: true,
            contextmenu: false
        });
        console.log(this.container.nativeElement);

        this.monacoEditorHelper.disableCommandMenu(this.editor);

        this.update();
    }

    private update() {
        if (!this.editor) return;
        this.editor.setModel(monaco.editor.createModel(this.content, "text/plain"));
    }
}
