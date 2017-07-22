import { Component, OnInit } from "@angular/core";
import { TabManager, Tab } from "../../services/tab-manager";

@Component({
    selector: "tab-content",
    templateUrl: "./tab-content.component.html",
    styleUrls: ["./tab-content.component.scss"]
})
export class TabContentComponent implements OnInit {

    tabs: TabViewModel[] = [];

    constructor(private tabManager: TabManager) { }

    ngOnInit() {
        this.tabManager.onSelectedTabChanged.subscribe(() => { this.update(); });
        this.update();
    }

    private update() {
        const tabs = this.tabManager.allTabs;
        const tabsToRemove = this.tabs.filter(x => tabs.indexOf(x.data) === -1);
        const tabsToAdd = tabs.filter(x => this.tabs.map(y => y.data).indexOf(x) === -1);

        this.optimizeTabCreationAndRemoval(tabsToRemove, tabsToAdd);

        for (const toRemove of tabsToRemove) {
            const index = this.tabs.indexOf(toRemove);
            this.tabs.splice(index, 1);
        }

        for (const toAdd of tabsToAdd) {
            const vm = new TabViewModel();
            vm.data = toAdd;
            vm.type = toAdd.key;
            this.tabs.push(vm);
        }

        for (const vm of this.tabs) {
            vm.visible = vm.data === this.tabManager.selectedTab;
        }
    }

    private optimizeTabCreationAndRemoval(tabsToRemove: TabViewModel[], tabsToAdd: Tab[]) {
        // Optimization: if a new tab should be displayed and a tab of the same type should be
        // removed (happens often with temporary tabs) -> move the data from the old to
        // the new tab. This prevents the creation of a new sub component which could result
        // in flickering.

        const toCleanUp: Tab[] = [];

        for (const tab of tabsToAdd) {
            const removedWithSameTypeIndex = tabsToRemove.findIndex(y => y.type === tab.key);
            if (removedWithSameTypeIndex !== -1) {
                tabsToRemove[removedWithSameTypeIndex].data = tab;
                tabsToRemove.splice(removedWithSameTypeIndex, 1);
                toCleanUp.push(tab);
            }
        }

        for (const toClean of toCleanUp) {
            tabsToAdd.splice(tabsToAdd.indexOf(toClean), 1);
        }
    }
}

export class TabViewModel {
    visible: boolean;
    data: Tab;
    type: string;
}
