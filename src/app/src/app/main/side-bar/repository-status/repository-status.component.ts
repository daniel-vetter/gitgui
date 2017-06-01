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

    workTreeChanges: ChangedFile[] = [];
    indexChanges: ChangedFile[] = [];
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
        if (!this.repository) {
            this.workTreeChanges = [];
            this.indexChanges = [];
            return;
        }

        this.workTreeChanges = this.repository.status.workTreeChanges;
        this.indexChanges = this.repository.status.indexChanges;
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

    async onCheckBoxStateChanged(node: FileTreeNode) {
        /*
        const path = node.isFolder ?
            this.findLongestMatchingPath(this.getAllFileChangesFromFolderNode(node).map(x => x.path)) :
            node.data.path;

        if (node.checked)
            await this.git.stageFile(this.repository, path);
        else
            await this.git.unstageFile(this.repository, path);

        await this.git.updateRepositoryStatus(this.repository);
        this.update();
        */
    }

    private getAllFileChangesFromFolderNode(node: FileTreeNode): ChangedFile[] {
        const result: ChangedFile[] = [];
        const traverseChildren = (n: FileTreeNode) => {
            if (n.isFolder) {
                for (const child of n.children)
                    traverseChildren(child);
            } else {
                result.push(n.data);
            }
        };
        traverseChildren(node);
        return result;
    }

    private findLongestMatchingPath(paths: string[]): string {

        const allStringsAreTheSame = (list: string[]): boolean => {
            for (let i = 1; i < list.length; i++)
                if (list[i - 1] !== list[i])
                    return false;
            return true;
        };

        const allParts = paths.map(x => Path.getAllParts(x));
        let matchingIndex = 0;
        while (true) {
            const slice = allParts.map(x => x[matchingIndex]);
            if (!allStringsAreTheSame(slice))
                break;
            if (slice[0] === undefined)
                break;
            matchingIndex++;
        }
        if (matchingIndex === 0)
            return ".";
        return Path.combine(...allParts[0].filter((v, i) => i < matchingIndex));
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
