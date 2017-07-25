import { EventEmitter, Injectable } from "@angular/core";
import * as Rx from "rxjs";
import { TabData } from "app/main/tabs/tabs";

@Injectable()
export class TabManager {

    private _allTabs: TabPage[] = [];
    private _selectedTab: TabPage | undefined;

    onSelectedTabChanged = new Rx.Subject<TabPage>();
    onTabListChanged = new Rx.Subject<TabPage[]>();
    onTabChanged = new Rx.Subject<TabPage>();

    createNewTab(tab: TabData): TabPage {
        return this.createTabInternal(tab, x => {});
    }

    createNewTempTab(tab: TabData): TabPage {
        return this.createTabInternal(tab, x => {
            x.isPersistent = false;
        });
    }

    private createTabInternal(tab: TabData, configure: (page: TabPage) => void): TabPage {
        const tabPage = new TabPage(tab, x => this.onTabDetailsChanged(x));
        configure(tabPage);
        this._allTabs.push(tabPage);
        this.onTabListChanged.next(this.allTabPages);
        this.selectedTab = tabPage;
        return tabPage;
    }

    closeAllTabs() {
        while (this._allTabs.length > 0)
            this.closeTab(this._allTabs[0]);
    }

    private onTabDetailsChanged(tabPage: TabPage) {
        if (this._allTabs.indexOf(tabPage) !== -1)
            this.onTabChanged.next(tabPage);
    }

    private getTabPageFromData(tab: TabData | TabPage): TabPage {
        if (tab instanceof TabPage) {
            return tab;
        } else {
            const tabItem = this._allTabs.find(x => x.data === tab);
            if (!tabItem)
                throw new Error("could not find tab item to tab: " + tab);
            return tabItem;
        }
    }

    closeTab(tab: TabData | TabPage) {
        tab = this.getTabPageFromData(tab);
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
        this.onTabListChanged.next(this.allTabPages);
    }

    get allTabPages(): TabPage[] {
        return Array.from(this._allTabs);
    }

    get selectedTab(): TabPage | undefined {
        if (this._selectedTab)
            return this._selectedTab;
        return undefined;
    }

    set selectedTab(tab: TabPage | undefined) {
        if (this._selectedTab === tab)
            return;
        if (tab !== undefined && this._allTabs.indexOf(tab) === -1)
            throw new Error("The given tab can not be selected because its not part of the tab list.");

        const oldSelectedTab = this._selectedTab;
        this._selectedTab = tab;
        this.onSelectedTabChanged.next(this._selectedTab);

        if (oldSelectedTab && !oldSelectedTab.isPersistent) {
            this._allTabs.splice(this._allTabs.indexOf(oldSelectedTab), 1);
            this.onTabListChanged.next(this.allTabPages);
        }
    }
}

export class TabPage {

    private onDetailsChange: (tabPage: TabPage) => void;
    private _title = "";
    private _isCloseable = true;
    private _isPersistent = true;

    constructor(private _tabData: TabData, private onDetailsChanged: (tabPage: TabPage) => void) {
    }

    get data(): TabData {
        return this._tabData;
    }

    get title(): string {
        return this._title;
    }

    set title(value: string) {
        this._title = value;
        this.onDetailsChanged(this);
    }

    get isCloseable(): boolean {
        return this._isCloseable;
    }

    set isCloseable(value: boolean) {
        this._isCloseable = value;
        this.onDetailsChanged(this);
    }

    get isPersistent(): boolean {
        return this._isPersistent;
    }

    set isPersistent(value: boolean) {
        this._isPersistent = value;
        this.onDetailsChanged(this);
    }
}
