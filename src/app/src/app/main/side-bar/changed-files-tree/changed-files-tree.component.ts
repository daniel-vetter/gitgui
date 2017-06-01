import { Input, Component, OnChanges, EventEmitter, Output, OnInit, OnDestroy } from "@angular/core";
import { ChangedFile } from "../../../services/git/model";
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

    filter: string = "";
    fileIconsChangeSubscription: Rx.Subscription;

    changeFilesTree: FileTreeNode[] = [];
    adapter = new FileTreeNodeToTreeViewAdapter();

    constructor(private fileTreeBuilder: FileTreeBuilder,
                private fileIconsManager: FileIconManager) {}


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
            this.changeFilesTree = this.fileTreeBuilder.getTree(changedFiles);
        }
    }

    onSelectedItemChange(treeNode: FileTreeNode) {
        this.onFileSelected.emit(treeNode.data);
    }
}
