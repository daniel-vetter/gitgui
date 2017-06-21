import { NgModule } from "@angular/core";
import { CommitDetailsReader } from "./reader/commit-details-reader";
import { RefsReader } from "./reader/refs-reader";
import { RepositoryReader } from "./reader/repository-reader";
import { CommitsReader } from "./reader/commits-reader";
import { StatusReader } from "./reader/status-reader";
import { GitPathProvider } from "./infrastructure/git-executable-provider";
import { GitRaw } from "./infrastructure/git-raw";
import { Process } from "./infrastructure/process";
import { Cloner } from "./reader/cloner";
import { ObjectReader } from "./reader/object-reader";
import { CurrentHeadReader } from "./reader/current-head-reader";
import { Git } from "./git";
import { Index } from "./actions/index";
import { Commiter } from "./actions/commiter";
import { RepositoryUpdateTracker } from "./reader/repository-update-tracker";

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
        Cloner,
        ObjectReader,
        CurrentHeadReader,
        Index,
        Commiter,
        Git,
        RepositoryUpdateTracker
    ]
})
export class GitModule {

}
