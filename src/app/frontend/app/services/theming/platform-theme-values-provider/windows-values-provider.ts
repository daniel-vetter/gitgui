import { PlatformThemeValues } from "app/services/theming/platform-theme-values-provider";
const remote = (<any>window).require("electron").remote;
const systemPreferences = remote.systemPreferences;

export class WindowsValuesProvider {
    getValues(): Promise<PlatformThemeValues> {
        return Promise.resolve(<PlatformThemeValues>{
            font: "small-caption",
            fontColor: systemPreferences.getColor("window-text"),
            windowBackgroundColor: systemPreferences.getColor("menu"),
            workspaceBackgroundColor: "#FFFFFF",
            workspaceBorderColor: "#C0C0C0"
        });
    }
}
