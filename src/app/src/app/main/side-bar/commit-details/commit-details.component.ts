import { Component, Input, OnChanges, OnInit, ViewChild } from "@angular/core";
import { RepositoryCommit } from "../../../model/model";
import { CommitDetailsReader, ChangedFile } from "../../../services/git/commit-details-reader";
import { FileTreeNode, FileTreeBuilder } from "./services/file-tree-builder";
import { FileTreeNodeToTreeViewAdapter } from "./services/changed-file-tree-node-model-adapter";
import { Path } from "../../../services/path";
import { FileIconManager } from "../../../services/file-icon/file-icon";
import { TabManager } from "../../../services/tab-manager";
import { TextDiffTab, TextTab } from "../../tabs/tabs";
import { ObjectReader } from "../../../services/git/object-reader";
import * as Rx from "rxjs";

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

    private lastRequestId = 0;

    changedFiles: ChangedFile[];
    changeFilesTree: FileTreeNode<ChangedFile>[];
    adapter = new FileTreeNodeToTreeViewAdapter<ChangedFile>();

    constructor(private commitDetailsReader: CommitDetailsReader,
        private fileTreeBuilder: FileTreeBuilder,
        private fileIconsManager: FileIconManager,
        private objectReader: ObjectReader,
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

    onFileSelected(vm: FileTreeNode<ChangedFile>) {
        if (!vm.data)
            return;

        const curRequestId = ++this.lastRequestId;

        if (!vm.data.sourceBlob || !vm.data.destinationBlob) {
            const objectId = vm.data.sourceBlob ? vm.data.sourceBlob : vm.data.destinationBlob;
            this.objectReader.getObjectData(this.commit.repository.location, objectId).subscribe(x => {
                if (curRequestId !== this.lastRequestId)
                    return;
                const tab = new TextTab();
                tab.content = x;
                tab.repository = this.commit.repository;
                tab.path = vm.data.path;
                this.tabManager.createNewTab(tab);
            });
        } else {
            Rx.Observable.forkJoin(
                this.objectReader.getObjectData(this.commit.repository.location, vm.data.sourceBlob),
                this.objectReader.getObjectData(this.commit.repository.location, vm.data.destinationBlob))
                .subscribe((x) => {
                    if (curRequestId !== this.lastRequestId)
                        return;
                    const tab = new TextDiffTab();
                    tab.leftContent = x[0];
                    tab.rightContent = x[1];
                    tab.repository = this.commit.repository;
                    tab.leftPath = vm.data.path;
                    tab.rightPath = vm.data.path;
                    this.tabManager.createNewTab(tab);
                });
        }


    }
}
