import { Injectable, EventEmitter } from "@angular/core";
const remote = (<any>window).require("electron").remote;
const systemPreferences = remote.systemPreferences;

@Injectable()
export class ThemeManager {

    private _currentTheme: Theme = "light";
    private _rootStyleElement: HTMLStyleElement = undefined;

    public onCurrentThemeChanged = new EventEmitter();
    public get currentTheme(): Theme {
        return this._currentTheme;
    }

    init() {
        this.applyCurrentTheme();
    }

    applyCurrentTheme() {
        const vars = new Map<string, string>();
        let customCss = "";

        if (this._currentTheme === "light") {
            vars.set("theme-window-background", systemPreferences.getColor("menu"));
            vars.set("theme-font-color", systemPreferences.getColor("window-text"));
            vars.set("theme-workspace-background", "#FFFFFF");
            vars.set("theme-workspace-border", "#C0C0C0");
        } else {
            vars.set("theme-window-background", "#1E1E1E");
            vars.set("theme-font-color", "#CCCCCC");
            vars.set("theme-workspace-background", "#252526");
            vars.set("theme-workspace-border", "#252526");
            customCss = `::-webkit-scrollbar {
                            width: 1em;
                            height: 1em;
                            background: transparent;
                        }

                        ::-webkit-scrollbar-thumb {
                            background-color: rgba(255, 255, 255, 0.2);
                        }`;
        }
        this.setGlobalVars(vars, customCss);
        this.redrawAllScrollBars();
        this.onCurrentThemeChanged.emit();
    }

    switchTheme(theme: Theme) {
        this._currentTheme = theme;
        this.applyCurrentTheme();
    }

    private setGlobalVars(vars: Map<string, string>, customCss: string) {
        if (!this._rootStyleElement) {
            this._rootStyleElement = document.createElement("style");
            this._rootStyleElement.type = "text/css";
            document.head.appendChild(this._rootStyleElement);
        }

        let css = "";
        vars.forEach((v, k) => {
            css += "--" + k + ": " + v + ";";
        });

        this._rootStyleElement.innerHTML = ":root {" + css + "}\n\n" + customCss;
    }

    private redrawAllScrollBars() {
        // Yes, this is a hack
        document.body.style.display = "none";
        // tslint:disable-next-line:no-unused-expression
        document.body.offsetHeight;
        document.body.style.display = "";
    }
}

type Theme = "light" | "dark";
