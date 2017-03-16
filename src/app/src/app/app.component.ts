import { Component, OnInit } from "@angular/core";
import { ThemeManager } from "./services/theme-manager";
import { MenuManager } from "./menu/menu-manager";
import { Config } from "./services/config";
import { RepositoryOpener } from "./services/repository-opener";
import { FileIconManager } from "./services/file-icon/file-icon";
import { TabManager } from "./services/tab-manager";
import { HistoryTab } from "./main/tabs/tabs";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.sass"]
})
export class AppComponent implements OnInit {

    constructor(private menuManager: MenuManager,
        private themeManager: ThemeManager,
        private config: Config,
        private repositoryOpener: RepositoryOpener,
        private fileIconManager: FileIconManager,
        private tabManager: TabManager) { }

    ngOnInit() {
        this.menuManager.init();
        this.themeManager.init();
        this.fileIconManager.init();
        this.loadLastRepository();
    }

    private loadLastRepository() {
        const recentRepositories = this.config.get().recentRepositories;
        if (recentRepositories !== undefined && recentRepositories.length > 0) {
            this.repositoryOpener.open(recentRepositories[recentRepositories.length - 1]);
        }
    }
}


