import { Component, OnInit } from "@angular/core";
import { FileContentDiffTabComponent } from "../tabs/file-content-tabs/file-content-diff-tab/file-content-diff-tab.component";
import { RepositoryComponent } from "../repository.component";
import { HistoryTabComponent } from "../tabs/history/history-tab.component";
import { FileContentTabComponent } from "../tabs/file-content-tabs/file-content-tab/file-content-tab.component";
import { TabManager, TabPage } from "app/services/tabs/tab-manager";
import { getTabComponentType } from "app/main/tabs/tab-to-component-mapping";
import { TabData } from "app/main/tabs/tabs";

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
        const tabs = this.tabManager.allTabPages;
        const tabsToRemove = this.tabs.filter(x => tabs.indexOf(x.page) === -1);
        const tabsToAdd = tabs.filter(x => this.tabs.map(y => y.page).indexOf(x) === -1);

        this.optimizeTabCreationAndRemoval(tabsToRemove, tabsToAdd);

        for (const toRemove of tabsToRemove) {
            const index = this.tabs.indexOf(toRemove);
            this.tabs.splice(index, 1);
        }

        for (const toAdd of tabsToAdd) {
            const vm = new TabViewModel();
            vm.data = toAdd.data;
            vm.page = toAdd;
            vm.componentType = getTabComponentType(toAdd.data);
            this.tabs.push(vm);
        }

        for (const vm of this.tabs) {
            vm.visible = vm.data === (this.tabManager.selectedTab && this.tabManager.selectedTab.data);
        }
    }

    private optimizeTabCreationAndRemoval(tabsToRemove: TabViewModel[], tabsToAdd: TabPage[]) {
        // Optimization: if a new tab should be displayed and a tab of the same type should be
        // removed (happens often with temporary tabs) -> move the data from the old to
        // the new tab. This prevents the creation of a new sub component which could result
        // in flickering.

        const toCleanUp: TabPage[] = [];

        for (const tab of tabsToAdd) {
            const removedWithSameTypeIndex = tabsToRemove.findIndex(y => y.type === tab.data.type);
            if (removedWithSameTypeIndex !== -1) {
                tabsToRemove[removedWithSameTypeIndex].data = tab.data;
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
    page: TabPage;
    data: TabData;
    type: string;
    componentType: any;
}
