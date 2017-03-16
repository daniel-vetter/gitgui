import { ChangedFileTreeNodeModel } from "./file-tree-builder";
import { ITreeViewAdapter } from "../../../../../shared/tree-view/tree-view.component";

export class ChangedFileTreeNodeModelAdapter implements ITreeViewAdapter<ChangedFileTreeNodeModel> {
    hasChildren(data: ChangedFileTreeNodeModel): boolean {
        return data.children.length > 0;
    }
    getChildren(data: ChangedFileTreeNodeModel): ChangedFileTreeNodeModel[] {
        return data.children;
    }
    getExpandedState(data: ChangedFileTreeNodeModel): boolean {
        return data.expanded;
    }
    setExpandedState(data: ChangedFileTreeNodeModel, expanded: boolean): void {
        data.expanded = expanded;
    }
}
