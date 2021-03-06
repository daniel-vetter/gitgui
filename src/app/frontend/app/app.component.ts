import { Component, OnInit, ErrorHandler } from "@angular/core";
import { MenuManager } from "./menu/menu-manager";
import { Config } from "./services/config";
import { RepositoryOpener } from "./services/repository-opener";
import { FileIconManager } from "./services/file-icon/file-icon";
import { ThemeManager } from "app/services/theming/theme-manager";
import { TabManager } from "app/services/tabs/tab-manager";

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
        (<any>window)["startDomMonitor"] = this.domChangeMonitor;
    }

    private async loadLastRepository() {
        const recentRepositories = this.config.get().recentRepositories;
        if (recentRepositories !== undefined && recentRepositories.length > 0) {
            this.repositoryOpener.open(recentRepositories[recentRepositories.length - 1]);
        }
    }


    private domChangeMonitor() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation: MutationRecord) => {
                if (mutation.type === "attributes" && (mutation.attributeName === undefined || mutation.attributeName!.startsWith("ng-")))
                    return;
                if (mutation.target instanceof Comment)
                    return;

                if (mutation.type === "attributes" && mutation.oldValue !== undefined && mutation.attributeName !== undefined) {
                    const attr = mutation.target.attributes.getNamedItem(mutation.attributeName!)
                    if (attr)
                        (<any>mutation)["newValue"] = attr.value
                }

                console.log(mutation);
            });
        });

        const config = {
            attributes: true,
            childList: true,
            characterData: true,
            attributeOldValue: true,
            characterDataOldValue: true,
            subtree: true
        };

        observer.observe(document.body, config);
    }
}



