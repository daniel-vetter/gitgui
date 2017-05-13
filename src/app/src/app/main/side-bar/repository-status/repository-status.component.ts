import { Component, Input, OnChanges } from "@angular/core";
import { Repository, ChangedFile } from "../../../services/git/model";
import { FileTreeBuilder, IFileTreeNode } from "../commit-details/services/file-tree-builder";
import { FileTreeNodeToTreeViewAdapter } from "../commit-details/services/changed-file-tree-node-model-adapter";
import { IconDefinition } from "../../../services/file-icon/file-icon";
import { Intermediate } from "../../../shared/check-box/check-box.component";
import { Subscription } from "../../../services/event-aggregator";

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

    constructor(private fileTreeBuilder: FileTreeBuilder) {}

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

        const updateState = (x: FileTreeNode) => {
            const isUnstaged = this.repository.status.unstaged.indexOf(x.data) !== -1;
            const isStaged = this.repository.status.staged.indexOf(x.data) !== -1;
            if (isUnstaged && isStaged) {
                x.checked = "Intermediate";
            } else if (isStaged) {
                x.checked = true;
            } else {
                x.checked = false;
            }
            x.children.forEach(y => updateState(y));
        };
        this.filesTree.forEach(x => updateState(x));
    }

    onFileSelected() {

    }

    onCheckBoxStateChanged(node: FileTreeNode) {
        console.log(node, node.checked);
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
