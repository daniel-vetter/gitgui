import { Component, Input, OnChanges, ViewChild, ElementRef, OnInit, OnDestroy } from "@angular/core";
import { Repository, ChangedFile, UpdatedElements } from "../../../services/git/model";
import { IconDefinition } from "../../../services/file-icon/file-icon";
import { Intermediate } from "../../../shared/check-box/check-box.component";
import { Subscription } from "../../../services/event-aggregator";
import { Git } from "../../../services/git/git";
import { FileTreeBuilder } from "../changed-files-tree/file-tree-builder";
import { FileContentTabData, FileContentDiffTabData, HistoryTabData } from "../../tabs/tabs";
import { Status } from "../../../services/status";
import * as autosize from "autosize";
import { ProcessTracker } from "./process-tracker";
import { TabManager } from "app/services/tabs/tab-manager";
import { TabData } from "app/main/tabs/tabs";

@Component({
    selector: "repository-status",
    templateUrl: "./repository-status.component.html",
    styleUrls: ["./repository-status.component.scss"]
})
export class RepositoryStatusComponent implements OnInit, OnDestroy, OnChanges {
    @Input() repository: Repository;
    @ViewChild("commitMessageTextArea") commitMessageTextArea: ElementRef;

    changedFiles: ChangedFile[] = [];
    commitMessage = "";
    onStatusChangeSubscription: Subscription;
    commitButtonEnabled = true;

    private processTracker = new ProcessTracker();
    private commitIsRunning = false;

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
            this.onStatusChangeSubscription = this.repository.updateState.onUpdateFinished.subscribe((x: UpdatedElements) => {
                if (x.status) {
                    this.updateTree();
                    this.updateButtonEnableState();
                }
            });
        }
        this.updateTree();
        this.updateButtonEnableState();
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

    private updateButtonEnableState() {
        this.commitButtonEnabled = this.repository.status.indexChanges.length !== 0 &&
            this.commitMessage !== undefined &&
            this.commitMessage.trim() !== "" &&
            this.commitIsRunning === false;
    }

    onFileSelected(changedFile: ChangedFile) {
        if (!changedFile.oldFile || !changedFile.newFile) {
            const file = changedFile.oldFile ? changedFile.oldFile : changedFile.newFile;
            const page = this.tabManager.createNewTab({
                type: "FileContentTab",
                repository: this.repository,
                file: file!,
            });
            page.isPersistent = false;
        } else {
            const page = this.tabManager.createNewTab({
                type: "FileContentDiffTab",
                repository: this.repository,
                leftFile: changedFile.oldFile,
                rightFile: changedFile.newFile
            });
            page.isPersistent = false;
        }
    }

    async onStageClicked(changeFile: ChangedFile | string) {
        this.status.startProcess("Staging", async () => {
            const process = this.processTracker.processHasStarted();
            await this.git.stage(this.repository, changeFile);
            await this.git.updateRepositoryStatus(this.repository);
            this.updateTree();
            this.updateButtonEnableState();
            process.completed();
        });
    }

    async onUnstageClicked(changedFile: ChangedFile) {
        this.status.startProcess("Unstaging", async () => {
            const process = this.processTracker.processHasStarted();
            await this.git.unstage(this.repository, changedFile);
            await this.git.updateRepositoryStatus(this.repository);
            this.updateTree();
            this.updateButtonEnableState();
            process.completed();
        });
    }

    async onCommitClicked() {
        if (!this.commitButtonEnabled)
            return;
        this.status.startProcess("Committing", async () => {
            this.commitIsRunning = true;
            this.updateButtonEnableState();
            await this.processTracker.allDone();
            for (const page of this.tabManager.allTabPages) {
                if (page.data.type !== "HistoryTab")
                    continue;
                if (this.repository === await page.data.repository) {
                    this.tabManager.selectedTab = page;
                    break;
                }
            }

            await this.git.commit(this.repository, this.commitMessage, false);
            await this.git.updateRepository(this.repository);
            this.commitMessage = "";
            this.commitIsRunning = false;
            this.updateTree();
            this.updateButtonEnableState();
        });
    }

    onCommitMessageKeyDown(event: KeyboardEvent) {
        if (event.ctrlKey && event.keyCode === 13) {
            this.onCommitClicked();
        }
    }

    onCommitMessageChanged() {
        this.updateButtonEnableState();
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
