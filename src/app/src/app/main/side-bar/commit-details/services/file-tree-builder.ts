import { IconDefinition, FileIconManager } from "../../../../services/file-icon/file-icon";
import { Injectable } from "@angular/core";
import { Path } from "../../../../services/path";
import { FileChangeType, IChangedFile } from "../../../../model/model";

/**
 * Builds a tree of FileTreeNode objects from a flat list of files.
 */
@Injectable()
export class FileTreeBuilder {

    constructor(private fileIconManager: FileIconManager) { }

    getTree<T extends IChangedFile>(changedFiles: T[]): FileTreeNode<T>[] {
        const root = this.createBaseTree(changedFiles);
        this.combineFolderWithOneParent(root);
        this.orderChildren(root);
        this.addMetadata(root);
        return root.children;
    }

    private createBaseTree<T extends IChangedFile>(changedFiles: T[]): FileTreeNode<T> {
        const index = new ChildIndex();
        const root = new FileTreeNode<T>();
        for (const change of changedFiles) {
            const parts = change.path.split("/");
            let curNode = root;
            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                let childNode = index.get(curNode, part);
                if (!childNode) {
                    childNode = new FileTreeNode<T>();
                    childNode.label = part;
                    childNode.expanded = true;
                    if (i === parts.length - 1) {
                        if (change.type === FileChangeType.Added) childNode.textClass = "entryAdd";
                        else if (change.type === FileChangeType.Deleted) childNode.textClass = "entryRemove";
                        else childNode.textClass = "entryChange";
                        childNode.data = change;
                    }
                    curNode.children.push(<FileTreeNode<T>>childNode);
                    index.set(curNode, childNode);
                }
                curNode = <FileTreeNode<T>>childNode;
            }
        }
        return root;
    }

    private orderChildren<T extends IChangedFile>(node: FileTreeNode<T>) {
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

    private combineFolderWithOneParent<T extends IChangedFile>(root: FileTreeNode<T>) {
        for (const child of root.children) {
            this.forEachNode(child, x => {
                while (x.children.length === 1 && x.children[0].children.length !== 0) {
                    x.label = Path.combine(x.label, x.children[0].label);
                    x.children = x.children[0].children;
                }
            });
        }
    }

    private addMetadata<T extends IChangedFile>(node: FileTreeNode<T>) {
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

    private forEachNode<T extends IChangedFile>(node: FileTreeNode<T>, action: (node: FileTreeNode<T>) => void) {
        action(node);
        for (const child of node.children) {
            this.forEachNode(child, action);
        }
    }
}

export class FileTreeNode<T extends IChangedFile> {
    label: string = "";
    iconExpanded: IconDefinition;
    iconCollapsed: IconDefinition;
    isFolder: boolean;
    expanded: boolean;
    textClass: string;
    children: FileTreeNode<T>[] = [];
    data: T;
}

class ChildIndex<T extends IChangedFile> {

    private data = new Map<FileTreeNode<T>, Map<string, FileTreeNode<T>>>();

    set(node: FileTreeNode<T>, child: FileTreeNode<T>) {
        return this.getSubIndex(node).set(child.label, child);
    }

    get(node: FileTreeNode<T>, childLabel: string): FileTreeNode<T> {
        return this.getSubIndex(node).get(childLabel);
    }

    private getSubIndex(node: FileTreeNode<T>): Map<string, FileTreeNode<T>> {
        let subIndex = this.data.get(node);
        if (subIndex) {
            return subIndex;
        }
        subIndex = new Map<string, FileTreeNode<T>>();
        this.data.set(node, subIndex);
        return subIndex;
    }
}
