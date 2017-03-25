import { Repository } from "../../model/model";
import { Tab } from "../../services/tab-manager";

export class HistoryTab extends Tab {
    key = "HistoryTab";
    repository: Repository;
}

export class BlobDiffTab extends Tab {
    key = "BlobDiffTab";
    repository: Repository;
    sourceBlob: string;
    sourcePath: string;
    destinationBlob: string;
    destinationPath: string;
}
