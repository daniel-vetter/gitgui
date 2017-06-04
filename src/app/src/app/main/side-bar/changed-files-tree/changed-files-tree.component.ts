import { Input, Component, OnChanges, EventEmitter, Output, OnInit, OnDestroy } from "@angular/core";
import { ChangedFile, IndexChangedFile } from "../../../services/git/model";
import { IconDefinition, FileIconManager } from "../../../services/file-icon/file-icon";
import { Path } from "../../../services/path";
import * as Rx from "rxjs";
import { FileTreeNodeToTreeViewAdapter } from "./changed-file-tree-node-model-adapter";
import { FileTreeBuilder, FileTreeNode } from "./file-tree-builder";

@Component({
    selector: "changed-files-tree",
    templateUrl: "./changed-files-tree.component.html",
    styleUrls: ["./changed-files-tree.component.scss"]
})
export class ChangedFilesTreeComponent implements OnChanges, OnInit, OnDestroy {

    @Input() changedFiles: ChangedFile[] = [];
    @Input() showStageButtons: boolean = false;

    @Output() onFileSelected = new EventEmitter<ChangedFile>();
    @Output() onFileStageClicked = new EventEmitter<ChangedFile>();
    @Output() onFileUnstageClicked = new EventEmitter<ChangedFile>();
    @Output() onFolderStageClicked = new EventEmitter<string>();
    @Output() onFolderUnstageClicked = new EventEmitter<string>();

    filter: string = "";
    fileIconsChangeSubscription: Rx.Subscription;

    changeFilesTree: FileTreeNode[] = [];
    adapter = new FileTreeNodeToTreeViewAdapter();

    constructor(private fileTreeBuilder: FileTreeBuilder,
        private fileIconsManager: FileIconManager) { }


    ngOnInit() {
        this.fileIconsChangeSubscription = this.fileIconsManager.onFileIconsChanged.subscribe(() => this.updateTree());
    }

    ngOnDestroy() {
        this.fileIconsChangeSubscription.unsubscribe();
    }

    ngOnChanges() {
        this.updateTree();
    }

    onFilterChange() {
        this.updateTree();
    }

    private updateTree() {
        if (!this.changedFiles) {
            this.changeFilesTree = [];
        } else {
            let changedFiles = this.changedFiles;
            if (this.filter && this.filter !== "")
                changedFiles = this.changedFiles.filter(x => {
                    if (x.newFile && Path.getLastPart(x.newFile.path).indexOf(this.filter) !== -1)
                        return true;
                    if (x.oldFile && Path.getLastPart(x.oldFile.path).indexOf(this.filter) !== -1)
                        return true;
                    return false;
                });

            this.changeFilesTree = this.fileTreeBuilder.getTree(changedFiles);
        }
    }

    onStagedStateChanged(treeNode: FileTreeNode, state: boolean) {
        if (state) {
            if (treeNode.isFolder) {
                this.onFolderStageClicked.emit(treeNode.path);
            } else {
                this.onFileStageClicked.emit(treeNode.data);
            }
        } else {
            if (treeNode.isFolder) {
                this.onFolderUnstageClicked.emit(treeNode.path);
                
            } else {
                this.onFileUnstageClicked.emit(treeNode.data);
            }
        }
        this.previewStagedState(treeNode, state);
    }

    previewStagedState(treeNode: FileTreeNode, newStagedState: boolean) {
        const forEachNode = (treeNode: FileTreeNode, action: (x: FileTreeNode) => void) => {
            action(treeNode);
            treeNode.children.forEach(y => forEachNode(y, action));
        };

        forEachNode(treeNode, x => x.isStaged = newStagedState);
        let parent = treeNode.parent;
        while (parent) {
            parent.isStaged = parent.children.filter(x => x.isStaged === false).length === 0;
            parent = parent.parent;
        }
    }

    onSelectedItemChange(treeNode: FileTreeNode) {
        if (!treeNode.isFolder)
            this.onFileSelected.emit(treeNode.data);
    }
}
