import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { TabManager, Tab } from "../../services/tab-manager";

@Component({
    selector: "tab-header",
    templateUrl: "./tab-header.component.html",
    styleUrls: ["./tab-header.component.scss"]
})
export class TabHeaderComponent implements OnInit {
    tabs: TabViewModel[] = [];

    constructor(private tabManager: TabManager, private changeDetector: ChangeDetectorRef) { }

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
            vm.closeable = tab.ui.isCloseable;
            vm.title = tab.ui.title;
            vm.isSelected = tab === this.tabManager.selectedTab;
            vm.tab = tab;
            vm.isPersistent = tab.ui.isPersistent;
            this.tabs.push(vm);
        }
        this.changeDetector.detectChanges();
    }

    onTabClicked(vm: TabViewModel, event: MouseEvent) {
        if (event.button === 1) { // mMiddel mouse button
            this.onCloseClicked(vm);
            return false;
        }
        if (this.tabManager.selectedTab === vm.tab) {
            this.tabManager.selectedTab.ui.isPersistent = true;
        } else {
            this.tabManager.selectedTab = vm.tab;
        }
    }

    onCloseClicked(vm: TabViewModel) {
        if (!vm.tab.ui.isCloseable)
            return;
        this.tabManager.closeTab(vm.tab);
        this.update();
    }
}

class TabViewModel {
    isSelected: boolean;
    isPersistent: boolean;
    title: string;
    closeable: boolean;
    tab: Tab;
}
