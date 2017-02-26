import { Injectable } from "@angular/core";
import { ThemeManager } from "../services/theme-manager";
import { FileOpenRepository } from "./handler/file-open-repository";
import { SettingsColorTheme } from "./handler/settings-color-theme";
const remote = (<any>window).require("electron").remote;
const Menu = remote.Menu;

@Injectable()
export class MenuManager {

    constructor(private themeManager: ThemeManager,
        private fileOpenRepository: FileOpenRepository,
        private settingsColorTheme: SettingsColorTheme) { }

    init() {
        const map = [
            {
                label: "File",
                submenu: [
                    this.fileOpenRepository.createMenu(),
                    { type: "separator" },
                    { label: "Exit", role: "close" },
                ]
            },
            {
                label: "Settings",
                submenu: [
                    this.settingsColorTheme.createMenu(),
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
        ];
        console.log(map);
        const menu = Menu.buildFromTemplate(map);
        console.log(menu)
        remote.getCurrentWindow().setMenu(menu);
    }
}
