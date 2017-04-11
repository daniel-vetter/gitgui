import { Component, Input, OnChanges, AfterViewInit, ViewChild } from "@angular/core";
import { TextTab } from "../tabs";
import { Path } from "../../../services/path";

@Component({
    selector: "text-tab",
    templateUrl: "text-tab.component.html",
    styleUrls: ["./text-tab.component.scss"]
})
export class TextTabComponent implements OnChanges, AfterViewInit {
    @Input() tab: TextTab = undefined;
    @ViewChild("container") container;

    fileName: string = "";
    content: string = "";

    private editor: monaco.editor.IStandaloneCodeEditor;

    ngAfterViewInit() {
        this.createEditors();
    }

    ngOnChanges() {
        if (this.tab) {
            this.tab.ui.title = Path.getLastPart(this.tab.path);
            this.content = this.tab.content;
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
