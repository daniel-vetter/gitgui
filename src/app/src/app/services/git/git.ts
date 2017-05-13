import { Cloner } from "./reader/cloner";
import * as Rx from "rxjs";
import { RepositoryReader } from "./reader/repository-reader";
import { CommitDetailsReader } from "./reader/commit-details-reader";
import { RepositoryCommit, Repository, ChangedCommitFile } from "./model";
import { ObjectReader } from "./reader/object-reader";
import { Injectable } from "@angular/core";
import { Index } from "./actions/index";

@Injectable()
export class Git {

    constructor(private cloner: Cloner,
                private repositoryReader: RepositoryReader,
                private commitDetailsReader: CommitDetailsReader,
                private objectReader: ObjectReader,
                private index: Index) {}

    cloneRepositoryFromUrl(url: string, targetPath: string): Rx.Observable<boolean> {
        return this.cloner.cloneRepositoryFromUrl(url, targetPath);
    }
    readRepository(repositoryPath: string): Rx.Observable<Repository> {
        return this.repositoryReader.readRepository(repositoryPath);
    }
    updateRepositoryStatus(repository: Repository): Rx.Observable<Repository> {
        return this.repositoryReader.updateStatus(repository);
    }
    getLongCommitMessage(commit: RepositoryCommit): Rx.Observable<string> {
        return this.commitDetailsReader.getLongCommitMessage(commit);
    }
    getFileChangesOfCommit(commit: RepositoryCommit): Rx.Observable<ChangedCommitFile[]> {
        return this.commitDetailsReader.getFileChangesOfCommit(commit);
    }
    getObjectData(repository: Repository, objectId: string): Rx.Observable<string> {
        return this.objectReader.getObjectData(repository.location, objectId);
    }
    stageFile(repository: Repository, filePath: string): Rx.Observable<boolean> {
        return this.index.stageFile(repository, filePath);
    }
    unstageFile(repository: Repository, filePath: string): Rx.Observable<boolean> {
        return this.index.unstageFile(repository, filePath);
    }
}
