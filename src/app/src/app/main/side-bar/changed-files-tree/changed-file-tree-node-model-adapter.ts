import { ITreeViewAdapter } from "../../../shared/tree-view/tree-view.component";
import { FileTreeNode } from "./file-tree-builder";

export class FileTreeNodeToTreeViewAdapter implements ITreeViewAdapter<FileTreeNode> {
    hasChildren(data: FileTreeNode): boolean {
        return data.children.length > 0;
    }
    getChildren(data: FileTreeNode): FileTreeNode[] {
        return data.children;
    }
    getExpandedState(data: FileTreeNode): boolean {
        return data.expanded;
    }
    setExpandedState(data: FileTreeNode, expanded: boolean): void {
        data.expanded = expanded;
    }
    indentChildren(data: FileTreeNode): boolean {
        return !data.isHeaderNode;
    }
}
