import { NgModule } from "@angular/core";
import { CommitHistoryComponent } from "./commit-history.component";
import { LaneAssigner } from "./services/lane-assigner";
import { LaneColorProvider } from "./services/lane-color-provider";
import { CommitLanesComponent } from "./commit-lanes/commit-lanes.component";
import { CommitTitlesComponent } from "./commit-titles/commit-titles.component";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { RepositoryToHistoryRepositoryMapper } from "./services/repository-to-history-repository-mapper";
import { Metrics } from "./services/metrics";
import { CommitAnnotationsComponent } from "./commit-annotations/commit-annotations.component";
import { CommitSelectionBackgroundComponent } from "./commit-selection-background/commit-selection-background.component";
import { WidthCalculator } from "./commit-annotations/services/width-calculator";
import { SharedModule } from "../../../shared/shared.module";
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
        FormsModule,
        SharedModule
    ],
    providers: [
        LaneAssigner,
        LaneColorProvider,
        RepositoryToHistoryRepositoryMapper,
        Metrics,
        WidthCalculator
    ],
    exports: [
        CommitHistoryComponent
    ]
})
export class CommitHistoryModule {

}
