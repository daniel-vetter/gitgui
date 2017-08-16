import { AppComponent } from "../../app.component";
import { Type, ComponentFactoryResolver, Component, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import * as Rx from "rxjs";
import { NotificationBase } from "./notification-base";
import { MessageNotificationComponent } from "./default-notifications/message-notification/message-notification.component";

@Injectable()
export class Notifications {

    onNotificationCreated: Rx.Observable<NotificationCreateRequest>;
    private onNotificationCreatedSubscriber: Rx.Subscriber<NotificationCreateRequest>;

    constructor() {
        const observable = new Rx.Observable<NotificationCreateRequest>(x => this.onNotificationCreatedSubscriber = x).publish();
        observable.connect();
        this.onNotificationCreated = observable;
    }

    create<TInput, TOutput, T extends NotificationBase<TInput, TOutput>>(c: Type<NotificationBase<TInput, TOutput>>): NotificationItem<TInput, TOutput> {
        const callbacks = new NotificationItemCallbacks();
        const notificationItem = new NotificationItem<TInput, TOutput>(c, callbacks);
        this.onNotificationCreatedSubscriber.next({ notificationItem: notificationItem, callbacks: callbacks })
        return notificationItem;
    }

    showInfo(text: string) {
        this.create(MessageNotificationComponent).showModal({ text: text, severity: "Info" });
    }

    showError(text: string) {
        this.create(MessageNotificationComponent).showModal({ text: text, severity: "Error" });
    }
}

export class NotificationItem<TInput, TOutput> {

    private closeResolver: (x: TOutput) => void;

    constructor(public componentType: Type<NotificationBase<TInput, TOutput>>,
        private callbacks: NotificationItemCallbacks) { }

    showModal(input: TInput): Promise<TOutput> {
        this.callbacks.onShow(input);
        return new Promise<TOutput>(x => this.closeResolver = x);
    }

    close(output: TOutput) {
        this.callbacks.onClose(output);
        this.closeResolver(output);
    }
}

export class NotificationItemCallbacks {
    onShow: (input: any) => void;
    onClose: (output: any) => void;
}

export interface NotificationCreateRequest {
    notificationItem: NotificationItem<any, any>;
    callbacks: NotificationItemCallbacks;
}


