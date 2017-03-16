import { Component, Input, OnChanges, OnInit, ViewChild } from "@angular/core";
import { RepositoryCommit } from "../../../../model/model";
import { CommitDetailsReader, ChangedFile } from "../../../../services/git/commit-details-reader";
import { ChangedFileTreeNodeModel, FileTreeBuilder } from "./services/file-tree-builder";
import { ChangedFileTreeNodeModelAdapter } from "./services/changed-file-tree-node-model-adapter";
import { Path } from "../../../../services/path";
import { FileIconManager } from "../../../../services/file-icon/file-icon";
import { TabManager } from "../../../../services/tab-manager";
import { FileChangeTab } from "../../tabs";

@Component({
    selector: "commit-details",
    styleUrls: ["./commit-details.component.scss"],
    templateUrl: "./commit-details.component.html"
})
export class CommitDetailsComponent implements OnChanges {

    @Input() commit: RepositoryCommit;

    commitTitle: string = "";
    authorName: string = "";
    authorMail: string = "";
    authorDate: string = "";
    filter: string = "";

    changedFiles: ChangedFile[];
    changeFilesTree: ChangedFileTreeNodeModel[];
    adapter = new ChangedFileTreeNodeModelAdapter();

    constructor(private commitDetailsReader: CommitDetailsReader,
        private fileTreeBuilder: FileTreeBuilder,
        private fileIconsManager: FileIconManager,
        private tabManager: TabManager) { }

    ngOnChanges() {
        if (!this.commit)
            return;

        this.filter = "";
        const localCommit = this.commit;

        this.authorName = this.commit.authorName;
        this.authorMail = this.commit.authorMail;
        this.authorDate = this.commit.authorDate.toLocaleDateString() + " " + this.commit.authorDate.toLocaleTimeString();
        this.commitDetailsReader.getLongCommitMessage(this.commit).subscribe(x => {
            if (localCommit === this.commit)
                this.commitTitle = x;
        });
        this.commitDetailsReader.getFileChangesOfCommit(this.commit).subscribe(x => {
            this.changedFiles = x;
            this.updateTree();
        });

        this.fileIconsManager.onFileIconsChanged.subscribe(() => this.updateTree());

        this.updateTree();

    }

    private updateTree() {
        if (!this.changedFiles) {
            this.changeFilesTree = [];
        } else {
            let changedFiles = this.changedFiles;
            if (this.filter && this.filter !== "")
                changedFiles = this.changedFiles.filter(x => Path.getLastPart(x.path).indexOf(this.filter) !== -1);
            this.changeFilesTree = this.fileTreeBuilder.getTree(changedFiles);
        }
    }

    onFilterChange() {
        this.updateTree();
    }

    onFileSelected(vm: ChangedFileTreeNodeModel) {
        const tab = new FileChangeTab();
        tab.title = vm.label;
        this.tabManager.createNewTab(tab);
    }
}
