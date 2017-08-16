import { Component, OnInit, ComponentFactoryResolver, ViewChild, ViewContainerRef, Input, AfterContentInit } from "@angular/core";
import { NotificationItem } from "../notifications";
import { NotificationBase } from "../notification-base";

@Component({
    selector: "notification-wrapper",
    templateUrl: "./notification-wrapper.component.html",
    styleUrls: ["./notification-wrapper.component.scss"]
})
export class NotificationWrapperComponent implements AfterContentInit {

    @Input() notificationItem: NotificationItem<any, any>;
    @Input() input: any;
    @ViewChild("host", { read: ViewContainerRef }) host: ViewContainerRef
    private component: NotificationBase<any, any>;

    constructor(private componentFactoryResolver: ComponentFactoryResolver) {

    }

    ngAfterContentInit(): void {
        const factory = this.componentFactoryResolver.resolveComponentFactory(this.notificationItem.componentType);
        this.host.clear();
        this.component = <NotificationBase<any, any>>this.host.createComponent(factory).instance;
        this.component.notificationItem = this.notificationItem;
        this.component.onInit(this.input);
    }
}
