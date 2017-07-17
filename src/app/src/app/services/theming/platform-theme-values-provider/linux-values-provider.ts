import { PlatformThemeValues } from "app/services/theming/platform-theme-values-provider";

export class LinuxValuesProvider {
    getValues(): Promise<PlatformThemeValues> {
        //gsettings get org.gnome.desktop.interface font-name
        return Promise.resolve(<PlatformThemeValues>{
            fontName: "Ubuntu",
            fontSize: "10pt",
            windowBackgroundColor: "#F2F1F0",
            workspaceBackgroundColor: "#FFFFFF",
            workspaceBorderColor: "#909090"
            
        });
    }
}