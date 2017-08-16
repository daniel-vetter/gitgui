import { Component, OnInit } from "@angular/core";
import { NotificationBase } from "../../notification-base";

@Component({
    selector: "message-notification",
    templateUrl: "./message-notification.component.html",
    styleUrls: ["./message-notification.component.scss"]
})
export class MessageNotificationComponent extends NotificationBase<InfoNotificationContent, void> {

    text: string;

    constructor() {
        super();
    }

    onInit(input: InfoNotificationContent): void {
        this.text = input.text;
    }
}

export interface InfoNotificationContent {
    text: string;
    severity: "Info" | "Error";
}
