import { Component, Input, OnChanges, TemplateRef, ContentChild,
         ViewChild, EventEmitter, Output, QueryList, ElementRef } from "@angular/core";

import { TreeLineList, TreeLine } from "./tree-line-list";
import { ReusePool, PoolableViewModel } from "../../main/tabs//history/commit-history/services/reuse-pool";

@Component({
    selector: "tree-view",
    templateUrl: "./tree-view.component.html",
    styleUrls: ["./tree-view.component.scss"]
})
export class TreeViewComponent implements OnChanges {
    @Input() adapter: ITreeViewAdapter<any>;
    @Input() data: any[] = [];
    @Input() lineHeight = 20;
    @Input() selectedItem: any = undefined;
    @Output() selectedItemChange = new EventEmitter<any>();
    @Output() itemClick = new EventEmitter<any>();
    @Output() itemMouseDown = new EventEmitter<any>();
    @Output() itemMouseUp = new EventEmitter<any>();
    @ContentChild(TemplateRef) templateRef: TemplateRef<any>;
    @ViewChild("scrollWrapper") scrollWrapper: ElementRef;

    private treeLineList: TreeLineList;
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
        this.selectedItem = vm.data.data;
        this.selectedItemChange.emit(vm.data.data);
        this.itemMouseDown.emit(vm.data.data);
        this.treeLineList.toggleExpandState(vm.data);
        this.updateVisibleLines();
    }

    onMouseUp(vm: TreeLineViewModel) {
        this.itemMouseUp.emit(vm.data.data);
    }

    onKeyDown(event: KeyboardEvent) {
        let move = 0;
        if (event.keyCode === 40) move = 1;
        if (event.keyCode === 38) move = -1;
        if (event.keyCode === 33) move = -Math.floor(this.scrollWrapper.nativeElement.clientHeight / this.lineHeight);
        if (event.keyCode === 34) move = Math.floor(this.scrollWrapper.nativeElement.clientHeight / this.lineHeight);
        if (move === 0)
            return undefined;

        const curIndex = this.treeLineList.items.findIndex(x => x.data === this.selectedItem);
        const newIndex = Math.min(Math.max(0, curIndex + move), this.treeLineList.items.length - 1);
        this.selectedItem = this.treeLineList.items[newIndex].data;
        this.selectedItemChange.emit(this.selectedItem);
        this.updateVisibleLines();
        return false;
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
        this.hasChildren = false;
        this.isExpanded = false;
        this.paddingLeft = 0;
        this.top = 0;
    }
}

export interface ITreeViewAdapter<TModel> {
    hasChildren(data: TModel): boolean;
    getChildren(data: TModel): TModel[];
    getExpandedState(data: TModel): boolean;
    setExpandedState(data: TModel, expanded: boolean): void;
    indentChildren(data: TModel): boolean;
}
