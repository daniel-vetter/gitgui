import { Component, Input, OnChanges, TemplateRef, ContentChild } from "@angular/core";

@Component({
    selector: "tree-view",
    templateUrl: "./tree-view.component.html",
    styleUrls: ["./tree-view.component.scss"]
})
export class TreeViewComponent implements OnChanges {
    @Input() adapter: ITreeViewAdapter<any> = undefined;
    @Input() data: any[] = [];
    @ContentChild(TemplateRef) templateRef: TemplateRef<any>;

    treeLines: TreeLineViewModel[] = [];

    ngOnChanges() {
        this.updateLines();
    }

    private updateLines() {
        this.treeLines = [];
        if (this.adapter === undefined || this.data === undefined) {
            return;
        }

        for (const data of this.data) {
            const newLine = this.getLineFromData(data);
            this.treeLines.push(newLine);
            this.applyExpandState(newLine);
        }
    }

    onExpanderClicked(vm: TreeLineViewModel) {
        const newState = !this.adapter.getExpandedState(vm.data);
        this.adapter.setExpandedState(vm.data, newState);
        this.applyExpandState(vm, newState);
    }

    private applyExpandState(vm: TreeLineViewModel, currentState: boolean = undefined) {
        if (currentState === undefined)
            currentState = this.adapter.getExpandedState(vm.data);
        if (currentState) {
            const lineIndex = this.treeLines.indexOf(vm);
            const children = Array.from(this.adapter.getChildren(vm.data)).reverse();
            for (const child of children) {
                const newLine = this.getLineFromData(child, vm);
                this.treeLines.splice(lineIndex + 1, 0, newLine);
                this.applyExpandState(newLine);
            }
        } else {
            const lineIndex = this.treeLines.indexOf(vm);
            while (lineIndex < this.treeLines.length - 1 && this.treeLines[lineIndex + 1].depth > vm.depth) {
                this.treeLines.splice(lineIndex + 1, 1);
            }
        }
    }

    private getLineFromData(data: any, parent: TreeLineViewModel = undefined): TreeLineViewModel {
        const line = new TreeLineViewModel();
        line.data = data;
        line.hasChildren = this.adapter.hasChildren(data);
        line.depth = 0;
        if (parent) {
            line.depth = parent.depth + 1;
        }
        return line;
    }
}

export class TreeLineViewModel {
    data: any;
    hasChildren: boolean;
    depth: number;
    get paddingLeft() { return this.depth * 15; }
}

export interface ITreeViewAdapter<TModel> {
    hasChildren(data: TModel): boolean;
    getChildren(data: TModel): TModel[];
    getExpandedState(data: TModel): boolean;
    setExpandedState(data: TModel, expanded: boolean): void;
}
