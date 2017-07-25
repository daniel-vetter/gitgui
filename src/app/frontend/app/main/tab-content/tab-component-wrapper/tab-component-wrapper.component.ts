import { TabBase } from "../../../services/tabs/tab-base";
import { TabPage } from "app/services/tabs/tab-manager";
import { Component, OnInit, ComponentFactoryResolver, Input, AfterViewInit,
    ViewContainerRef, ViewChild, TemplateRef, AfterContentInit } from "@angular/core";

@Component({
    selector: "tab-component-wrapper",
    templateUrl: "./tab-component-wrapper.component.html",
    styleUrls: ["./tab-component-wrapper.component.scss"]
})
export class TabComponentWrapperComponent implements AfterContentInit {

    @Input() componentType: any;
    @Input() data: any;
    @Input() page: TabPage;
    @ViewChild("host", { read: ViewContainerRef }) host: ViewContainerRef

    constructor(private componentFactoryResolver: ComponentFactoryResolver, private viewContainerRef: ViewContainerRef) { }

    ngAfterContentInit(): void {
        const factory = this.componentFactoryResolver.resolveComponentFactory(this.componentType);
        this.host.clear();
        const component = this.host.createComponent(factory);
        (<TabBase<any>>component.instance).page = this.page;
        (<TabBase<any>>component.instance).displayData(this.data);
    }
}
