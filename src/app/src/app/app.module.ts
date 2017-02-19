import { BrowserModule } from "@angular/platform-browser";
import { NgModule, APP_INITIALIZER } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HttpModule } from "@angular/http";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { RepositoryOpenComponent } from "./repository-open/repository-open.component";
import { WelcomeComponent } from "./welcome/welcome.component";
import { EventAggregator } from "./services/event-aggregator";
import { Process } from "./services/git/infrastructure/process";
import { GitRaw } from "./services/git/infrastructure/git-raw";
import { GitPathProvider } from "./services/git/infrastructure/git-executable-provider";
import { StatusReader } from "./services/git/infrastructure/status-reader";
import { CommitsReader } from "./services/git/commits-reader";
import { RepositoryReader } from "./services/git/repository-reader";
import { Config } from "./services/config";
import { RepositoryMainComponent } from "./repository-main/repository-main.component";
import { CommitHistoryModule } from "./repository-main/commit-history/commit-history.module";
import { CurrentRepository } from "./services/current-repository";
import { RefsReader } from "./services/git/refs-reader";
import { WidthCalculator } from "./repository-main/commit-history/commit-annotations/services/width-calculator";
import { MenuManager } from "./services/menu-manager";
import { ThemeManager } from "./services/theme-manager";

@NgModule({
  declarations: [
    AppComponent,
    RepositoryOpenComponent,
    WelcomeComponent,
    RepositoryMainComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule,
    CommitHistoryModule
  ],
  providers: [
      EventAggregator,
      Config,
      Process,
      GitRaw,
      GitPathProvider,
      StatusReader,
      CommitsReader,
      RepositoryReader,
      RefsReader,
      CurrentRepository,
      MenuManager,
      ThemeManager

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
