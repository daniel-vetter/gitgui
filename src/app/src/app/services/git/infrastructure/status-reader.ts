import { Injectable } from "@angular/core";
import * as Rx from "rxjs";
import { RepositoryStatus } from "../../../model/model";

@Injectable()
export class StatusReader {
    readStatus(repositoryPath: string): Rx.Observable<RepositoryStatus> {
        return Rx.Observable.of(new RepositoryStatus());
    }
}
