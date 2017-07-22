import { Injectable, EventEmitter } from "@angular/core";
import * as Rx from "rxjs";
import { PlatformThemeValuesProvider } from "app/services/theming/platform-theme-values-provider";
const remote = (<any>window).require("electron").remote;
const systemPreferences = remote.systemPreferences;

@Injectable()
export class ThemeManager {

    private _currentTheme: Theme = "light";
    private styleElements: HTMLStyleElement[] = [];

    constructor(private platformThemeValuesProvider: PlatformThemeValuesProvider) {
    }

    public onCurrentThemeChanged = new Rx.Subject();
    public get currentTheme(): Theme {
        return this._currentTheme;
    }

    init() {
        this.applyCurrentTheme();
    }

    async applyCurrentTheme() {

        const values = await this.platformThemeValuesProvider.getValues();

        let platformValues = "";
        let themeValues = "";

        for (var key in values) {
            if (!values.hasOwnProperty(key))
                continue;

            platformValues += "--platform-" + this.propertyNameToCssName(key) + ": " + (<any>values)[key] + ";\n";
            platformValues += "--theme-" + this.propertyNameToCssName(key) + ": " + (<any>values)[key] + ";\n";
        }

        platformValues = ":root {" + platformValues + "}";

        this.applyStyles([platformValues, themeValues]);
        this.onCurrentThemeChanged.next();
    }

    private propertyNameToCssName(name: string): string {
        let result = "";
        for (const char of name) {
            if (char === char.toUpperCase()) {
                result += "-" + char.toLowerCase();
            } else {
                result += char;
            }
        }
        return result;
    }

    switchTheme(theme: Theme) {
        this._currentTheme = theme;
        this.applyCurrentTheme();
    }

    private applyStyles(css: string[]) {
        for (const styleElement of this.styleElements) {
            document.head.removeChild(styleElement);
        }

        for (let index = css.length - 1; index >= 0; index--) {
            const styleElement = document.createElement("style");
            styleElement.setAttribute("type", "text/css");
            styleElement.innerHTML = css[index];
            document.head.insertBefore(styleElement, document.head.firstChild);
            this.styleElements.push(styleElement);
        }

        //Redraw scroll bars
        document.body.style.display = "none";
        // tslint:disable-next-line:no-unused-expression
        document.body.offsetHeight;
        document.body.style.display = "";
    }
}

type Theme = "light" | "dark";
