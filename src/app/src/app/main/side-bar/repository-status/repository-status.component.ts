import { Component, Input, OnChanges } from "@angular/core";
import { Repository, IndexFile, IndexFileChangeType } from "../../../services/git/model";
import { FileTreeBuilder, IFileTreeNode } from "../commit-details/services/file-tree-builder";
import { FileTreeNodeToTreeViewAdapter } from "../commit-details/services/changed-file-tree-node-model-adapter";
import { IconDefinition } from "../../../services/file-icon/file-icon";
import { Intermediate } from "../../../shared/check-box/check-box.component";
import { Subscription } from "../../../services/event-aggregator";
import { Git } from "../../../services/git/git";
import { Path } from "../../../services/path";

@Component({
    selector: "repository-status",
    templateUrl: "./repository-status.component.html",
    styleUrls: ["./repository-status.component.scss"]
})
export class RepositoryStatusComponent implements OnChanges {
    @Input() repository: Repository;

    files: IndexFile[] = [];
    filesTree: FileTreeNode[] = [];
    adapter = new FileTreeNodeToTreeViewAdapter();
    commitMessage: string = "";

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

        const files = this.repository.status.indexFiles;
        this.filesTree = this.fileTreeBuilder.getTree<IndexFile, FileTreeNode>(files, x => x.path, () => new FileTreeNode());

        const updateState = (node: FileTreeNode) => {
            node.children.forEach(y => updateState(y));

            if (node.isFolder) {
                node.checked = node.children.filter(x => x.checked === false).length === 0;
            } else {
                node.checked = false;
                if (node.data.indexChangeType !== IndexFileChangeType.Unmodified &&
                    node.data.workTreeChangeType === IndexFileChangeType.Unmodified)
                    node.checked = true;
                if (node.data.indexChangeType !== IndexFileChangeType.Unmodified &&
                    node.data.workTreeChangeType !== IndexFileChangeType.Unmodified)
                    node.checked = "Intermediate";
            }
        };
        this.filesTree.forEach(x => updateState(x));
    }

    onFileSelected() {

    }

    async onCheckBoxStateChanged(node: FileTreeNode) {

        const path = node.isFolder ?
            this.findLongestMatchingPath(this.getAllFileChangesFromFolderNode(node).map(x => x.path)) :
            node.data.path;

        if (node.checked)
            await this.git.stageFile(this.repository, path);
        else
            await this.git.unstageFile(this.repository, path);

        await this.git.updateRepositoryStatus(this.repository);
        this.update();
    }

    private getAllFileChangesFromFolderNode(node: FileTreeNode): IndexFile[] {
        const result: IndexFile[] = [];
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
        this.update();
    }
}

class FileTreeNode implements IFileTreeNode<IndexFile, FileTreeNode> {
    label: string;
    iconExpanded: IconDefinition;
    iconCollapsed: IconDefinition;
    isFolder: boolean;
    expanded: boolean;
    textClass: string;
    children: FileTreeNode[];
    data: IndexFile;
    checked: boolean | Intermediate;
}
