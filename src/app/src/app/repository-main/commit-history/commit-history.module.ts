import { NgModule } from "@angular/core";
import { CommitHistoryComponent } from "./commit-history.component";
import { GravatarUrlBuilder } from "./services/gravatar-url-builder";
import { LaneAssigner } from "./services/lane-assigner";
import { LaneColorProvider } from "./services/lane-color-provider";
import { LineIndex } from "./services/line-index";
import { ReusePool } from "./services/reuse-pool";
import { CommitLanesComponent } from "./commit-lanes/commit-lanes.component";
import { CommitTitlesComponent } from "./commit-titles/commit-titles.component";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
@NgModule({
    declarations: [
        CommitHistoryComponent,
        CommitLanesComponent,
        CommitTitlesComponent
    ],
    imports: [
        BrowserModule,
        FormsModule
    ],
    providers: [
        GravatarUrlBuilder,
        LaneAssigner,
        LaneColorProvider,
        LineIndex,
        ReusePool
    ],
    exports: [
        CommitHistoryComponent
    ]
})
export class CommitHistoryModule {

}
