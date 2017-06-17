import { EventEmitter, Injectable } from "@angular/core";
import * as Rx from "rxjs";

@Injectable()
export class TabManager {

    private _allTabs: Tab[] = [];
    private _selectedTab: Tab | undefined;

    onSelectedTabChanged = new Rx.Subject<Tab>();
    onTabListChanged = new Rx.Subject<Tab[]>();
    onTabChanged = new Rx.Subject<Tab>();

    createNewTab(tab: Tab) {
        tab.ui.onDetailsChange = (x) => { this.onTabChanged.next(x); };
        this._allTabs.push(tab);
        this.onTabListChanged.next(this.allTabs);
        this.selectedTab = tab;
    }

    closeAllTabs() {
        while (this._allTabs.length > 0)
            this.closeTab(this._allTabs[0]);
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
        tab.ui.onDetailsChange = undefined;
        this._allTabs.splice(index, 1);
        this.onTabListChanged.next(this.allTabs);
    }

    get allTabs(): Tab[] {
        return Array.from(this._allTabs);
    }

    get selectedTab(): Tab | undefined {
        if (this._selectedTab)
            return this._selectedTab;
        return undefined;
    }

    set selectedTab(tab: Tab | undefined) {
        if (this._selectedTab === tab)
            return;
        if (tab !== undefined && this._allTabs.indexOf(tab) === -1)
            throw new Error("The given tab can not be selected because its not part of the tab list.");

        const oldSelectedTab = this._selectedTab;
        this._selectedTab = tab;
        this.onSelectedTabChanged.next(this._selectedTab);

        if (oldSelectedTab && !oldSelectedTab.ui.isPersistent) {
            this._allTabs.splice(this._allTabs.indexOf(oldSelectedTab), 1);
            this.onTabListChanged.next(this.allTabs);
        }
    }
}

export abstract class Tab {
    ui = new TabUi(this);
    abstract get key(): string;
}

export class TabUi {

    constructor(private tab: Tab) {}

    onDetailsChange: ((tabContainer: Tab) => void) | undefined;
    private _title = "";
    private _isCloseable = true;
    private _isPersistent = true;

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
            this.onDetailsChange(this.tab);
    }
}
