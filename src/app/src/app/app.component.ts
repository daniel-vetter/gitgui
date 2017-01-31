import { Component, OnInit } from "@angular/core";
import * as Rx from "rxjs";
const systemPreferences = (<any>window).require("electron").remote.require("electron").systemPreferences;

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.sass"]
})
export class AppComponent implements OnInit {
    ngOnInit() {
        console.log(systemPreferences);
        console.log(systemPreferences.getColor("menu"));
        document.body.style.backgroundColor = systemPreferences.getColor("menu");
    }
}
