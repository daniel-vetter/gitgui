import { Component, Input, EventEmitter, Output, OnChanges } from "@angular/core";
import { Notification, NotificationType } from "./notifications";


@Component({
    selector: "notification-box",
    templateUrl: "./notification-box.component.html",
    styleUrls: ["./notification-box.component.scss"],

})
export class NotificationBoxComponent implements OnChanges {
    @Input() notification: Notification = undefined;
    @Output() onCloseRequested = new EventEmitter();

    private buttonWasClicked = false;
    theme = "info";
    text = "";

    ngOnChanges() {
        if (!this.notification)
            return;

        if (this.notification.type === NotificationType.Error) this.theme = "error";
        else if (this.notification.type === NotificationType.Info) this.theme = "info";
        else throw Error("unsupported notification type");
        this.text = this.notification.text;
    }

    onButtonClicked() {
        if (this.buttonWasClicked === false)  {
            this.onCloseRequested.emit();
            this.buttonWasClicked = true;
        }
    }
}
