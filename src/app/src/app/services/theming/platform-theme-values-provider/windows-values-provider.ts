import { PlatformThemeValues } from "app/services/theming/platform-theme-values-provider";

export class WindowsValuesProvider {
    getValues(): Promise<PlatformThemeValues> {
        return Promise.resolve(<PlatformThemeValues>{});
    }
}