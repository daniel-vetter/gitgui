import { Injectable } from "@angular/core";
import { CommitsReader } from "./commits-reader";
import * as Rx from "rxjs";
import { Repository } from "../../model/model";
import { StatusReader } from "./infrastructure/status-reader";

@Injectable()
export class RepositoryReader {
    constructor(private commitsReader: CommitsReader,
        private statusReader: StatusReader) {

    }

    readRepository(repositoryPath: string): Rx.Observable<Repository> {
        return Rx.Observable.forkJoin(
            this.commitsReader.readAllCommits(repositoryPath),
            this.statusReader.readStatus(repositoryPath)
        ).map((x, y) => {
            const repository = new Repository();
            repository.location = repositoryPath;
            repository.commits = x[0];
            repository.status = x[1];
            return repository;
        });

    }
}
