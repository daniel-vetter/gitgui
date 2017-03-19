import { Repository } from "../../model/model";
import { Tab } from "../../services/tab-manager";

export class HistoryTab extends Tab {
    key = "HistoryTab";
    repository: Repository;
}

export class FileChangeTab extends Tab {
    key = "FileChangeTab";
    repository: Repository;
    sourceBlob: string;
    destinationBlob: string;
}
