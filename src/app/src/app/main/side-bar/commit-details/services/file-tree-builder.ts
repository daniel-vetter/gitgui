import { IconDefinition, FileIconManager } from "../../../../services/file-icon/file-icon";
import { Injectable } from "@angular/core";
import { Path } from "../../../../services/path";
import { FileChangeType, IChangedFile } from "../../../../model/model";

/**
 * Builds a tree of IFileTreeNode objects from a flat list of files.
 */
@Injectable()
export class FileTreeBuilder {

    constructor(private fileIconManager: FileIconManager) { }

    getTree<TSource extends IChangedFile, TTarget extends IFileTreeNode<TSource, TTarget>>
            (changedFiles: TSource[], targetFactory: () => TTarget): TTarget[] {
        const root = this.createBaseTree<TSource, TTarget>(changedFiles, targetFactory);
        this.combineFolderWithOneParent(root);
        this.orderChildren(root);
        this.addMetadata(root);
        return root.children;
    }

    private createBaseTree<TSource extends IChangedFile, TTarget extends IFileTreeNode<TSource, TTarget>>
                          (changedFiles: TSource[], targetFactory: () => TTarget): TTarget {
        const targetFactoryEx = () => {
            const newObj = targetFactory();
            newObj.label = "";
            newObj.children = [];
            return newObj;
        };
        const index = new ChildIndex();
        const root = targetFactoryEx();
        for (const change of changedFiles) {
            const parts = change.path.split("/");
            let curNode = root;
            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                let childNode = index.get(curNode, part);
                if (!childNode) {
                    childNode = targetFactoryEx();
                    childNode.label = part;
                    childNode.expanded = true;
                    if (i === parts.length - 1) {
                        if (change.type === FileChangeType.Added) childNode.textClass = "entryAdd";
                        else if (change.type === FileChangeType.Deleted) childNode.textClass = "entryRemove";
                        else childNode.textClass = "entryChange";
                        childNode.data = change;
                    }
                    curNode.children.push(<TTarget>childNode);
                    index.set(curNode, childNode);
                }
                curNode = <TTarget>childNode;
            }
        }
        return root;
    }

    private orderChildren<TSource extends IChangedFile, TTarget extends IFileTreeNode<TSource, TTarget>>
                         (node: IFileTreeNode<TSource, TTarget>) {
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

    private combineFolderWithOneParent<TSource extends IChangedFile, TTarget extends IFileTreeNode<TSource, TTarget>>
                                      (root: IFileTreeNode<TSource, TTarget>) {
        for (const child of root.children) {
            this.forEachNode(child, x => {
                while (x.children.length === 1 && x.children[0].children.length !== 0) {
                    x.label = Path.combine(x.label, x.children[0].label);
                    x.children = x.children[0].children;
                }
            });
        }
    }

    private addMetadata<TSource extends IChangedFile, TTarget extends IFileTreeNode<TSource, TTarget>>
                       (node: IFileTreeNode<TSource, TTarget>) {
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

    private forEachNode<TSource extends IChangedFile, TTarget extends IFileTreeNode<TSource, TTarget>>
                       (node: IFileTreeNode<TSource, TTarget>, action: (node: IFileTreeNode<TSource, TTarget>) => void) {
        action(node);
        for (const child of node.children) {
            this.forEachNode(child, action);
        }
    }
}

export interface IFileTreeNode<TSource extends IChangedFile, TTarget extends IFileTreeNode<TSource, TTarget>> {
    label: string;
    iconExpanded: IconDefinition;
    iconCollapsed: IconDefinition;
    isFolder: boolean;
    expanded: boolean;
    textClass: string;
    children: TTarget[];
    data: TSource;
}

class ChildIndex<TSource extends IChangedFile, TTarget extends IFileTreeNode<TSource, TTarget>> {

    private data = new Map<IFileTreeNode<TSource, TTarget>, Map<string, IFileTreeNode<TSource, TTarget>>>();

    set(node: IFileTreeNode<TSource, TTarget>, child: IFileTreeNode<TSource, TTarget>) {
        return this.getSubIndex(node).set(child.label, child);
    }

    get(node: IFileTreeNode<TSource, TTarget>, childLabel: string): IFileTreeNode<TSource, TTarget> {
        return this.getSubIndex(node).get(childLabel);
    }

    private getSubIndex(node: IFileTreeNode<TSource, TTarget>): Map<string, IFileTreeNode<TSource, TTarget>> {
        let subIndex = this.data.get(node);
        if (subIndex) {
            return subIndex;
        }
        subIndex = new Map<string, IFileTreeNode<TSource, TTarget>>();
        this.data.set(node, subIndex);
        return subIndex;
    }
}
