import { ChangedFile } from "../../../../services/git/commit-details-reader";
import { IconDefinition, FileIconManager } from "../../../../services/file-icon/file-icon";
import { Injectable } from "@angular/core";
import { Path } from "../../../../services/path";

@Injectable()
export class FileTreeBuilder {

    constructor(private fileIconManager: FileIconManager) {}

    getTree(changedFiles: ChangedFile[]): ChangedFileTreeNodeModel[] {
        const root = this.createBaseTree(changedFiles);
        this.combineFolderWithOneParent(root);
        this.orderChildren(root);
        this.addMetadata(root);
        return root.children;
    }

    private createBaseTree(changedFiles: ChangedFile[]): ChangedFileTreeNodeModel {
        const index = new ChildIndex();
        const root = new ChangedFileTreeNodeModel();
        for (const change of changedFiles) {
            const parts = change.path.split("/");
            let curNode = root;
            for (const part of parts) {
                let childNode = index.get(curNode, part);
                if (!childNode) {
                    childNode = new ChangedFileTreeNodeModel();
                    childNode.label = part;
                    childNode.expanded = true;
                    curNode.children.push(childNode);
                    index.set(curNode, childNode);
                }
                curNode = childNode;
            }
        }
        return root;
    }

    private orderChildren(node: ChangedFileTreeNodeModel) {
        this.forEachNode(node, x => {
            x.children.sort((a, b) => {
                if (a.children.length > 0 && b.children.length === 0)
                    return -1;
                if (a.children.length === 0 && b.children.length > 0)
                    return 1;
                if (a.label < b.label)
                    return -1;
                if (a.label > b.label)
                    return 1;
                if (a.label === b.label)
                    return 0;
            });
        });
    }

    private combineFolderWithOneParent(root: ChangedFileTreeNodeModel) {
        for(const child of root.children) {
            this.forEachNode(child, x => {
                while (x.children.length === 1 && x.children[0].children.length !== 0) {
                    x.label = Path.combine(x.label, x.children[0].label);
                    x.children = x.children[0].children;
                }
            });
        }
    }

    private addMetadata(node: ChangedFileTreeNodeModel) {
        this.forEachNode(node, x => {
            x.isFolder = x.children.length > 0;
            if (x.isFolder) {
                const iconDefinition = this.fileIconManager.getFolderIcon(x.label);
                x.iconExpanded = iconDefinition.expanded;
                x.iconCollapsed = iconDefinition.collapsed;
            } else {
                const iconDefinition = this.fileIconManager.getFileIcon(x.label);
                x.iconExpanded = iconDefinition;
                x.iconCollapsed = iconDefinition;
            }
        });
    }

    private forEachNode(node: ChangedFileTreeNodeModel, action: (node: ChangedFileTreeNodeModel) => void) {
        action(node);
        for (const child of node.children) {
            this.forEachNode(child, action);
        }
    }
}

export class ChangedFileTreeNodeModel {
    label: string = "";
    iconExpanded: IconDefinition;
    iconCollapsed: IconDefinition;
    isFolder: boolean;
    expanded: boolean;
    children: ChangedFileTreeNodeModel[] = [];
}

class ChildIndex {

    private data = new Map<ChangedFileTreeNodeModel, Map<string, ChangedFileTreeNodeModel>>();

    set(node: ChangedFileTreeNodeModel, child: ChangedFileTreeNodeModel) {
        return this.getSubIndex(node).set(child.label, child);
    }

    get (node: ChangedFileTreeNodeModel, childLabel: string): ChangedFileTreeNodeModel {
        return this.getSubIndex(node).get(childLabel);
    }

    private getSubIndex(node: ChangedFileTreeNodeModel): Map<string, ChangedFileTreeNodeModel> {
        let subIndex = this.data.get(node);
        if (subIndex) {
            return subIndex;
        }
        subIndex = new Map<string, ChangedFileTreeNodeModel>();
        this.data.set(node, subIndex);
        return subIndex;
    }
}
