import { Component, Input, OnChanges } from "@angular/core";
import { Repository, ChangedFile } from "../../../services/git/model";
import { IconDefinition } from "../../../services/file-icon/file-icon";
import { Intermediate } from "../../../shared/check-box/check-box.component";
import { Subscription } from "../../../services/event-aggregator";
import { Git } from "../../../services/git/git";
import { Path } from "../../../services/path";
import { FileTreeBuilder } from "../changed-files-tree/file-tree-builder";
import { FileContentTab, FileContentDiffTab } from "../../tabs/tabs";
import { TabManager } from "../../../services/tab-manager";

@Component({
    selector: "repository-status",
    templateUrl: "./repository-status.component.html",
    styleUrls: ["./repository-status.component.scss"]
})
export class RepositoryStatusComponent implements OnChanges {
    @Input() repository: Repository;

    changedFiles: ChangedFile[] = [];
    commitMessage: string = "";
    onStatusChangeSubscription: Subscription;

    constructor(private fileTreeBuilder: FileTreeBuilder, private git: Git, private tabManager: TabManager) { }

    ngOnChanges(changes: any) {
        if (changes.repository) {
            if (this.onStatusChangeSubscription)
                this.onStatusChangeSubscription.unsubscribe();
            this.onStatusChangeSubscription = this.repository.onStatusChanged.subscribe(() => this.updateTree());
        }

        this.updateTree();
    }

    private updateTree() {
        this.changedFiles = [];
        if (!this.repository) {
            return;
        }

        for (const file of this.repository.status.workTreeChanges)
            this.changedFiles.push(file);
        for (const file of this.repository.status.indexChanges)
            this.changedFiles.push(file);
    }

    onFileSelected(changedFile: ChangedFile) {
        if (!changedFile.oldFile || !changedFile.newFile) {
            const file = changedFile.oldFile ? changedFile.oldFile : changedFile.newFile;
            const tab = new FileContentTab();
            tab.file = file;
            this.tabManager.createNewTab(tab);
        } else {
            const tab = new FileContentDiffTab();
            tab.repository = this.repository;
            tab.leftFile = changedFile.oldFile;
            tab.rightFile = changedFile.newFile;
            this.tabManager.createNewTab(tab);
        }
    }

    async onFileStageClicked(changeFile: ChangedFile) {
        await this.git.stageFile(this.repository, changeFile);
        await this.git.updateRepositoryStatus(this.repository);
        this.updateTree();
    }

    async onFolderStageClicked(path: string) {
        await this.git.stageFolder(this.repository, path);
        await this.git.updateRepositoryStatus(this.repository);
        this.updateTree();
    }

    async onFileUnstageClicked(changedFile: ChangedFile) {
        await this.git.unstageFile(this.repository, changedFile);
        await this.git.updateRepositoryStatus(this.repository);
        this.updateTree();
    }

    async onFolderUnstageClicked(path: string) {
        await this.git.unstageFolder(this.repository, path);
        await this.git.updateRepositoryStatus(this.repository);
        this.updateTree();
    }

    async onCommitClicked() {
        await this.git.commit(this.repository, this.commitMessage, false);
        await this.git.updateRepositoryStatus(this.repository);
        this.updateTree();
    }
}

class FileTreeNode {
    label: string;
    iconExpanded: IconDefinition;
    iconCollapsed: IconDefinition;
    isFolder: boolean;
    expanded: boolean;
    textClass: string;
    children: FileTreeNode[];
    data: ChangedFile;
    checked: boolean | Intermediate;
}
