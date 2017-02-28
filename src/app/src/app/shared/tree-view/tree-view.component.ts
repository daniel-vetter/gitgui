import { Component, Input, OnChanges } from "@angular/core";

@Component({
    selector: "tree-view",
    templateUrl: "./tree-view.component.html"
})
export class TreeViewComponent implements OnChanges {
    @Input() adapter: ITreeViewAdapter<any> = undefined;
    @Input() data: any[] = [];

    treeLines: TreeLineViewModel[] = [];

    ngOnChanges() {
        this.updateLines();
    }

    private updateLines() {
        if (this.adapter === undefined || this.data === undefined) {
            this.treeLines = [];
            return;
        }

        for (const dataElement of this.data) {
            const viewModel = new TreeLineViewModel();
            viewModel.data = dataElement;
            viewModel.hasChildren = this.adapter.hasChildren(dataElement);
            viewModel.depth = 0;
            this.treeLines.push(viewModel);
        }

        console.log(this.treeLines);
    }
}

export class TreeLineViewModel {
    data: any;
    hasChildren: boolean;
    depth: number;
}

export interface ITreeViewAdapter<TModel> {
    hasChildren(data: TModel): boolean;
    getChildren(data: TModel): TModel[];
}