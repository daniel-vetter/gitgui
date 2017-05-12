import { FileTreeNode } from "./file-tree-builder";
import { ITreeViewAdapter } from "../../../../shared/tree-view/tree-view.component";
import { IChangedFile } from "../../../../model/model";

export class FileTreeNodeToTreeViewAdapter<T extends IChangedFile> implements ITreeViewAdapter<FileTreeNode<T>> {
    hasChildren(data: FileTreeNode<T>): boolean {
        return data.children.length > 0;
    }
    getChildren(data: FileTreeNode<T>): FileTreeNode<T>[] {
        return data.children;
    }
    getExpandedState(data: FileTreeNode<T>): boolean {
        return data.expanded;
    }
    setExpandedState(data: FileTreeNode<T>, expanded: boolean): void {
        data.expanded = expanded;
    }
}
