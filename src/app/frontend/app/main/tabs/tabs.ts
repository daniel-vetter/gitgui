import { Repository, RepositoryCommit, FileRef } from "../../services/git/model";
import { HistoryTabComponent } from "./history/history-tab.component";
import { FileContentDiffTabComponent } from "./file-content-tabs/file-content-diff-tab/file-content-diff-tab.component";
import { FileContentTabComponent } from "./file-content-tabs/file-content-tab/file-content-tab.component";

export type TabData = HistoryTabData
                    | FileContentDiffTabData
                    | FileContentTabData;

export interface HistoryTabData {
    type: "HistoryTab";
    repository: Promise<Repository>;
}

export interface FileContentDiffTabData {
    type: "FileContentDiffTab";
    repository: Repository;
    leftFile: FileRef;
    rightFile: FileRef;
}

export interface FileContentTabData {
    type: "FileContentTab";
    repository: Repository;
    file: FileRef;
}
