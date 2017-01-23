import { Component, OnInit } from '@angular/core';
const remote = (<any>window).require('electron').remote;

@Component({
  selector: 'welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  onOpenRepositoryClicked() {
      remote.dialog.showOpenDialog({
          properties: ['openDirectory']
      }, () => {});
  }

}
