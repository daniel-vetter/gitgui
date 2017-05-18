import { EventEmitter, Injectable } from "@angular/core";
import { Notification } from "./notifications";

@Injectable()
export class NotificationStore {
    onNewNotification = new EventEmitter<Notification>();
    allNotifications: Notification[] = [];

    store(notification: Notification) {
        this.allNotifications.push(notification);
        this.onNewNotification.emit(notification);
    }
}

