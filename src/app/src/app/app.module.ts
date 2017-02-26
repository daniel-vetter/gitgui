import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HttpModule } from "@angular/http";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { WelcomeComponent } from "./welcome/welcome.component";
import { EventAggregator } from "./services/event-aggregator";
import { Config } from "./services/config";
import { CommitHistoryModule } from "./routes/repository/commit-history/commit-history.module";
import { CurrentRepository } from "./services/current-repository";
import { MenuManager } from "./services/menu-manager";
import { ThemeManager } from "./services/theme-manager";
import { CommitDetailsComponent } from "./routes/repository/commit-details/commit-details-component";
import { GitModule } from "./services/git/git.module";
import { RepositoryComponent } from "./routes/repository/repository.component";

@NgModule({
  declarations: [
    AppComponent,
    WelcomeComponent,
    RepositoryComponent,
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
