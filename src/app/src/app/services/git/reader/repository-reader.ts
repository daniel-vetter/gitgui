import { Injectable } from "@angular/core";
import { CommitsReader } from "./commits-reader";
import { StatusReader } from "./status-reader";
import { RefsReader } from "./refs-reader";
import { CurrentHeadReader } from "./current-head-reader";
import { Repository, UpdateState } from "../model";

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
        const x = await this.statusReader.readStatus(repository.location);
        repository.status = x;
        repository.onUpdate.emit(new UpdateState(false, false, true, false));
        return repository;
    }

    async updateRepository(repository: Repository): Promise<Repository> {
        const commitsPromise = this.commitsReader.readAllCommits(repository.location);
        const statusPromise = this.statusReader.readStatus(repository.location);
        const currentHeadHashPromise = this.currentHeadReader.readCurrentHeadHash(repository.location);

        repository.commits = await commitsPromise;
        repository.commits.forEach(x => x.repository = repository);
        repository.status = await statusPromise;
        const currentHeadHash = await currentHeadHashPromise;
        repository.head = repository.commits.find(x => x.hash === currentHeadHash);
        repository.refs = await this.refsReader.readAllRefs(repository.location, repository.commits);
        repository.onUpdate.emit(new UpdateState(true, true, true, true));
        return repository;
    }
}
