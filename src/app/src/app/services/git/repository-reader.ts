import { Injectable } from "@angular/core";
import { CommitsReader } from "./commits-reader";
import * as Rx from "rxjs";
import { Repository } from "../../model/model";
import { StatusReader } from "./infrastructure/status-reader";
import { RefsReader } from "./refs-reader";

@Injectable()
export class RepositoryReader {
    constructor(private commitsReader: CommitsReader,
                private statusReader: StatusReader,
                private refsReader: RefsReader) {

    }

    readRepository(repositoryPath: string): Rx.Observable<Repository> {
        const repository = new Repository();
        repository.location = repositoryPath;

        return Rx.Observable.forkJoin(
            this.commitsReader.readAllCommits(repositoryPath),
            this.statusReader.readStatus(repositoryPath)
        )
        .flatMap((result) => {
            repository.commits = result[0];
            repository.status = result[1];
            return this.refsReader.readAllRefs(repositoryPath, repository.commits);
        })
        .map((result) => {
            repository.refs = result;
            return repository;
        });

    }
}
