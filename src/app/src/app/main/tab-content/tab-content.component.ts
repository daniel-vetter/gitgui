import { Component, OnInit } from "@angular/core";
import { TabManager, Tab } from "../../services/tab-manager";
import { HistoryTab, FileChangeTab } from "../tabs/tabs";

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
        const missingTabs = tabs.filter(x => this.tabs.map(y => y.data).indexOf(x) === -1);
        const removedTabs = this.tabs.filter(x => tabs.indexOf(x.data) === 1);

        for (const toRemove of removedTabs) {
            const index = this.tabs.indexOf(toRemove);
            this.tabs.splice(index, 1);
        }

        for (const toAdd of missingTabs) {
            const vm = new TabViewModel();
            vm.data = toAdd;
            vm.type = toAdd.key;
            this.tabs.push(vm);
        }

        for (const vm of this.tabs) {
            vm.visible = vm.data === this.tabManager.selectedTab;
        }
    }
}

export class TabViewModel {
    visible: boolean;
    data: Tab;
    type: string;
}
