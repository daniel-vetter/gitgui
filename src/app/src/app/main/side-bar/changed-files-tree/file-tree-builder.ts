import { Injectable } from "@angular/core";
import { FileIconManager, IconDefinition } from "../../../services/file-icon/file-icon";
import { Path } from "../../../services/path";
import { ChangedFile, IndexChangedFile } from "../../../services/git/model";

@Injectable()
export class FileTreeBuilder {

    constructor(private fileIconManager: FileIconManager) { }

    getTree(changedFiles: ChangedFile[]): FileTreeNode[] {
        const root = this.createBaseTree(changedFiles);
        this.combineFolderWithOneParent(root);
        this.orderChildren(root);
        this.addMetadata(root);
        return root.children;
    }

    private createBaseTree(changedFiles: ChangedFile[]): FileTreeNode {
        const targetFactoryEx = () => {
            const newObj = new FileTreeNode();
            newObj.label = "";
            newObj.children = [];
            return newObj;
        };
        const index = new ChildIndex();
        const root = targetFactoryEx();
        for (const change of changedFiles) {
            const parts = this.getPathFromChangedFile(change).split("/");
            let curNode = root;
            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                let childNode = index.get(curNode, part);
                if (!childNode) {
                    childNode = targetFactoryEx();
                    childNode.label = part;
                    childNode.expanded = true;
                    if (i === parts.length - 1) {
                        childNode.data = change;
                    }
                    if (change instanceof IndexChangedFile) {
                        childNode.showStageButton = !change.isStaged;
                        childNode.showUnstageButton = change.isStaged;
                    } else {
                        childNode.showStageButton = false;
                        childNode.showUnstageButton = false;
                    }
                    curNode.children.push(childNode);
                    index.set(curNode, childNode);
                }
                curNode = childNode;
            }
        }
        return root;
    }

    private getPathFromChangedFile(changedFile: ChangedFile): string {
        if (changedFile.newFile)
            return changedFile.newFile.path;
        return changedFile.oldFile.path;
    }

    private orderChildren(node: FileTreeNode) {
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

    private combineFolderWithOneParent(root: FileTreeNode) {
        for (const child of root.children) {
            this.forEachNode(child, x => {
                while (x.children.length === 1 && x.children[0].children.length !== 0) {
                    x.label = Path.combine(x.label, x.children[0].label);
                    x.children = x.children[0].children;
                }
            });
        }
    }

    private addMetadata(node: FileTreeNode) {
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


    private forEachNode(node: FileTreeNode, action: (node: FileTreeNode) => void) {
        action(node);
        for (const child of node.children) {
            this.forEachNode(child, action);
        }
    }
}

export class FileTreeNode {
    label: string;
    iconExpanded: IconDefinition;
    iconCollapsed: IconDefinition;
    isFolder: boolean;
    expanded: boolean;
    textClass: string;
    children: FileTreeNode[];
    data: ChangedFile;
    showStageButton: boolean;
    showUnstageButton: boolean;
}



class ChildIndex {

    private data = new Map<FileTreeNode, Map<string, FileTreeNode>>();

    set(node: FileTreeNode, child: FileTreeNode) {
        return this.getSubIndex(node).set(child.label, child);
    }

    get(node: FileTreeNode, childLabel: string): FileTreeNode {
        return this.getSubIndex(node).get(childLabel);
    }

    private getSubIndex(node: FileTreeNode): Map<string, FileTreeNode> {
        let subIndex = this.data.get(node);
        if (subIndex) {
            return subIndex;
        }
        subIndex = new Map<string, FileTreeNode>();
        this.data.set(node, subIndex);
        return subIndex;
    }
}
