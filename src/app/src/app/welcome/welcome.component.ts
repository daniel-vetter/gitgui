import { Component, OnInit, NgZone } from "@angular/core";
import { Router } from "@angular/router";
import { Repository } from "../model/model";
import { RepositoryReader } from "../services/git/repository-reader";
import { Config } from "../services/config";
import { CurrentRepository } from "../services/current-repository";
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
        private zone: NgZone,
        private router: Router,
        private currentRepository: CurrentRepository) { }

    ngOnInit() {
        this.mapRecentRepositoriesViewModels();
    }

    private mapRecentRepositoriesViewModels() {
        this.recentRepositories = [];

        const recentRepositories = Array.from(this.config.get().recentRepositories);
        recentRepositories.reverse();

        for (const path of recentRepositories) {
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
            if (vm.name.trim() === "") {
                vm.name = path;
            }

            this.recentRepositories.push(vm);
        }
    }

    onOpenRepositoryClicked() {
        remote.dialog.showOpenDialog({
            properties: ["openDirectory"]
        }, (pathArray: string[]) => {
            this.zone.run(() => {
                if (pathArray.length === 0) {
                    return;
                }
                this.config.get().recentRepositories.push(pathArray[0]);
                this.config.save();
                this.mapRecentRepositoriesViewModels();
                this.openRepository(pathArray[0]);
            });
        });
    }

    onRepositoryClicked(vm: RecentRepositoryViewModel) {
        this.openRepository(vm.path);
    }

    private openRepository(path: string) {
        this.router.navigate(["/main"]);
        this.repositoryReader.readRepository(path).subscribe(x => {
            this.currentRepository.set(x);
        });
    }
}

class RecentRepositoryViewModel {
    name: string;
    path: string;
}
