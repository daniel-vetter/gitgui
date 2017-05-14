import { Cloner } from "./reader/cloner";
import { RepositoryReader } from "./reader/repository-reader";
import { CommitDetailsReader } from "./reader/commit-details-reader";
import { RepositoryCommit, Repository, ChangedCommitFile } from "./model";
import { ObjectReader } from "./reader/object-reader";
import { Injectable } from "@angular/core";
import { Index } from "./actions/index";
import { Commiter } from "./actions/commiter";

@Injectable()
export class Git {

    constructor(private cloner: Cloner,
                private repositoryReader: RepositoryReader,
                private commitDetailsReader: CommitDetailsReader,
                private objectReader: ObjectReader,
                private index: Index,
                private commiter: Commiter) {}

    cloneRepositoryFromUrl(url: string, targetPath: string): Promise<boolean> {
        return this.cloner.cloneRepositoryFromUrl(url, targetPath);
    }
    readRepository(repositoryPath: string): Promise<Repository> {
        return this.repositoryReader.readRepository(repositoryPath);
    }
    updateRepositoryStatus(repository: Repository): Promise<Repository> {
        return this.repositoryReader.updateStatus(repository);
    }
    getLongCommitMessage(commit: RepositoryCommit): Promise<string> {
        return this.commitDetailsReader.getLongCommitMessage(commit);
    }
    getFileChangesOfCommit(commit: RepositoryCommit): Promise<ChangedCommitFile[]> {
        return this.commitDetailsReader.getFileChangesOfCommit(commit);
    }
    getObjectData(repository: Repository, objectId: string): Promise<string> {
        return this.objectReader.getObjectData(repository.location, objectId);
    }
    stageFile(repository: Repository, filePath: string): Promise<boolean> {
        return this.index.stageFile(repository, filePath);
    }
    unstageFile(repository: Repository, filePath: string): Promise<boolean> {
        return this.index.unstageFile(repository, filePath);
    }
    commit(repository: Repository, message: string, amend: boolean): Promise<boolean> {
        return this.commiter.commit(repository, message, amend);
    }
}
