import { Component, Input } from "@angular/core";
import { HistoryTab } from "../tabs";
import { Repository, RepositoryCommit } from "../../../model/model";
import { SideBarManager } from "../../../services/side-bar-manager";

declare var monaco: any;
declare var global: any;

@Component({
    selector: "history-tab",
    templateUrl: "./history-tab.component.html"
})
export class HistoryTabComponent {
    @Input() tab: HistoryTab = undefined;

    repository: Repository;
    selectedCommit: RepositoryCommit;

    constructor(private sideBarManager: SideBarManager) {}


    ngOnChanges() {
        this.repository = this.tab.repository;
        if (this.repository) {
            this.tab.ui.isCloseable = false;
        }
    }
/*
    ngOnInit() {
        debugger;
        var nodeRequire = global["require"];

        nodeRequire("./editor/loader.js", () => {
            console.log("loaded");
        });

        var amdRequire = global["require"];
		global["require"] = nodeRequire;

        amdRequire.config({
			baseUrl: "./editor/"
		});

        // workaround monaco-css not understanding the environment
		self["module"] = undefined;
		// workaround monaco-typescript not understanding the environment
		self["process"].browser = true;

        amdRequire(['vs/editor/editor.main'], function() {
			var editor = monaco.editor.create(document.getElementById('container'), {
				value: [
					'function x() {',
					'\tconsole.log("Hello world!");',
					'}'
				].join('\n'),
				language: 'javascript'
			});
		});

    }*/

    onSelectedCommitChange() {
        this.sideBarManager.showCommitDetails(this.selectedCommit);
    }
}
