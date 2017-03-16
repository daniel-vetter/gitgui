import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { TabManager, Tab } from "../../services/tab-manager";

@Component({
    selector: "tab-header",
    templateUrl: "./tab-header.component.html",
    styleUrls: ["./tab-header.component.scss"]
})
export class TabHeaderComponent implements OnInit {
    tabs: TabViewModel[] = [];

    constructor(private tabManager: TabManager, private changeDetector: ChangeDetectorRef) {}

    ngOnInit() {
        this.tabManager.onSelectedTabChanged.subscribe(() => this.update());
        this.tabManager.onTabChanged.subscribe(() => this.update());
        this.tabManager.onTabListChanged.subscribe(() => this.update());
        this.update();
    }

    private update() {
        const tabs = this.tabManager.allTabs;
        this.tabs = [];
        for (const tab of tabs) {
            const vm = new TabViewModel();
            vm.closeable = tab.isCloseable;
            vm.title = tab.title;
            vm.isSelected = tab === this.tabManager.selectedTab;
            vm.tab = tab;
            this.tabs.push(vm);
        }
        this.changeDetector.detectChanges();
    }

    onTabClicked(vm: TabViewModel) {
        this.tabManager.selectedTab = vm.tab;
    }

    onCloseClicked(vm: TabViewModel) {
        this.tabManager.closeTab(vm.tab);
        this.update();
    }
}

class TabViewModel {
    isSelected: boolean;
    title: string;
    closeable: boolean;
    tab: Tab;
}
