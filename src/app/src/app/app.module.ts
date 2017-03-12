import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HttpModule } from "@angular/http";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { EventAggregator } from "./services/event-aggregator";
import { Config } from "./services/config";
import { CommitHistoryModule } from "./routes/repository/commit-history/commit-history.module";
import { CurrentRepository } from "./services/current-repository";
import { ThemeManager } from "./services/theme-manager";
import { CommitDetailsComponent } from "./routes/repository/commit-details/commit-details-component";
import { GitModule } from "./services/git/git.module";
import { RepositoryComponent } from "./routes/repository/repository.component";
import { MenuModule } from "./menu/menu.module";
import { RepositoryOpener } from "./services/repository-opener";
import { SharedModule } from "./shared/shared.module";
import { StatusBarComponent } from "./routes/repository/status-bar/status-bar.component";
import { FileTreeBuilder } from "./routes/repository/commit-details/services/file-tree-builder";
import { Status } from "./services/status";
import { Platform } from "./services/platform";
import { FileSystem } from "./services/file-system";
import { FileIconManager } from "./services/file-icon/file-icon";
import { PackageLoader } from "./services/file-icon/package-loader";
import { PackageParser } from "./services/file-icon/package-parser";
import { FileIconComponent } from "./routes/repository/commit-details/file-icon/file-icon.component";
import { SideBarComponent } from "./routes/repository/side-bar/side-bar.component";
import { ToolBarComponent } from "./routes/repository/tool-bar/tool-bar.component";
import { TabHeaderComponent } from "./routes/repository/tab-header/tab-header-component";

@NgModule({
  declarations: [
    AppComponent,
    RepositoryComponent,
    CommitDetailsComponent,
    FileIconComponent,
    StatusBarComponent,
    SideBarComponent,
    ToolBarComponent,
    TabHeaderComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule,
    CommitHistoryModule,
    GitModule,
    MenuModule,
    SharedModule
  ],
  providers: [
      EventAggregator,
      Platform,
      Config,
      CurrentRepository,
      ThemeManager,
      RepositoryOpener,
      FileTreeBuilder,
      Status,
      FileSystem,
      FileIconManager,
      PackageLoader,
      PackageParser
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
