import { ErrorHandler, Injectable } from "@angular/core";
import { Notifications } from "./main/notifications/notifications";

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {

    constructor(private notifications: Notifications) {}

    handleError(error: string) {
        console.error(error);
        this.notifications.showError(error);
    }
}