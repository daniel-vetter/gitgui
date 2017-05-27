import { Component, Input, OnChanges } from "@angular/core";
import { RepositoryCommit, ChangedFile, FileRef } from "../../../services/git/model";
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

    changedFiles: ChangedFile[];
    changeFilesTree: FileTreeNode[];
    adapter = new FileTreeNodeToTreeViewAdapter<ChangedFile, FileTreeNode>();

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
                changedFiles = this.changedFiles.filter(x => Path.getLastPart(this.getPathFromChangedFile(x)).indexOf(this.filter) !== -1);
            this.changeFilesTree = this.fileTreeBuilder.getTree<ChangedFile, any>(changedFiles, x => this.getPathFromChangedFile(x), () => new FileTreeNode());
        }
    }

    private getPathFromChangedFile(changedFile: ChangedFile) {
        if (changedFile.newFile)
            return changedFile.newFile.path;
        return changedFile.oldFile.path;
    }

    onFilterChange() {
        this.updateTree();
    }

    async onFileSelected(vm: FileTreeNode) {
        if (!vm.data)
            return;

        if (!vm.data.oldFile || !vm.data.newFile) {
            const file = vm.data.oldFile ? vm.data.oldFile : vm.data.newFile;
            const tab = new FileContentTab();
            tab.repository = this.commit.repository;
            tab.file = file;
            this.tabManager.createNewTab(tab);
        } else {
            const tab = new FileContentDiffTab();
            tab.repository = this.commit.repository;
            tab.leftFile = vm.data.oldFile;
            tab.rightFile = vm.data.newFile;
            this.tabManager.createNewTab(tab);
        }
    }
}

class FileTreeNode implements IFileTreeNode<ChangedFile, FileTreeNode> {
    label: string;
    iconExpanded: IconDefinition;
    iconCollapsed: IconDefinition;
    isFolder: boolean;
    expanded: boolean;
    textClass: string;
    children: FileTreeNode[];
    data: ChangedFile;
}
