import * as Rx from "rxjs";
import { Observable } from "rxjs";
import { Process, ProcessResult } from "./process";
import { GitPathProvider } from "./git-executable-provider";
import { Injectable } from "@angular/core";

@Injectable()
export class GitRaw {

    constructor(private process: Process, private gitPathProvider: GitPathProvider) { }

    run(repositoryPath: string, args: string[]): Rx.Observable<ProcessResult> {
        return this.gitPathProvider.getGitPath().flatMap(x => {
            return this.process.runAndWait(x, args, repositoryPath);
        });
    }
}
