import { Injectable } from "@angular/core";
import { CommitsReader } from "./commits-reader";
import { StatusReader } from "./status-reader";
import { RefsReader } from "./refs-reader";
import { CurrentHeadReader } from "./current-head-reader";
import { Repository, UpdatedElements } from "../model";
import { RepositoryUpdateTracker } from "./repository-update-tracker";
import { ConfigReader } from "./config-reader";

@Injectable()
export class RepositoryReader {
    constructor(private commitsReader: CommitsReader,
        private statusReader: StatusReader,
        private refsReader: RefsReader,
        private currentHeadReader: CurrentHeadReader,
        private repositoryUpdateTracker: RepositoryUpdateTracker,
        private configReader: ConfigReader) {

    }

    async readRepository(repositoryPath: string): Promise<Repository> {
        return this.updateRepository(new Repository(repositoryPath));
    }

    async updateStatus(repository: Repository): Promise<Repository> {
        this.repositoryUpdateTracker.updateStarting(repository, false, false, true, false, false);
        repository.status = await this.statusReader.readStatus(repository.location);
        this.repositoryUpdateTracker.updateFinished(repository);
        return repository;
    }

    async updateRepository(repository: Repository): Promise<Repository> {
        this.repositoryUpdateTracker.updateStarting(repository, true, true, true, true, true);
        try {
            const commitsPromise = this.commitsReader.readAllCommits(repository.location);
            const statusPromise = this.statusReader.readStatus(repository.location);

            const config = this.configReader.readConfig(repository.location);

            repository.commits = await commitsPromise;
            repository.commits.forEach(x => x.repository = repository);
            if (repository.commits.length > 0) {
                const currentHeadHash = await this.currentHeadReader.readCurrentHeadHash(repository.location);;
                const currentHeadCommit = repository.commits.find(x => x.hash === currentHeadHash);
                if (!currentHeadCommit)
                    throw Error("Could not find head commit");
                repository.head = currentHeadCommit;
            }
            repository.status = await statusPromise;
            repository.config = await config;

            repository.refs = await this.refsReader.readAllRefs(repository.location, repository.commits);
        } finally {
            this.repositoryUpdateTracker.updateFinished(repository);
        }
        return repository;
    }
}

