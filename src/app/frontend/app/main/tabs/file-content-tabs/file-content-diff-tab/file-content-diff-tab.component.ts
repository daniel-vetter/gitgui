import { Component, Input, OnChanges, ViewChild, AfterViewInit, ElementRef, AfterContentInit, OnDestroy } from "@angular/core";
import { Path } from "../../../../services/path";
import { Git } from "../../../../services/git/git";
import { TabBase } from "app/services/tabs/tab-base";
import { FileContentDiffTabData } from "app/main/tabs/tabs";
import { MonacoEditorHelper } from "../monaco-editor-helper";

@Component({
    selector: "file-content-diff-tab",
    templateUrl: "./file-content-diff-tab.component.html",
    styleUrls: ["./file-content-diff-tab.component.scss"]
})
export class FileContentDiffTabComponent extends TabBase<FileContentDiffTabData> implements AfterContentInit, OnDestroy {

    @ViewChild("container") container: ElementRef;

    leftFileName = "";
    rightFileName = "";
    leftContent = "";
    rightContent = "";
    isBinary = false;
    visible = true;

    private editor: monaco.editor.IStandaloneDiffEditor;
    private diffNavigator: monaco.editor.IDiffNavigator;

    constructor(private git: Git, private monacoEditorHelper: MonacoEditorHelper) {
        super();
    }

    ngAfterContentInit() {
        this.createEditors();
    }

    async displayData(data: FileContentDiffTabData): Promise<void> {

        this.leftFileName = Path.getLastPart(data.leftFile.path);
        this.rightFileName = Path.getLastPart(data.rightFile.path);
        if (this.leftFileName.toLowerCase() === this.rightFileName.toLowerCase()) {
            this.page.title = this.leftFileName;
        } else {
            this.page.title = this.leftFileName + " - " + this.rightFileName;
        }
        this.leftContent = await this.git.getFileContent(data.repository, data.leftFile);
        this.rightContent = await this.git.getFileContent(data.repository, data.rightFile)

        this.update();
    }

    private async createEditors() {
        if (this.editor)
            return;

        await this.monacoEditorHelper.waitTillLibIsLoaded();

        this.editor = monaco.editor.createDiffEditor(this.container.nativeElement, {
            readOnly: true,
            scrollBeyondLastLine: false,
            wrappingColumn: -1,
            automaticLayout: true,
            renderSideBySide: false,
        });

        this.diffNavigator = monaco.editor.createDiffNavigator(this.editor, {
            alwaysRevealFirst: true
        });

        this.editor.getModifiedEditor().updateOptions({
            contextmenu: false,
            hover: false
        });

        this.editor.getOriginalEditor().updateOptions({
            contextmenu: false,
            hover: false
        });

        this.monacoEditorHelper.disableCommandMenu(this.editor);

        this.update();
    }

    ngOnDestroy(): void {
        this.diffNavigator.dispose();
        this.editor.dispose();
    }

    private update() {
        if (!this.editor)
            return;

        this.editor.setModel({
            original: monaco.editor.createModel(this.leftContent, "text/plain"),
            modified: monaco.editor.createModel(this.rightContent, "text/plain")
        });
    }
}
