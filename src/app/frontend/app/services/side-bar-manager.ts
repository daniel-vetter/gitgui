import { RepositoryCommit, Repository } from "../services/git/model";
import { EventEmitter, Injectable } from "@angular/core";

@Injectable()
export class SideBarManager {

    onContentChanged = new EventEmitter();
    currentContent: SideBarContent;

    setContent(content: SideBarContent) {
        this.currentContent = content;
        this.onContentChanged.emit();
    }
}

export type SideBarContent = SideBarCommitDetails | SideBarRepositoryStatus;

export class SideBarCommitDetails {
    constructor(public commit: RepositoryCommit) {}
}

export class SideBarRepositoryStatus {
    constructor(public repository: Repository) {}
}
