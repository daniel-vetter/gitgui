import { Component, Input, OnChanges, ViewChild } from "@angular/core";
import { Repository, ChangedFile, UpdateState } from "../../../services/git/model";
import { IconDefinition } from "../../../services/file-icon/file-icon";
import { Intermediate } from "../../../shared/check-box/check-box.component";
import { Subscription } from "../../../services/event-aggregator";
import { Git } from "../../../services/git/git";
import { FileTreeBuilder } from "../changed-files-tree/file-tree-builder";
import { FileContentTab, FileContentDiffTab, HistoryTab } from "../../tabs/tabs";
import { TabManager } from "../../../services/tab-manager";
import { Status } from "../../../services/status";
import * as autosize from "autosize";

@Component({
    selector: "repository-status",
    templateUrl: "./repository-status.component.html",
    styleUrls: ["./repository-status.component.scss"]
})
export class RepositoryStatusComponent implements OnChanges {
    @Input() repository: Repository;
    @ViewChild("commitMessageTextArea") commitMessageTextArea;

    changedFiles: ChangedFile[] = [];
    commitMessage: string = "";
    onStatusChangeSubscription: Subscription;

    constructor(private fileTreeBuilder: FileTreeBuilder,
        private git: Git,
        private tabManager: TabManager,
        private status: Status) { }

    ngOnInit() {
        autosize(this.commitMessageTextArea.nativeElement);
    }

    ngOnDestroy() {
        autosize.destroy(this.commitMessageTextArea.nativeElement);
    }

    ngOnChanges(changes: any) {
        if (changes.repository) {
            if (this.onStatusChangeSubscription)
                this.onStatusChangeSubscription.unsubscribe();
            this.onStatusChangeSubscription = this.repository.onUpdate.subscribe((x: UpdateState) => {
                if (x.status)
                    this.updateTree()
            });
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
            tab.repository = this.repository;
            tab.file = file;
            tab.ui.isPersistent = false;
            this.tabManager.createNewTab(tab);
        } else {
            const tab = new FileContentDiffTab();
            tab.repository = this.repository;
            tab.ui.isPersistent = false;
            tab.leftFile = changedFile.oldFile;
            tab.rightFile = changedFile.newFile;
            this.tabManager.createNewTab(tab);
        }
    }

    async onStageClicked(changeFile: ChangedFile | string) {
        this.status.startProcess("Staging", async () => {
            await this.git.stage(this.repository, changeFile);
            await this.git.updateRepositoryStatus(this.repository);
            this.updateTree();
        });
    }

    async onUnstageClicked(changedFile: ChangedFile) {
        this.status.startProcess("Unstaging", async () => {
            await this.git.unstage(this.repository, changedFile);
            await this.git.updateRepositoryStatus(this.repository);
            this.updateTree();
        });
    }

    async onCommitClicked() {
        this.status.startProcess("Committing", async () => {

            const historyTabs = this.tabManager.allTabs.filter(x => x instanceof HistoryTab && x.repository === this.repository);
            if (historyTabs.length === 1)
                this.tabManager.selectedTab = historyTabs[0];

            await this.git.commit(this.repository, this.commitMessage, false);
            await this.git.updateRepository(this.repository);
            this.updateTree();
            this.commitMessage = "";
        });
    }

    onCommitMessageKeyDown(event: KeyboardEvent) {
        if (event.ctrlKey && event.keyCode === 13) {
            this.onCommitClicked();
        }
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
