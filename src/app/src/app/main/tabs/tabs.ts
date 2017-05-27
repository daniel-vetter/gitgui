import { Repository, RepositoryCommit } from "../../services/git/model";
import { Tab } from "../../services/tab-manager";

export class HistoryTab extends Tab {
    key = "HistoryTab";
    repository: Repository;
}

export class FileContentDiffTab extends Tab {
    key = "FileContentDiffTab";
    repository: Repository;
    leftContent: string;
    leftPath: string;
    rightContent: string;
    rightPath: string;
}

export class FileContentTab extends Tab {
    key = "FileContentTab";
    repository: Repository;
    content: string;
    path: string;
}