import { FileContentTabComponent } from "./file-content-tabs/file-content-tab/file-content-tab.component";
import { HistoryTabComponent } from "./history/history-tab.component";
import { TabData } from "./tabs";
import { FileContentDiffTabComponent } from "./file-content-tabs/file-content-diff-tab/file-content-diff-tab.component";

export function getTabComponentType(tab: TabData) {
    switch (tab.type) {
        case "HistoryTab": return HistoryTabComponent;
        case "FileContentDiffTab": return FileContentDiffTabComponent;
        case "FileContentTab": return FileContentTabComponent;
    }
}
