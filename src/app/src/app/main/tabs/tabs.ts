import { Repository } from "../../services/git/model";
import { Tab } from "../../services/tab-manager";

export class HistoryTab extends Tab {
    key = "HistoryTab";
    repository: Repository;
}

export class TextDiffTab extends Tab {
    key = "TextDiffTab";
    repository: Repository;
    leftContent: string;
    leftPath: string;
    rightContent: string;
    rightPath: string;
}

export class TextTab extends Tab {
    key = "TextTab";
    repository: Repository;
    content: string;
    path: string;
}
