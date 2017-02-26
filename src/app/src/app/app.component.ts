import { Component, OnInit } from "@angular/core";
import * as Rx from "rxjs";
import { ThemeManager } from "./services/theme-manager";
import { MenuManager } from "./menu/menu-manager";
import { Config } from "./services/config";
import { CurrentRepository } from "./services/current-repository";
import { RepositoryReader } from "./services/git/repository-reader";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.sass"]
})
export class AppComponent implements OnInit {

    constructor(private menuManager: MenuManager,
        private themeManager: ThemeManager,
        private config: Config,
        private currentRepository: CurrentRepository,
        private repositoryReader: RepositoryReader) { }

    ngOnInit() {
        this.menuManager.init();
        this.themeManager.init();
        this.loadLastRepository();
    }

    private loadLastRepository() {
        const recentRepositories = this.config.get().recentRepositories;
        if (recentRepositories !== undefined && recentRepositories.length > 0) {
            const lastRepository = recentRepositories[recentRepositories.length - 1];
            this.repositoryReader.readRepository(lastRepository).subscribe(x => {
                this.currentRepository.set(x);
            });
        }
    }
}
