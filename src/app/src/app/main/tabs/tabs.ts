import { Repository, RepositoryCommit, FileRef } from "../../services/git/model";
import { Tab } from "../../services/tab-manager";

export class HistoryTab extends Tab {
    key = "HistoryTab";
    repository: Repository;
}

export class FileContentDiffTab extends Tab {
    key = "FileContentDiffTab";
    repository: Repository;
    leftFile: FileRef;
    rightFile: FileRef;
}

export class FileContentTab extends Tab {
    key = "FileContentTab";
    repository: Repository;
    file: FileRef;
}