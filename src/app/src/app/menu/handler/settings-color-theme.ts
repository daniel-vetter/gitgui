import { Injectable } from "@angular/core";
import { ThemeManager } from "../../services/theme-manager";

@Injectable()
export class SettingsColorTheme {

    constructor(private themeManager: ThemeManager) {}

    createMenu(): any {
        return {
            label: "Color theme",
            submenu: [
                { label: "Light", click: () => this.themeManager.switchTheme("light") },
                { label: "Dark", click: () => this.themeManager.switchTheme("dark") }
            ]
        }
    }
}
