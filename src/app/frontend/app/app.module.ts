import { BrowserModule } from "@angular/platform-browser";
import { NgModule, ErrorHandler } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HttpModule } from "@angular/http";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { EventAggregator } from "./services/event-aggregator";
import { Config } from "./services/config";
import { CommitHistoryModule } from "./main/tabs/history/commit-history/commit-history.module";
import { CommitDetailsComponent } from "./main/side-bar/commit-details/commit-details.component";
import { GitModule } from "./services/git/git.module";
import { RepositoryComponent } from "./main/repository.component";
import { MenuModule } from "./menu/menu.module";
import { RepositoryOpener } from "./services/repository-opener";
import { SharedModule } from "./shared/shared.module";
import { StatusBarComponent } from "./main/status-bar/status-bar.component";
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
import { RepositoryStatusComponent } from "./main/side-bar/repository-status/repository-status.component";
import { NotificationsComponent } from "./main/notifications/notifications.component";
import { NotificationStore } from "./main/notifications/notificationStore";
import { Notifications } from "./main/notifications/notifications";
import { NotificationBoxComponent } from "./main/notifications/notification-box.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { GlobalErrorHandler } from "./global-error-handler";
import { FileContentDiffTabComponent } from "./main/tabs/file-content-tabs/file-content-diff-tab/file-content-diff-tab.component";
import { FileContentTabComponent } from "./main/tabs/file-content-tabs/file-content-tab/file-content-tab.component";
import { ChangedFilesTreeComponent } from "./main/side-bar/changed-files-tree/changed-files-tree.component";
import { FileTreeBuilder } from "./main/side-bar/changed-files-tree/file-tree-builder";
import { ThemeManager } from "app/services/theming/theme-manager";
import { PlatformThemeValuesProvider } from "app/services/theming/platform-theme-values-provider";
import { LinuxValuesProvider } from "app/services/theming/platform-theme-values-provider/linux-values-provider";
import { WindowsValuesProvider } from "app/services/theming/platform-theme-values-provider/windows-values-provider";

@NgModule({
  declarations: [
    AppComponent,
    RepositoryComponent,
    CommitDetailsComponent,
    ChangedFilesTreeComponent,
    FileIconComponent,
    StatusBarComponent,
    RefListComponent,
    ToolBarComponent,
    TabHeaderComponent,
    TabContentComponent,
    HistoryTabComponent,
    FileContentDiffTabComponent,
    FileContentTabComponent,
    SideBarComponent,
    RepositoryStatusComponent,
    NotificationsComponent,
    NotificationBoxComponent
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule,
    CommitHistoryModule,
    GitModule,
    MenuModule,
    SharedModule,
  ],
  providers: [
      {provide: ErrorHandler, useClass: GlobalErrorHandler},
      EventAggregator,
      Platform,
      Config,
      ThemeManager,
      RepositoryOpener,
      FileTreeBuilder,
      Status,
      FileSystem,
      FileIconManager,
      PackageLoader,
      PackageParser,
      TabManager,
      SideBarManager,
      Notifications,
      NotificationStore,
      PlatformThemeValuesProvider,
      WindowsValuesProvider,
      LinuxValuesProvider
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
