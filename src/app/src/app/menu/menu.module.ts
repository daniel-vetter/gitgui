import { NgModule } from "@angular/core";
import { MenuManager } from "./menu-manager";
import { FileOpenRepository } from "./handler/file-open-repository";
import { SettingsColorTheme } from "./handler/settings-color-theme";

@NgModule({
    providers: [
        MenuManager,
        FileOpenRepository,
        SettingsColorTheme
    ]
})
export class MenuModule {

}
