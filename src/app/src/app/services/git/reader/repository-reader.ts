import { Injectable } from "@angular/core";
import { CommitsReader } from "./commits-reader";
import { StatusReader } from "./status-reader";
import { RefsReader } from "./refs-reader";
import { CurrentHeadReader } from "./current-head-reader";
import { Repository } from "../model";

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

        const commitsPromise = this.commitsReader.readAllCommits(repositoryPath);
        const statusPromise = this.statusReader.readStatus(repositoryPath);
        const currentHeadHashPromise = this.currentHeadReader.readCurrentHeadHash(repositoryPath);

        repository.commits = await commitsPromise;
        repository.commits.forEach(x => x.repository = repository);
        repository.status = await statusPromise;
        const currentHeadHash = await currentHeadHashPromise;
        repository.head = repository.commits.find(x => x.hash === currentHeadHash);
        repository.refs = await this.refsReader.readAllRefs(repositoryPath, repository.commits);
        return repository;
    }

    async updateStatus(repository: Repository): Promise<Repository> {
        const x = await this.statusReader.readStatus(repository.location);
        repository.status = x;
        repository.onStatusChanged.emit();
        return repository;
    }
}
