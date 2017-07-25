import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { TabManager, TabPage } from "app/services/tabs/tab-manager";

@Component({
    selector: "tab-header",
    templateUrl: "./tab-header.component.html",
    styleUrls: ["./tab-header.component.scss"]
})
export class TabHeaderComponent implements OnInit {
    pages: TabPageViewModel[] = [];

    constructor(private tabManager: TabManager) { }

    ngOnInit() {
        this.tabManager.onSelectedTabChanged.subscribe(() => this.update());
        this.tabManager.onTabChanged.subscribe(() => this.update());
        this.tabManager.onTabListChanged.subscribe(() => this.update());
        this.update();
    }

    private update() {
        const pages = this.tabManager.allTabPages;
        this.pages = [];
        for (const page of pages) {
            const vm = new TabPageViewModel();
            vm.closeable = page.isCloseable;
            vm.title = page.title;
            vm.isSelected = page === this.tabManager.selectedTab;
            vm.tabPage = page;
            vm.isPersistent = page.isPersistent;
            this.pages.push(vm);
        }
    }

    onTabClicked(vm: TabPageViewModel, event: MouseEvent) {
        if (event.button === 1) { // Middle mouse button
            this.onCloseClicked(vm);
            return false;
        }
        if (this.tabManager.selectedTab === vm.tabPage) {
            this.tabManager.selectedTab!.isPersistent = true;
        } else {
            this.tabManager.selectedTab = vm.tabPage;
        }
    }

    onCloseClicked(vm: TabPageViewModel) {
        if (!vm.tabPage.isCloseable)
            return;
        this.tabManager.closeTab(vm.tabPage);
        this.update();
    }
}

class TabPageViewModel {
    isSelected: boolean;
    isPersistent: boolean;
    title: string;
    closeable: boolean;
    tabPage: TabPage;
}
