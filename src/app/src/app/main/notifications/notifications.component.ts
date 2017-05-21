import { Component, OnInit } from "@angular/core";
import { NotificationStore } from "./notificationStore";
import { Notification } from "./notifications";
import {
    trigger,
    state,
    style,
    animate,
    transition
} from "@angular/animations";

@Component({
    selector: "notifications",
    templateUrl: "./notifications.component.html",
    styleUrls: ["./notifications.component.scss"],
    animations: [
        trigger("flyInOut", [
            state("*", style({
                transform: "scale(1)",
                opacity: 1
            })),
            state("void", style({
                transform: "scale(0.9)",
                opacity: 0
            })),
            transition("void <=> *", [
                animate("100ms linear")
            ])
        ])
    ]
})
export class NotificationsComponent implements OnInit {

    notifications: NotificationViewModel[] = [];

    constructor(private notificationStore: NotificationStore) { }

    ngOnInit() {
        this.notifications = this.notificationStore.allNotifications.map(x => this.mapToViewModel(x));
        this.notificationStore.onNewNotification.subscribe(x => {
            this.notifications.splice(0, 0, this.mapToViewModel(x))
        });
    }

    private mapToViewModel(notification: Notification): NotificationViewModel {
        const vm = new NotificationViewModel();
        vm.text = notification.text;
        return vm;
    }

    onNotificationCloseRequested(n: Notification) {
        const index = this.notifications.indexOf(n);
        if (index != -1) {
            this.notifications.splice(index, 1);
        }
    }
}

class NotificationViewModel {
    text: string;
}
