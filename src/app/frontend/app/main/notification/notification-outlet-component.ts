import { Component, OnInit, OnDestroy } from "@angular/core";
import { Notifications, NotificationItem, NotificationCreateRequest } from "./notifications";
import { Subscription } from "../../services/event-aggregator";
import * as Rx from "rxjs";
import { trigger, state, style, transition, animate } from "@angular/animations";

@Component({
    selector: "notification-outlet",
    templateUrl: "./notification-outlet-component.html",
    styleUrls: ["./notification-outlet-component.scss"],
    animations: [
        trigger("opacityInOut", [
            state("*", style({
                opacity: 1
            })),
            state("void", style({
                opacity: 0
            })),
            transition("void <=> *", [
                animate("100ms linear")
            ])
        ]),
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
export class NotificationOutletComponent implements OnInit, OnDestroy {

    notifications: NotificationViewModel[] = [];
    private onNotificationOpenedSubscription: Rx.Subscription;

    constructor(private notification: Notifications) {}

    ngOnInit(): void {
        this.onNotificationOpenedSubscription = this.notification.onNotificationCreated.subscribe(x => this.onNewNotification(x));
    }

    ngOnDestroy() {
        this.onNotificationOpenedSubscription.unsubscribe();
    }

    private onNewNotification(request: NotificationCreateRequest) {
        request.callbacks.onShow = (input) => this.onShowNotification(request.notificationItem, input);
        request.callbacks.onClose = (output) => this.onCloseNotification(request.notificationItem, output);
    }

    private onShowNotification(notificationItem: NotificationItem<any, any>, input: any) {
        this.notifications.splice(0, 0, {
            notificationItem: notificationItem,
            input: input
        });
    }

    private onCloseNotification(notificationItem: NotificationItem<any, any>, output: any) {
        this.notifications = this.notifications.filter(x => x.notificationItem !== notificationItem);
    }
}

export interface NotificationViewModel {
    notificationItem: NotificationItem<any, any>;
    input: any;
}
