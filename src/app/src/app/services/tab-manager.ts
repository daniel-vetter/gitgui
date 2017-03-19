import { EventEmitter, Injectable } from "@angular/core";

@Injectable()
export class TabManager {

    private _allTabs: Tab[] = [];
    private _selectedTab: Tab;

    onSelectedTabChanged = new EventEmitter<Tab>();
    onTabListChanged = new EventEmitter<Tab[]>();
    onTabChanged = new EventEmitter<Tab>();

    createNewTab(tab: Tab) {

        let tempTab;
        while ((tempTab = this._allTabs.find(x => !x.ui.isPersistent)) !== undefined) {
            this.closeTab(tempTab);
        }

        tab.ui.onDetailsChange = (x) => { this.onTabChanged.emit(x); };
        this._allTabs.push(tab);
        this.onTabListChanged.emit(this.allTabs);
        this.selectedTab = tab;
    }

    closeAllTabs() {
        this.selectedTab = undefined;
        this._allTabs = [];
        this.onTabListChanged.emit(this.allTabs);
    }

    closeTab(tab: Tab) {
        const index = this._allTabs.indexOf(tab);
        if (index === -1)
            throw new Error("The given tab can not be removed because its not part of the tab list.");
        if (this._selectedTab === tab) {
            let newIndex = index;
            if (index > this._allTabs.length - 1)
                newIndex--;
            if (this._allTabs[index] === tab)
                newIndex--;
            this.selectedTab = this._allTabs[newIndex];
        }
        this._allTabs.splice(index, 1);
        this.onTabListChanged.emit(this.allTabs);
    }

    get allTabs(): Tab[] {
        return Array.from(this._allTabs);
    }

    get selectedTab(): Tab {
        if (this._selectedTab)
            return this._selectedTab;
        return undefined;
    }

    set selectedTab(tab: Tab) {
        if (this._allTabs.indexOf(tab) === -1 && tab !== undefined)
            throw new Error("The given tab can not be selected because its not part of the tab list.");
        this._selectedTab = tab;
        this.onSelectedTabChanged.emit(this.selectedTab);
    }
}

export abstract class Tab {
    ui = new TabUi();
    abstract get key();
}

export class TabUi {

    onDetailsChange: (TabContainer) => void;
    private _title = "";
    private _isCloseable = true;
    private _isPersistent = false;

    get title(): string {
        return this._title;
    }

    set title(value: string) {
        this._title = value;
        this.raiseChangeEvent();
    }

    get isCloseable(): boolean {
        return this._isCloseable;
    }

    set isCloseable(value: boolean) {
        this._isCloseable = value;
        this.raiseChangeEvent();
    }

    get isPersistent(): boolean {
        return this._isPersistent;
    }

    set isPersistent(value: boolean) {
        this._isPersistent = value;
        this.raiseChangeEvent();
    }

    private raiseChangeEvent() {
        if (this.onDetailsChange)
            this.onDetailsChange(this);
    }
}
