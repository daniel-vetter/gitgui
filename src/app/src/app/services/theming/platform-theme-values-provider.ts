import { Injectable } from "@angular/core";
import { Platform } from "app/services/platform";
import { WindowsValuesProvider } from "app/services/theming/platform-theme-values-provider/windows-values-provider";
import { LinuxValuesProvider } from "app/services/theming/platform-theme-values-provider/linux-values-provider";

@Injectable()
export class PlatformThemeValuesProvider {

    constructor(private platform: Platform,
                private windowsValueProvider: WindowsValuesProvider,
                private linuxValueProvider: LinuxValuesProvider) {}

    getValues(): Promise<PlatformThemeValues> {
        if (this.platform.current === "Windows") {
            return this.windowsValueProvider.getValues();
        }
        if (this.platform.current === "Linux") {
            return this.linuxValueProvider.getValues();
        }

        return this.assertNever(this.platform.current);
    }

    private assertNever(never: never): never {
        throw new Error("Unsupported platform " + never);
    }
}

export interface PlatformThemeValues {
    windowBackgroundColor: string;
    fontColor: string;
    workspaceBackgroundColor: string;
    workspaceBorderColor: string;
    fontName: string;
    fontSize: string;
}