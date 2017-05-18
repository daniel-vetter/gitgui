import { Component, Input, EventEmitter, Output } from "@angular/core";
import { Notification } from "./notifications";


@Component({
    selector: "notification-box",
    templateUrl: "./notification-box.component.html",
    styleUrls: ["./notification-box.component.scss"],
    
})
export class NotificationBoxComponent {
    @Input() notification: Notification = undefined;
    @Output() onCloseRequested = new EventEmitter();

    onButtonClicked() {
        this.onCloseRequested.emit();
    }
}