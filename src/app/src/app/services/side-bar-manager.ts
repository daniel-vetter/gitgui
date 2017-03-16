import { RepositoryCommit } from "../model/model";
import { EventEmitter, Injectable } from "@angular/core";

@Injectable()
export class SideBarManager {

    onContentChanged = new EventEmitter();
    commit: RepositoryCommit = undefined;

    showCommitDetails(commit: RepositoryCommit) {
        this.commit = commit;
        this.onContentChanged.emit();
    }
}
