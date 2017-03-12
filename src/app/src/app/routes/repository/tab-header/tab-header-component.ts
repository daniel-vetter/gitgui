import { Component, OnInit } from "@angular/core";

@Component({
    selector: "tab-header",
    templateUrl: "./tab-header.component.html",
    styleUrls: ["./tab-header.component.scss"]
})
export class TabHeaderComponent implements OnInit {
    tabs: TabViewModel[] = [];
    selectedTab: TabViewModel;

    ngOnInit() {
        for (let i = 0; i < 3; i++) {
            const tab = new TabViewModel();
            tab.title = "Tab Sample " + (i + 1);
            tab.closeable = true;
            this.tabs.push(tab);
        }
        console.log(this.tabs);

        this.selectedTab = this.tabs[3];
        this.tabs[0].closeable = false;
    }

    onTabClicked(vm: TabViewModel) {
        this.selectedTab = vm;
    }

    onCloseClicked(vm: TabViewModel) {
        const index = this.tabs.indexOf(vm);
        if (index !== -1) {
            this.tabs.splice(index, 1);
        }
    }
}

class TabViewModel {
    title: string;
    closeable: boolean;
}
