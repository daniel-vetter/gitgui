import { IFileTreeNode } from "./file-tree-builder";
import { ITreeViewAdapter } from "../../../../shared/tree-view/tree-view.component";

export class FileTreeNodeToTreeViewAdapter<TSource, TTarget extends IFileTreeNode<TSource, TTarget>> implements ITreeViewAdapter<IFileTreeNode<TSource, TTarget>> {
    hasChildren(data: IFileTreeNode<TSource, TTarget>): boolean {
        return data.children.length > 0;
    }
    getChildren(data: IFileTreeNode<TSource, TTarget>): IFileTreeNode<TSource, TTarget>[] {
        return data.children;
    }
    getExpandedState(data: IFileTreeNode<TSource, TTarget>): boolean {
        return data.expanded;
    }
    setExpandedState(data: IFileTreeNode<TSource, TTarget>, expanded: boolean): void {
        data.expanded = expanded;
    }
}
