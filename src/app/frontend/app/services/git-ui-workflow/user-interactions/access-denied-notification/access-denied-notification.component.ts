import { Component, OnInit } from "@angular/core";
import { NotificationBase } from "../../../../main/notification/notification-base";

@Component({
    selector: "access-denied-notification",
    templateUrl: "./access-denied-notification.component.html",
    styleUrls: ["./access-denied-notification.component.scss"]
})
export class AccessDeniedNotificationComponent extends NotificationBase<AccessDeniedNotificationInput, AccessDeniedNotificationOutput> {

    constructor() {
        super();
    }

    onInit(input: AccessDeniedNotificationInput): void {
    }
}

export interface AccessDeniedNotificationInput {
    blockedFiles: string[];
}

export type AccessDeniedNotificationOutput = "retry" | "abort" | "externally_resolved";
