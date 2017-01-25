import { Component, OnInit, NgZone } from "@angular/core";
import { Repository } from "../model/model";
import { RepositoryReader } from "../services/git/repository-reader";
import { Config } from "../services/config";
const remote = (<any>window).require("electron").remote;

@Component({
    selector: "welcome",
    templateUrl: "./welcome.component.html",
    styleUrls: ["./welcome.component.scss"]
})
export class WelcomeComponent implements OnInit {

    recentRepositories: RecentRepositoryViewModel[] = [];

    constructor(private repositoryReader: RepositoryReader,
        private config: Config,
        private zone: NgZone) { }

    ngOnInit() {
        this.mapRecentRepositoriesViewModels();
    }

    private mapRecentRepositoriesViewModels() {
        this.recentRepositories = [];
        for (const path of this.config.get().recentRepositories) {
            const vm = new RecentRepositoryViewModel();
            vm.path = path;
            let splitIndex = path.lastIndexOf("\\");
            if (splitIndex === -1) {
                splitIndex = path.lastIndexOf("/");
            }
            if (splitIndex === -1) {
                vm.name = vm.path;
            } else {
                vm.name = path.substring(splitIndex + 1);
            }
            this.recentRepositories.push(vm);
        }
    }

    onOpenRepositoryClicked() {
        remote.dialog.showOpenDialog({
            properties: ["openDirectory"]
        }, (pathArray: string[]) => {
            this.zone.run(() => {
                this.config.get().recentRepositories.push(pathArray[0]);
                this.config.save();
                this.mapRecentRepositoriesViewModels();
            });
        });
    }

    test() {
        this.repositoryReader.readRepository("C:\\temp\\linux-stable").subscribe(x => {
            console.log(x);
        });
    }

}

class RecentRepositoryViewModel {
    name: string;
    path: string;
}
