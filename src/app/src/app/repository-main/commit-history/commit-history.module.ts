import { NgModule } from "@angular/core";
import { CommitHistoryComponent } from "./commit-history.component";
import { GravatarUrlBuilder } from "./services/gravatar-url-builder";
import { LaneAssigner } from "./services/lane-assigner";
import { LaneColorProvider } from "./services/lane-color-provider";
import { ReusePool } from "./services/reuse-pool";
import { CommitLanesComponent } from "./commit-lanes/commit-lanes.component";
import { CommitTitlesComponent } from "./commit-titles/commit-titles.component";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { RepositoryToHistoryRepositoryMapper } from "./services/repository-to-history-repository-mapper";
import { Metrics } from "./services/metrics";
import { LineRangeQueryHelper } from "./services/line-range-query-helper";
import { CommitAnnotationsComponent } from "./commit-annotations/commit-annotations.component";
import { CommitSelectionBackgroundComponent } from "./commit-selection-background/commit-selection-background.component";
@NgModule({
    declarations: [
        CommitHistoryComponent,
        CommitLanesComponent,
        CommitTitlesComponent,
        CommitAnnotationsComponent,
        CommitSelectionBackgroundComponent
    ],
    imports: [
        BrowserModule,
        FormsModule
    ],
    providers: [
        GravatarUrlBuilder,
        LaneAssigner,
        LaneColorProvider,
        LineRangeQueryHelper,
        ReusePool,
        RepositoryToHistoryRepositoryMapper,
        Metrics
    ],
    exports: [
        CommitHistoryComponent
    ]
})
export class CommitHistoryModule {

}
