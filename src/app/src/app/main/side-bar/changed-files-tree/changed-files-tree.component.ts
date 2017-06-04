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
    @Input() splitStagedAndUnstaged: boolean = false;

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
                    if (x.newFile && Path.getAllParts(x.newFile.path).indexOf(this.filter) !== -1)
                        return true;
                    if (x.oldFile && Path.getAllParts(x.oldFile.path).indexOf(this.filter) !== -1)
                        return true;
                    return false;
                });

            if (this.splitStagedAndUnstaged)
                this.changeFilesTree = this.fileTreeBuilder.getSplitTree(changedFiles);
            else
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
    }

    onSelectedItemChange(treeNode: FileTreeNode) {
        if (!treeNode.isFolder)
            this.onFileSelected.emit(treeNode.data);
    }
}
