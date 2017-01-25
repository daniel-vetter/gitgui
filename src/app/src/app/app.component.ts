import { Component, OnInit } from "@angular/core";
import { GitRaw } from "./services/git/infrastructure/git-raw";
import { RepositoryReader } from "./services/git/repository-reader";
import { Process } from "./services/git/infrastructure/process";
import * as Rx from "rxjs";
import { Config } from "./services/config";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.sass"]
})
export class AppComponent {
}
