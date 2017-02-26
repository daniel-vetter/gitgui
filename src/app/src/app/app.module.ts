import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HttpModule } from "@angular/http";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { WelcomeComponent } from "./welcome/welcome.component";
import { EventAggregator } from "./services/event-aggregator";
import { Config } from "./services/config";
import { RepositoryMainComponent } from "./repository-main/repository-main.component";
import { CommitHistoryModule } from "./repository-main/commit-history/commit-history.module";
import { CurrentRepository } from "./services/current-repository";
import { MenuManager } from "./services/menu-manager";
import { ThemeManager } from "./services/theme-manager";
import { CommitDetailsComponent } from "./repository-main/commit-details/commit-details-component";
import { GitModule } from "./services/git/git.module";

@NgModule({
  declarations: [
    AppComponent,
    WelcomeComponent,
    RepositoryMainComponent,
    CommitDetailsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule,
    CommitHistoryModule,
    GitModule
  ],
  providers: [
      EventAggregator,
      Config,
      CurrentRepository,
      MenuManager,
      ThemeManager,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
