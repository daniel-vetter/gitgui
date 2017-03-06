import { GitRaw } from "./infrastructure/git-raw";
import { Platform } from "../platform";
import * as Rx from "rxjs";
import { Injectable } from "@angular/core";
import { FileSystem } from "../file-system";

@Injectable()
export class Clone {

    constructor(private gitRaw: GitRaw,
        private platform: Platform,
        private fileSystem: FileSystem) {
    }

    cloneRepositoryFromUrl(url: string, targetPath: string): Rx.Observable<boolean> {
        return Rx.Observable.create((subscriber: Rx.Subscriber<boolean>) => {
            this.fileSystem.ensureDirectoryExists(targetPath);
            this.gitRaw.run(targetPath, ["clone", url]).subscribe(x => {
                subscriber.next(true);
                subscriber.complete();
            });
        });
    }
}
