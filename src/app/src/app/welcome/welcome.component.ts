import { Component, OnInit } from "@angular/core";
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

  constructor(private repositoryReader: RepositoryReader,
              private config: Config) { }

  ngOnInit() {
      this.config.get().recentRepositories;
  }

  onOpenRepositoryClicked() {
      remote.dialog.showOpenDialog({
          properties: ["openDirectory"]
      }, () => {});
  }

  test() {
      this.repositoryReader.readRepository("C:\\temp\\linux-stable").subscribe(x => {
          console.log(x);
      });
  }

}
