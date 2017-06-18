import { Injectable } from "@angular/core";
import { CommitsReader } from "./commits-reader";
import { StatusReader } from "./status-reader";
import { RefsReader } from "./refs-reader";
import { CurrentHeadReader } from "./current-head-reader";
import { Repository, UpdatedElements } from "../model";

@Injectable()
export class RepositoryReader {
    constructor(private commitsReader: CommitsReader,
        private statusReader: StatusReader,
        private refsReader: RefsReader,
        private currentHeadReader: CurrentHeadReader) {

    }

    async readRepository(repositoryPath: string): Promise<Repository> {
        const repository = new Repository();
        repository.location = repositoryPath;
        return this.updateRepository(repository);
    }

    async updateStatus(repository: Repository): Promise<Repository> {
        if (repository.updateState.currentlyUpdatingElements) {
            throw Error("Repository is currently updating");
        }
        const updatedElements = new UpdatedElements(false, false, true, false);
        repository.updateState.currentlyUpdatingElements = updatedElements;
        repository.updateState.onUpdateStarted.next(updatedElements);
        repository.status = await this.statusReader.readStatus(repository.location);
        repository.updateState.currentlyUpdatingElements = undefined;
        repository.updateState.onUpdateFinished.next(updatedElements);
        return repository;
    }

    async updateRepository(repository: Repository): Promise<Repository> {
        if (repository.updateState.currentlyUpdatingElements) {
            throw Error("Repository is currently updating");
        }
        const updatedElements = new UpdatedElements(true, true, true, true);
        repository.updateState.currentlyUpdatingElements = updatedElements;
        repository.updateState.onUpdateStarted.next(updatedElements);

        const commitsPromise = this.commitsReader.readAllCommits(repository.location);
        const statusPromise = this.statusReader.readStatus(repository.location);
        const currentHeadHashPromise = this.currentHeadReader.readCurrentHeadHash(repository.location);

        repository.commits = await commitsPromise;
        repository.commits.forEach(x => x.repository = repository);
        repository.status = await statusPromise;
        const currentHeadHash = await currentHeadHashPromise;
        const currentHeadCommit =  repository.commits.find(x => x.hash === currentHeadHash);
        if (!currentHeadCommit)
            throw Error("Could not find head commit");
        repository.head = currentHeadCommit;
        repository.refs = await this.refsReader.readAllRefs(repository.location, repository.commits);
        repository.updateState.currentlyUpdatingElements = undefined;
        repository.updateState.onUpdateFinished.next(updatedElements);
        return repository;
    }
}
