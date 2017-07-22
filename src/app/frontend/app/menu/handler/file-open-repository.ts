import { Injectable, NgZone } from "@angular/core";
import { Config } from "../../services/config";
import { RepositoryOpener } from "../../services/repository-opener";
const remote = (<any>window).require("electron").remote;

@Injectable()
export class FileOpenRepository {

    constructor(private zone: NgZone,
                private config: Config,
                private repositoryOpener: RepositoryOpener) {}

    createMenu(): any {
        return { label: "Open repository...", click: () => this.onClick() };
    }

    onClick() {
        remote.dialog.showOpenDialog({
            properties: ["openDirectory"]
        }, (pathArray: string[]) => {
            this.zone.run(() => {
                if (pathArray === undefined || pathArray.length === 0) {
                    return;
                }

                this.config.get().recentRepositories.push(pathArray[0]);
                this.config.save();
                this.repositoryOpener.open(pathArray[0]);
            });
        });
    }
}
