import { ChangedFile } from "../../../../services/git/commit-details-reader";

export class FileTreeBuilder {
    getTree(changedFiles: ChangedFile[]): ChangedFileTreeNodeModel[] {
        const root = this.createBaseTree(changedFiles);
        this.combineFolderWithOneParent(root);
        this.orderChildren(root);
        this.addMetadata(root);
        return root.children;
    }

    private createBaseTree(changedFiles: ChangedFile[]): ChangedFileTreeNodeModel {
        const root = new ChangedFileTreeNodeModel();
        for (const change of changedFiles) {
            const parts = change.path.split("/");
            let curNode = root;
            for (const part of parts) {
                let childNode = curNode.children.find(y => y.label === part);
                if (!childNode) {
                    childNode = new ChangedFileTreeNodeModel();
                    childNode.label = part;
                    childNode.expanded = true;
                    curNode.children.push(childNode);
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
                    x.label += "/" + x.children[0].label;
                    x.children = x.children[0].children;
                }
            });
        }
    }

    private addMetadata(node: ChangedFileTreeNodeModel) {
        this.forEachNode(node, x => {
            x.isFolder = x.children.length > 0;
            if (x.isFolder) {
                x.iconExpanded = "folder_open";
                x.iconCollapsed = "folder";
            } else {
                x.iconExpanded = "insert_drive_file";
                x.iconCollapsed = "insert_drive_file";
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
    iconExpanded: string = "";
    iconCollapsed: string = "";
    isFolder: boolean;
    expanded: boolean;
    children: ChangedFileTreeNodeModel[] = [];
}

