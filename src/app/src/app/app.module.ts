import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HttpModule } from "@angular/http";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { EventAggregator } from "./services/event-aggregator";
import { Config } from "./services/config";
import { CommitHistoryModule } from "./main/tabs/history/commit-history/commit-history.module";
import { CurrentRepository } from "./services/current-repository";
import { ThemeManager } from "./services/theme-manager";
import { CommitDetailsComponent } from "./main/side-bar/commit-details/commit-details-component";
import { GitModule } from "./services/git/git.module";
import { RepositoryComponent } from "./main/repository.component";
import { MenuModule } from "./menu/menu.module";
import { RepositoryOpener } from "./services/repository-opener";
import { SharedModule } from "./shared/shared.module";
import { StatusBarComponent } from "./main/status-bar/status-bar.component";
import { FileTreeBuilder } from "./main/side-bar/commit-details/services/file-tree-builder";
import { Status } from "./services/status";
import { Platform } from "./services/platform";
import { FileSystem } from "./services/file-system";
import { FileIconManager } from "./services/file-icon/file-icon";
import { PackageLoader } from "./services/file-icon/package-loader";
import { PackageParser } from "./services/file-icon/package-parser";
import { FileIconComponent } from "./main/side-bar/commit-details/file-icon/file-icon.component";
import { RefListComponent } from "./main/tabs/history/ref-list/ref-list.component";
import { ToolBarComponent } from "./main/tool-bar/tool-bar.component";
import { TabHeaderComponent } from "./main/tab-header/tab-header-component";
import { TabManager } from "./services/tab-manager";
import { TabContentComponent } from "./main/tab-content/tab-content.component";
import { HistoryTabComponent } from "./main/tabs/history/history-tab.component";
import { SideBarManager } from "./services/side-bar-manager";
import { SideBarComponent } from "./main/side-bar/side-bar.component";
import { FileChangeTab } from "./main/tabs/tabs";
import { FileChangeTabComponent } from "./main/tabs/file-change/file-change-tab.component";

@NgModule({
  declarations: [
    AppComponent,
    RepositoryComponent,
    CommitDetailsComponent,
    FileIconComponent,
    StatusBarComponent,
    RefListComponent,
    ToolBarComponent,
    TabHeaderComponent,
    TabContentComponent,
    HistoryTabComponent,
    FileChangeTabComponent,
    SideBarComponent
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
      PackageParser,
      TabManager,
      SideBarManager
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
