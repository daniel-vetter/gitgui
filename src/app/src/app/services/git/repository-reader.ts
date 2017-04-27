import { Injectable } from "@angular/core";
import { CommitsReader } from "./commits-reader";
import * as Rx from "rxjs";
import { Repository } from "../../model/model";
import { StatusReader } from "./status-reader";
import { RefsReader } from "./refs-reader";
import { CurrentHeadReader } from "./current-head-reader";

@Injectable()
export class RepositoryReader {
    constructor(private commitsReader: CommitsReader,
                private statusReader: StatusReader,
                private refsReader: RefsReader,
                private currentHeadReader: CurrentHeadReader) {

    }

    readRepository(repositoryPath: string): Rx.Observable<Repository> {
        const repository = new Repository();
        repository.location = repositoryPath;

        return Rx.Observable.forkJoin(
            this.commitsReader.readAllCommits(repositoryPath),
            this.statusReader.readStatus(repositoryPath),
            this.currentHeadReader.readCurrentHeadHash(repositoryPath)
        )
        .flatMap((result) => {
            repository.commits = result[0];
            repository.commits.forEach(x => x.repository = repository);
            repository.status = result[1];
            repository.head = repository.commits.find(x => x.hash === result[2]);
            console.log(repository);
            return this.refsReader.readAllRefs(repositoryPath, repository.commits);
        })
        .map((result) => {
            repository.refs = result;
            return repository;
        });

    }
}
