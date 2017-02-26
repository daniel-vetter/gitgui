import { Injectable, NgZone } from "@angular/core";
import { Config } from "../../services/config";
import { RepositoryReader } from "../../services/git/repository-reader";
import { CurrentRepository } from "../../services/current-repository";
import { EventAggregator } from "../../services/event-aggregator";
const remote = (<any>window).require("electron").remote;

@Injectable()
export class FileOpenRepository {

    constructor(private zone: NgZone,
                private config: Config,
                private repositoryReader: RepositoryReader,
                private currentRepository: CurrentRepository) {}

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
                this.repositoryReader.readRepository(pathArray[0]).subscribe(x => {
                    this.currentRepository.set(x);
                });
            });
        });
    }
}
