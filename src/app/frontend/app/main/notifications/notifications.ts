import { EventEmitter, Injectable } from "@angular/core";
import { NotificationStore } from "./notificationStore";

@Injectable()
export class Notifications {

    constructor(private notificationStore: NotificationStore) {

    }

    showInfo(text: string) {
        const n = new Notification();
        n.text = text;
        this.notificationStore.store(n);
    }

    showError(text: string) {
        const n = new Notification();
        n.text = text;
        n.type = NotificationType.Error;
        this.notificationStore.store(n);
    }
}

export class Notification {
    text = "";
    type: NotificationType = NotificationType.Info;
}

export enum NotificationType {
    Info,
    Error
}
