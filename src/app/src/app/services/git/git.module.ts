import { NgModule } from "@angular/core";
import { CommitDetailsReader } from "./commit-details-reader";
import { RefsReader } from "./refs-reader";
import { RepositoryReader } from "./repository-reader";
import { CommitsReader } from "./commits-reader";
import { StatusReader } from "./status-reader";
import { GitPathProvider } from "./infrastructure/git-executable-provider";
import { GitRaw } from "./infrastructure/git-raw";
import { Process } from "./infrastructure/process";
import { Clone } from "./clone";
import { ObjectDiffReader } from "./object-diff-reader";
import { ObjectReader } from "./object-reader";
import { CurrentHeadReader } from "./current-head-reader";

@NgModule({
    providers: [
        Process,
        GitRaw,
        GitPathProvider,
        StatusReader,
        CommitsReader,
        RepositoryReader,
        RefsReader,
        CommitDetailsReader,
        Clone,
        ObjectDiffReader,
        ObjectReader,
        CurrentHeadReader
    ]
})
export class GitModule {

}
