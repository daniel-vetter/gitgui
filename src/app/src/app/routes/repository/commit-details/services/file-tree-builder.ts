import { ChangedFile } from "../../../../services/git/commit-details-reader";

export class FileTreeBuilder {
    getTree(changedFiles: ChangedFile[]): ChangedFileTreeNodeModel[] {
        const root = this.createBaseTree(changedFiles);
        this.orderChildren(root);
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
        node.children.sort((a, b) => {
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

        node.isFolder = node.children.length > 0;

        for (const child of node.children) {
            this.orderChildren(child);
        }
    }
}

export class ChangedFileTreeNodeModel {
    label: string = "";
    isFolder: boolean;
    expanded: boolean;
    children: ChangedFileTreeNodeModel[] = [];
}

