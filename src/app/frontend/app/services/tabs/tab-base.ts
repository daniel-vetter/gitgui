import { TabPage } from "./tab-manager";
import { TabData } from "../../main/tabs/tabs";

export abstract class TabBase<TDataType extends TabData> {
    page: TabPage;
    abstract displayData(data: TDataType): void;
}
