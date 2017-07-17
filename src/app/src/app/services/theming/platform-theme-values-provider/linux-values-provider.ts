import { PlatformThemeValues } from "app/services/theming/platform-theme-values-provider";

export class LinuxValuesProvider {
    getValues(): Promise<PlatformThemeValues> {
        //gsettings get org.gnome.desktop.interface font-name
        return Promise.resolve(<PlatformThemeValues>{
            fontName: "Ubuntu",
            fontSize: "11pt" 
        });
    }
}