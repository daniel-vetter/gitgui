import { EventEmitter, Injectable } from "@angular/core";
import { Notification } from "./notifications";
import * as Rx from "rxjs";
import { Observable } from "rxjs";

@Injectable()
export class NotificationStore {
    onNewNotification = new Rx.Observable<Notification>();
    allNotifications: Notification[] = [];

    private onNewNotificationSubscriber: Rx.Subscriber<Notification>;

    constructor() {
        this.onNewNotification = new Rx.Observable((subscriber) => {
            this.onNewNotificationSubscriber = subscriber;
        });
    }

    store(notification: Notification) {
        this.allNotifications.push(notification);
        this.onNewNotificationSubscriber.next(notification);
    }
}

