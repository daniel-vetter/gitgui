import { Component, Input, OnChanges, TemplateRef, ContentChild, ViewChild, EventEmitter, Output } from "@angular/core";

import { TreeLineList, TreeLine } from "./tree-line-list";
import { ReusePool, PoolableViewModel } from "../../main/tabs//history/commit-history/services/reuse-pool";

@Component({
    selector: "tree-view",
    templateUrl: "./tree-view.component.html",
    styleUrls: ["./tree-view.component.scss"]
})
export class TreeViewComponent implements OnChanges {
    @Input() adapter: ITreeViewAdapter<any> = undefined;
    @Input() data: any[] = [];
    @Input() lineHeight: number = 20;
    @Input() selectedItem: any = undefined;
    @Output() selectedItemChange = new EventEmitter<any>();
    @Output() itemClick = new EventEmitter<any>();
    @Output() itemMouseDown = new EventEmitter<any>();
    @Output() itemMouseUp = new EventEmitter<any>();
    @ContentChild(TemplateRef) templateRef: TemplateRef<any>;
    @ViewChild("scrollWrapper") scrollWrapper;

    private treeLineList = new TreeLineList([], undefined);
    visibleTreeLines = new ReusePool<TreeLine, TreeLineViewModel>(() => new TreeLineViewModel());
    totalScrollHeight: number;

    ngOnChanges() {
        this.updateLines();
        this.updateVisibleLines();
    }

    private updateLines() {
        this.treeLineList = new TreeLineList(this.data, this.adapter);
    }

    onExpanderClicked(vm: TreeLineViewModel) {
        this.itemClick.emit(vm.data.data);
    }

    onMouseDown(vm: TreeLineViewModel) {
        if (vm.data.isSelectable) {
            this.selectedItem = vm.data.data;
            this.selectedItemChange.emit(vm.data.data);
        }
        this.itemMouseDown.emit(vm.data.data);
        this.treeLineList.toggleExpandState(vm.data);
        this.updateVisibleLines();
    }

    onMouseUp(vm: TreeLineViewModel) {
        this.itemMouseUp.emit(vm.data.data);
    }

    private updateVisibleLines() {

        const visibleStart = Math.max(0, Math.floor(this.scrollWrapper.nativeElement.scrollTop / this.lineHeight));
        const visibleEnd = Math.floor(visibleStart + this.scrollWrapper.nativeElement.clientHeight / this.lineHeight) + 1;

        this.visibleTreeLines.remapRange(this.treeLineList.items, visibleStart, visibleEnd, (from, to) => {
            to.hasChildren = from.hasChildren;
            to.isExpanded = from.isExpanded;
            to.paddingLeft = from.depth * 20;
            to.top = from.index * this.lineHeight;
            to.isSelected = this.selectedItem === from.data;
            return true;
        });

        this.totalScrollHeight = this.lineHeight * this.treeLineList.items.length;
    }

    onScroll() {
        this.updateVisibleLines();
    }
}

export class TreeLineViewModel implements PoolableViewModel<TreeLine> {
    data: TreeLine;
    visible: boolean;
    top: number;
    paddingLeft: number;
    isExpanded: boolean;
    isSelected: boolean;
    hasChildren: boolean;
    clear() {
        this.hasChildren = undefined;
        this.isExpanded = undefined;
        this.paddingLeft = undefined;
        this.top = undefined;
    }
}

export interface ITreeViewAdapter<TModel> {
    hasChildren(data: TModel): boolean;
    getChildren(data: TModel): TModel[];
    getExpandedState(data: TModel): boolean;
    setExpandedState(data: TModel, expanded: boolean): void;
    isSelectable(data: TModel): boolean;
}
