import { Component, OnInit, ComponentFactoryResolver, ViewChild, ViewContainerRef, Input, AfterContentInit } from "@angular/core";
import { DialogItem, DialogBase } from "../dialog";

@Component({
    selector: "dialog-wrapper",
    templateUrl: "./dialog-wrapper.component.html",
    styleUrls: ["./dialog-wrapper.component.scss"]
})
export class DialogWrapperComponent implements AfterContentInit {

    @Input() dialogItem: DialogItem<any, any>;
    @Input() input: any;
    @ViewChild("host", { read: ViewContainerRef }) host: ViewContainerRef
    private component: DialogBase<any, any>;

    constructor(private componentFactoryResolver: ComponentFactoryResolver) {

    }

    ngAfterContentInit(): void {
        const factory = this.componentFactoryResolver.resolveComponentFactory(this.dialogItem.componentType);
        this.host.clear();
        this.component = <DialogBase<any, any>>this.host.createComponent(factory).instance;
        this.component.close = (x) => this.dialogItem.close(x);
        this.component.onInit(this.input);
    }
}
