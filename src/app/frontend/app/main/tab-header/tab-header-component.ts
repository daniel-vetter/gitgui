import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { TabManager, TabPage } from "app/services/tabs/tab-manager";

@Component({
    selector: "tab-header",
    templateUrl: "./tab-header.component.html",
    styleUrls: ["./tab-header.component.scss"]
})
export class TabHeaderComponent implements OnInit {
    tempPages: TabPageViewModel[] = [];
    persistentPages: TabPageViewModel[] = [];

    constructor(private tabManager: TabManager) { }

    ngOnInit() {
        this.tabManager.onSelectedTabChanged.subscribe(() => this.update());
        this.tabManager.onTabChanged.subscribe(() => this.update());
        this.tabManager.onTabListChanged.subscribe(() => this.update());
        this.update();
    }

    private update() {
        const pages = this.tabManager.allTabPages;
        this.persistentPages = [];
        this.tempPages = [];
        for (const page of pages) {
            const vm = new TabPageViewModel();
            vm.closeable = page.isCloseable;
            vm.title = page.title;
            vm.isSelected = page === this.tabManager.selectedTab;
            vm.tabPage = page;
            if (page.isPersistent)
                this.persistentPages.push(vm);
            else
                this.tempPages.push(vm);
        }
    }

    onTabClicked(vm: TabPageViewModel, event: MouseEvent) {
        this.tabManager.selectedTab = vm.tabPage;
    }

    onCloseClicked(vm: TabPageViewModel) {
        if (!vm.tabPage.isCloseable)
            return;
        this.tabManager.closeTab(vm.tabPage);
        this.update();
    }

    onMakePersistentClicked(vm: TabPageViewModel) {
        vm.tabPage.isPersistent = true;
    }
}

class TabPageViewModel {
    isSelected: boolean;
    title: string;
    closeable: boolean;
    tabPage: TabPage;
}
