import { Injectable } from "@angular/core";
const remote = (<any>window).require("electron").remote;
const systemPreferences = remote.systemPreferences;

@Injectable()
export class ThemeManager {

    private currentTheme: Theme = "light";
    private rootStyleElement: HTMLStyleElement = undefined;

    init() {
        const vars = new Map<string, string>();
        let customCss = "";

        if (this.currentTheme === "light") {
            vars.set("theme-window-background", systemPreferences.getColor("menu"));
            vars.set("theme-font-color", systemPreferences.getColor("window-text"));
            vars.set("theme-workspace-background", "#FFFFFF");
        } else {
            vars.set("theme-window-background", "#1E1E1E");
            vars.set("theme-font-color", "#CCCCCC");
            vars.set("theme-workspace-background", "#252526");
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
    }

    switchTheme(theme: Theme) {
        this.currentTheme = theme;
        this.init();
    }

    private setGlobalVars(vars: Map<string, string>, customCss: string) {
        if (!this.rootStyleElement) {
            this.rootStyleElement = document.createElement("style");
            this.rootStyleElement.type = "text/css";
            document.head.appendChild(this.rootStyleElement);
        }

        let css = "";
        vars.forEach((v, k) => {
            css += "--" + k + ": " + v + ";";
        });

        this.rootStyleElement.innerHTML = ":root {" + css + "}\n\n" + customCss;
    }
}

type Theme = "light" | "dark";
