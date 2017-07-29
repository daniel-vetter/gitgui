import { TabBase } from "../../../services/tabs/tab-base";
import { TabPage } from "app/services/tabs/tab-manager";
import { OnChanges, SimpleChanges } from "@angular/core";
import { Component, OnInit, ComponentFactoryResolver, Input, AfterViewInit,
    ViewContainerRef, ViewChild, TemplateRef, AfterContentInit } from "@angular/core";

@Component({
    selector: "tab-component-wrapper",
    templateUrl: "./tab-component-wrapper.component.html",
    styleUrls: ["./tab-component-wrapper.component.scss"]
})
export class TabComponentWrapperComponent implements AfterContentInit, OnChanges {

    @Input() componentType: any;
    @Input() data: any;
    @Input() page: TabPage;
    @ViewChild("host", { read: ViewContainerRef }) host: ViewContainerRef

    private component: TabBase<any>;

    constructor(private componentFactoryResolver: ComponentFactoryResolver, private viewContainerRef: ViewContainerRef) { }

    ngAfterContentInit(): void {
        const factory = this.componentFactoryResolver.resolveComponentFactory(this.componentType);
        this.host.clear();
        this.component = <TabBase<any>>this.host.createComponent(factory).instance;
        this.component.page = this.page;
        this.component.displayData(this.data);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.component === undefined)
            return;

        this.component.page = this.page;
        this.component.displayData(this.data);
    }
}
