import { Component, Input, OnChanges } from "@angular/core";
import { Repository, ChangedFile } from "../../../model/model";
import { FileTreeBuilder, FileTreeNode } from "../commit-details/services/file-tree-builder";
import { FileTreeNodeToTreeViewAdapter } from "../commit-details/services/changed-file-tree-node-model-adapter";
@Component({
    selector: "repository-status",
    templateUrl: "./repository-status.component.html",
    styleUrls: ["./repository-status.component.scss"]
})
export class RepositoryStatusComponent implements OnChanges {
    @Input() repository: Repository;

    files: ChangedFile[] = [];
    filesTree: FileTreeNode<ChangedFile>[] = [];
    adapter = new FileTreeNodeToTreeViewAdapter();

    constructor(private fileTreeBuilder: FileTreeBuilder) {}

    ngOnChanges() {
        this.update();
    }

    private update() {
        if (!this.repository) {
            this.files = [];
            return;
        }

        var viewModels = this.fileTreeBuilder.getTree(this.repository.status.unstaged);
        this.filesTree = viewModels;

    }
}
