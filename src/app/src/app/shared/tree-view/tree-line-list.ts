import { ITreeViewAdapter } from "./tree-view.component";

export class TreeLineList {

    items: TreeLine[];

    constructor(private data: any[], private adapter: ITreeViewAdapter<any>) {
        this.update();
    }

    private update() {
        this.items = [];
        if (this.adapter === undefined || this.data === undefined) {
            return;
        }

        for (const data of this.data) {
            const newLine = this.getLineFromData(data);
            this.items.push(newLine);
            this.applyExpandState(newLine);
        }
        this.reIndexLines();
    }

    public toggleExpandState(treeLine: TreeLine) {
        const newState = !this.adapter.getExpandedState(treeLine.data);
        this.adapter.setExpandedState(treeLine.data, newState);
        this.applyExpandState(treeLine, newState);
        this.reIndexLines();
    }

    private applyExpandState(vm: TreeLine, currentState: boolean = undefined) {
        if (currentState === undefined)
            currentState = this.adapter.getExpandedState(vm.data);
        vm.isExpanded = currentState;
        if (currentState) {
            const lineIndex = this.items.indexOf(vm);
            const children = this.adapter.getChildren(vm.data);
            if (children) {
                for (let i = children.length - 1; i >= 0; i--) {
                    const newLine = this.getLineFromData(children[i], vm);
                    this.items.splice(lineIndex + 1, 0, newLine);
                    this.applyExpandState(newLine);
                }
            }
        } else {
            const lineIndex = this.items.indexOf(vm);
            while (lineIndex < this.items.length - 1 && this.items[lineIndex + 1].depth > vm.depth) {
                this.items.splice(lineIndex + 1, 1);
            }
        }
    }

    private getLineFromData(data: any, parent: TreeLine = undefined): TreeLine {
        const line = new TreeLine();
        line.data = data;
        line.hasChildren = this.adapter.hasChildren(data);
        line.indentChildren = this.adapter.indentChildren(data);
        line.depth = 0;
        if (parent) {
            line.depth = parent.depth + (parent.indentChildren ? 1 : 0);
        }
        return line;
    }

    private reIndexLines() {
        for (let i = 0; i < this.items.length; i++) {
            this.items[i].index = i;
        }
    }
}

export class TreeLine {
    data: any;
    hasChildren: boolean;
    depth: number;
    indentChildren: boolean;
    index: number;
    isExpanded: boolean;
}
