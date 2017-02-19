import { ThemeManager } from "./theme-manager";
import { Injectable } from "@angular/core";
const remote = (<any>window).require("electron").remote;
const Menu = remote.Menu;

@Injectable()
export class MenuManager {

    constructor(private themeManager: ThemeManager) {}

    init() {
        const menu = Menu.buildFromTemplate([
            {
                label: "File",
                submenu: [
                    { label: "Open repository..." },
                    { type: "separator" },
                    { label: "Exit", role: "close" },
                ]
            },
            {
                label: "Settings",
                submenu: [
                    {
                        label: "Color theme",
                        submenu: [
                            { label: "Light", click: () => this.themeManager.switchTheme("light") },
                            { label: "Dark", click: () => this.themeManager.switchTheme("dark") }
                        ]
                    },
                    { label: "Developer tools", role: "toggledevtools" }
                ]
            },
            {
                label: "Help",
                submenu: [
                    { label: "Check for updates" },
                    { label: "Info..." }
                ]
            }
        ]);

        remote.getCurrentWindow().setMenu(menu);
    }
}
