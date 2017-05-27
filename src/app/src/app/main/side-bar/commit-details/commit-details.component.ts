import { Component, Input, OnChanges } from "@angular/core";
import { RepositoryCommit, ChangedCommitFile } from "../../../services/git/model";
import { IFileTreeNode, FileTreeBuilder } from "./services/file-tree-builder";
import { FileTreeNodeToTreeViewAdapter } from "./services/changed-file-tree-node-model-adapter";
import { Path } from "../../../services/path";
import { FileIconManager, IconDefinition } from "../../../services/file-icon/file-icon";
import { TabManager } from "../../../services/tab-manager";
import { FileContentDiffTab, FileContentTab } from "../../tabs/tabs";
import { Git } from "../../../services/git/git";

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

    changedFiles: ChangedCommitFile[];
    changeFilesTree: FileTreeNode[];
    adapter = new FileTreeNodeToTreeViewAdapter<ChangedCommitFile, FileTreeNode>();

    constructor(private git: Git,
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
        this.git.getLongCommitMessage(this.commit).then(x => {
            if (localCommit === this.commit)
                this.commitTitle = x;
        });
        this.git.getFileChangesOfCommit(this.commit).then(x => {
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
            this.changeFilesTree = this.fileTreeBuilder.getTree<ChangedCommitFile, any>(changedFiles, x => x.path, () => new FileTreeNode());
        }
    }

    onFilterChange() {
        this.updateTree();
    }

    async onFileSelected(vm: FileTreeNode) {
        if (!vm.data)
            return;

        const curRequestId = ++this.lastRequestId;

        if (!vm.data.sourceBlob || !vm.data.destinationBlob) {
            const objectId = vm.data.sourceBlob ? vm.data.sourceBlob : vm.data.destinationBlob;
            const x = await this.git.getObjectData(this.commit.repository, objectId);
            if (curRequestId !== this.lastRequestId)
                return;
            const tab = new FileContentTab();
            tab.content = x;
            tab.repository = this.commit.repository;
            tab.path = vm.data.path;
            this.tabManager.createNewTab(tab);
        } else {

            const objectDataLeftPromise = this.git.getObjectData(this.commit.repository, vm.data.sourceBlob);
            const objectDataRightPromise = this.git.getObjectData(this.commit.repository, vm.data.destinationBlob);

            if (curRequestId !== this.lastRequestId)
                return;
            const tab = new FileContentDiffTab();
            tab.leftContent = await objectDataLeftPromise;
            tab.rightContent = await objectDataRightPromise;
            tab.repository = this.commit.repository;
            tab.leftPath = vm.data.path;
            tab.rightPath = vm.data.path;
            this.tabManager.createNewTab(tab);
        }
    }
}

class FileTreeNode implements IFileTreeNode<ChangedCommitFile, FileTreeNode> {
    label: string;
    iconExpanded: IconDefinition;
    iconCollapsed: IconDefinition;
    isFolder: boolean;
    expanded: boolean;
    textClass: string;
    children: FileTreeNode[];
    data: ChangedCommitFile;
}
