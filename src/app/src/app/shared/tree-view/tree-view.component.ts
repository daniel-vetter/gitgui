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
        if (this.adapter === undefined || this.data === undefined) {
            this.treeLines = [];
            return;
        }

        for (const data of this.data) {
            this.treeLines.push(this.getLineFromData(data));
        }
    }

    onExpanderClicked(vm: TreeLineViewModel) {
        if (vm.isExpanded === false) {
            vm.isExpanded = true;
            const lineIndex = this.treeLines.indexOf(vm);
            const children = this.adapter.getChildren(vm.data);
            children.reverse();
            for (const child of children) {
                this.treeLines.splice(lineIndex + 1, 0, this.getLineFromData(child, vm));
            }
        } else {
            vm.isExpanded = false;
            const lineIndex = this.treeLines.indexOf(vm);
            while (this.treeLines[lineIndex + 1].depth > vm.depth) {
                this.treeLines.splice(lineIndex + 1, 1);
            }
        }
    }

    private getLineFromData(data: any, parent: TreeLineViewModel = undefined): TreeLineViewModel {
        const line = new TreeLineViewModel();
        line.data = data;
        line.hasChildren = this.adapter.hasChildren(data);
        line.depth = 0;
        line.isExpanded = false;

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
    isExpanded: boolean;
    get paddingLeft() { return this.depth * 20; }
}

export interface ITreeViewAdapter<TModel> {
    hasChildren(data: TModel): boolean;
    getChildren(data: TModel): TModel[];
}
