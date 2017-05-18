import { EventEmitter, Injectable } from "@angular/core";
import { NotificationStore } from "./notificationStore";

@Injectable()
export class Notifications {

    constructor(private notificationStore: NotificationStore) {

    }

    show(text: string) {
        const n = new Notification();
        n.text = text;
        this.notificationStore.store(n);
    }
}

export class Notification {
    text: string;
}