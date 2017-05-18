import { Component } from "@angular/core";
import { FileOpenRepository } from "../../menu/handler/file-open-repository";
import { Notifications } from "../notifications/notifications";
@Component({
    templateUrl: "./tool-bar.component.html",
    styleUrls: ["./tool-bar.component.scss"],
    selector: "tool-bar"
})
export class ToolBarComponent {

    constructor(private fileOpenRepository: FileOpenRepository,
                private notifications: Notifications) {}

    onOpenClicked() {
        this.fileOpenRepository.onClick();
    }

    onPushClicked() {
        this.notifications.show(new Date().toTimeString());
    }
}
