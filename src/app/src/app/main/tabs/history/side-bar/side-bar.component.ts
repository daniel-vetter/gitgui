import { Component, Input, OnChanges } from "@angular/core";
import { Repository, RepositoryHeadRef, RepositoryTagRef, RepositoryRemoteRef, RepositoryRef } from "../../../../model/model";
import { ITreeViewAdapter } from "../../../../shared/tree-view/tree-view.component";

@Component({
    selector: "side-bar",
    templateUrl: "./side-bar.component.html",
    styleUrls: ["./side-bar.component.scss"]
})
export class SideBarComponent implements OnChanges {
    @Input() repository: Repository;

    filter: string = "";
    nodes: RefNode[];
    branchNodeAdapter = new BranchNodeAdapter();

    ngOnChanges() {
        this.update();
    }

    onFilterChanged() {
        this.update();
    }

    private update() {
        if (!this.repository)
            return;
        const matchingRefs = this.repository.refs.filter(x => x.shortName.toLowerCase().indexOf(this.filter.toLowerCase()) !== -1);
        this.nodes = [
            this.mapRefs("Local branches", "call_split", true, matchingRefs.filter(x => x instanceof RepositoryHeadRef)),
            this.mapRefs("Remote branches", "call_split", this.filter !== "", matchingRefs.filter(x => x instanceof RepositoryRemoteRef)),
            this.mapRefs("Tags", "label_outline", this.filter !== "", matchingRefs.filter(x => x instanceof RepositoryTagRef))
        ].filter(x => x.children.length > 0);
    }

    private mapRefs(name: string, icon: string, expanded: boolean, refs: RepositoryRef[]): RefNode {
        const index = new ChildIndex();
        const root = new RefNode();
        root.name = name;
        root.expanded = expanded;
        for (const ref of refs) {
            const parts = ref.shortName.split("/");
            let curNode = root;
            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                let childNode = index.get(curNode, part);
                if (!childNode) {
                    childNode = new RefNode();
                    childNode.name = part;
                    childNode.expanded = true;
                    if (i === parts.length - 1) {
                        childNode.ref = ref;
                    }
                    curNode.children.push(childNode);
                    index.set(curNode, childNode);
                }
                curNode = childNode;
            }
        }

        const traverse = (x: RefNode) => {
            if (x.children.length > 0) {
                x.iconExpanded = "keyboard_arrow_down";
                x.iconCollapsed = "keyboard_arrow_right";
            } else {
                x.iconCollapsed = icon;
                x.iconExpanded = icon;
            }
            for (const child of x.children) {
                traverse(child);
            }
        };
        traverse(root);

        return root;
    }
}


class RefNode {
    name: string;
    expanded: boolean;
    iconCollapsed: string;
    iconExpanded: string;
    ref: RepositoryRef;
    children: RefNode[] = [];
}

class BranchNodeAdapter implements ITreeViewAdapter<RefNode> {
    hasChildren(data: RefNode): boolean {
        return data.children.length > 0;
    }
    getChildren(data: RefNode): RefNode[] {
        return data.children;
    }
    getExpandedState(data: RefNode): boolean {
        return data.expanded;
    }
    setExpandedState(data: RefNode, expanded: boolean): void {
        data.expanded = expanded;
    }
}

class ChildIndex {

    private data = new Map<RefNode, Map<string, RefNode>>();

    set(node: RefNode, child: RefNode) {
        return this.getSubIndex(node).set(child.name, child);
    }

    get(node: RefNode, childLabel: string): RefNode {
        return this.getSubIndex(node).get(childLabel);
    }

    private getSubIndex(node: RefNode): Map<string, RefNode> {
        let subIndex = this.data.get(node);
        if (subIndex) {
            return subIndex;
        }
        subIndex = new Map<string, RefNode>();
        this.data.set(node, subIndex);
        return subIndex;
    }
}
