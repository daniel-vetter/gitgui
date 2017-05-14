import { Component, Input, OnChanges } from "@angular/core";
import { Repository, ChangedFile, ChangedCommitFile } from "../../../services/git/model";
import { FileTreeBuilder, IFileTreeNode } from "../commit-details/services/file-tree-builder";
import { FileTreeNodeToTreeViewAdapter } from "../commit-details/services/changed-file-tree-node-model-adapter";
import { IconDefinition } from "../../../services/file-icon/file-icon";
import { Intermediate } from "../../../shared/check-box/check-box.component";
import { Subscription } from "../../../services/event-aggregator";
import { Git } from "../../../services/git/git";
import * as Rx from "rxjs";
import { Path } from "../../../services/path";

@Component({
    selector: "repository-status",
    templateUrl: "./repository-status.component.html",
    styleUrls: ["./repository-status.component.scss"]
})
export class RepositoryStatusComponent implements OnChanges {
    @Input() repository: Repository;

    files: ChangedFile[] = [];
    filesTree: FileTreeNode[] = [];
    adapter = new FileTreeNodeToTreeViewAdapter();

    onStatusChangeSubscription: Subscription;

    constructor(private fileTreeBuilder: FileTreeBuilder, private git: Git) { }

    ngOnChanges(changes: any) {
        if (changes.repository) {
            if (this.onStatusChangeSubscription)
                this.onStatusChangeSubscription.unsubscribe();
            this.onStatusChangeSubscription = this.repository.onStatusChanged.subscribe(() => this.onRepositoryStatusChange());
        }

        this.update();
    }

    private onRepositoryStatusChange() {
        this.update();
    }

    private update() {
        if (!this.repository) {
            this.files = [];
            return;
        }

        const fullList: ChangedFile[] = [];
        this.repository.status.unstaged.forEach(x => fullList.push(x));
        this.repository.status.staged.forEach(x => fullList.push(x));
        this.filesTree = this.fileTreeBuilder.getTree<ChangedFile, FileTreeNode>(fullList, () => new FileTreeNode());

        const updateState = (node: FileTreeNode) => {
            node.children.forEach(y => updateState(y));

            if (node.isFolder) {
                node.checked = node.children.filter(x => x.checked === false).length === 0;
            } else {
                const isUnstaged = this.repository.status.unstaged.indexOf(node.data) !== -1;
                const isStaged = this.repository.status.staged.indexOf(node.data) !== -1;
                if (isUnstaged && isStaged) {
                    node.checked = "Intermediate";
                } else if (isStaged) {
                    node.checked = true;
                } else {
                    node.checked = false;
                }
            }
        };
        this.filesTree.forEach(x => updateState(x));
    }

    onFileSelected() {

    }

    onCheckBoxStateChanged(node: FileTreeNode) {

        const path = node.isFolder ?
            this.findLongestMatchingPath(this.getAllFileChangesFromFolderNode(node).map(x => x.path)) :
            node.data.path;

        (node.checked ?
            this.git.stageFile(this.repository, path) :
            this.git.unstageFile(this.repository, path))
            .flatMap(() => {
                return this.git.updateRepositoryStatus(this.repository)
            })
            .subscribe(() => {
                this.update();
            });
    }

    private getAllFileChangesFromFolderNode(node: FileTreeNode): ChangedFile[] {
        const result: ChangedFile[] = [];
        const traverseChildren = (node: FileTreeNode) => {
            if (node.isFolder) {
                for (const child of node.children)
                    traverseChildren(child);
            } else {
                result.push(node.data);
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
        }

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
    checked: boolean | Intermediate;
}
