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
        repository.updateState.currentlyUpdatingElements = new UpdatedElements(false, false, true, false);
        repository.updateState.onUpdateStarted.next(repository.updateState.currentlyUpdatingElements);
        repository.status = await this.statusReader.readStatus(repository.location);
        repository.updateState.onUpdateFinished.next(repository.updateState.currentlyUpdatingElements);
        return repository;
    }

    async updateRepository(repository: Repository): Promise<Repository> {
        if (repository.updateState.currentlyUpdatingElements) {
            throw Error("Repository is currently updating");
        }
        repository.updateState.currentlyUpdatingElements = new UpdatedElements(true, true, true, true);
        repository.updateState.onUpdateStarted.next(repository.updateState.currentlyUpdatingElements);

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
        repository.updateState.onUpdateFinished.next(repository.updateState.currentlyUpdatingElements);
        return repository;
    }
}
