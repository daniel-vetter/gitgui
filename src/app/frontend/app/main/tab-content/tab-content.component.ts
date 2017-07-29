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

    tabViewModels: TabViewModel[] = [];

    constructor(private tabManager: TabManager) { }

    ngOnInit() {
        this.tabManager.onTabListChanged.subscribe(() => { this.update() });
        this.tabManager.onSelectedTabChanged.subscribe(() => { this.update(); });
        this.update();
    }

    private update() {
        const allTabs = this.tabManager.allTabPages;

        // remove all tab view models for tabs that are no longer register in the tab manager
        const tabsToRemove: TabViewModel[] = [];
        for (const tabViewModel of this.tabViewModels) {
            if (allTabs.indexOf(tabViewModel.page) === -1)
                tabsToRemove.push(tabViewModel);
        }

        for (const tabViewModel of tabsToRemove) {
            this.tabViewModels.splice(this.tabViewModels.indexOf(tabViewModel), 1);
        }

        this.tabViewModels.forEach(x => x.visible = false);
        const selectedTab = this.tabManager.selectedTab;

        // if no tab is selected we are done
        if (selectedTab === undefined)
            return;

        // find the view model of the selected tab
        const selectedTabViewModel = this.tabViewModels.find(x => x.page === selectedTab);

        if (selectedTabViewModel) {
            // if we found one, make it visible and exit
            selectedTabViewModel.visible = true;
            return;
        }

        const newViewModel = new TabViewModel();
        newViewModel.visible = true;
        newViewModel.page = selectedTab;
        newViewModel.data = selectedTab.data;
        newViewModel.componentType = getTabComponentType(selectedTab.data);
        this.tabViewModels.push(newViewModel);
    }
}

export class TabViewModel {
    visible: boolean;
    page: TabPage;
    data: TabData;
    componentType: any;
}
