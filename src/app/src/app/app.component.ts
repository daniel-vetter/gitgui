import { Component, OnInit } from "@angular/core";
import * as Rx from "rxjs";
import { ThemeManager } from "./services/theme-manager";
import { MenuManager } from "./menu/menu-manager";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.sass"]
})
export class AppComponent implements OnInit {

    constructor(private menuManager: MenuManager,
                private themeManager: ThemeManager) {}

    ngOnInit() {
        this.menuManager.init();
        this.themeManager.init();
    }
}
