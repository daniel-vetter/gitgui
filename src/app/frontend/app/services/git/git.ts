import { Cloner } from "./reader/cloner";
import { RepositoryReader } from "./reader/repository-reader";
import { CommitDetailsReader } from "./reader/commit-details-reader";
import { RepositoryCommit, Repository, ChangedFile, FileRef } from "./model";
import { ObjectReader } from "./reader/object-reader";
import { Injectable } from "@angular/core";
import { Index } from "./actions/index";
import { Committer } from "./actions/committer";
import { GitFetchResult, Fetcher } from "./actions/fetcher";

@Injectable()
export class Git {

    constructor(private cloner: Cloner,
                private repositoryReader: RepositoryReader,
                private commitDetailsReader: CommitDetailsReader,
                private objectReader: ObjectReader,
                private index: Index,
                private committer: Committer,
                private fetcher: Fetcher) {}

    cloneRepositoryFromUrl(url: string, targetPath: string): Promise<boolean> {
        return this.cloner.cloneRepositoryFromUrl(url, targetPath);
    }
    readRepository(repositoryPath: string): Promise<Repository> {
        return this.repositoryReader.readRepository(repositoryPath);
    }
    updateRepositoryStatus(repository: Repository): Promise<Repository> {
        return this.repositoryReader.updateStatus(repository);
    }
    updateRepository(repository: Repository): Promise<Repository> {
        return this.repositoryReader.updateRepository(repository);
    }
    getLongCommitMessage(commit: RepositoryCommit): Promise<string> {
        return this.commitDetailsReader.getLongCommitMessage(commit);
    }
    getFileChangesOfCommit(commit: RepositoryCommit): Promise<ChangedFile[]> {
        return this.commitDetailsReader.getFileChangesOfCommit(commit);
    }
    getFileContent(repository: Repository, fileRef: FileRef): Promise<string> {
        return this.objectReader.getFileContent(repository.location, fileRef);
    }
    stage(repository: Repository, file: ChangedFile | string): Promise<boolean> {
        return this.index.stage(repository, file);
    }
    unstage(repository: Repository, file: ChangedFile | string): Promise<boolean> {
        return this.index.unstage(repository, file);
    }
    commit(repository: Repository, message: string, amend: boolean): Promise<boolean> {
        return this.committer.commit(repository, message, amend);
    }
    fetch(repository: Repository): Promise<GitFetchResult> {
        return this.fetcher.fetch(repository);
    }
}
