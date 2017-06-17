import { Component, TemplateRef, ContentChild, ElementRef, AfterContentInit } from "@angular/core";

@Component({
    selector: "loading-overlay",
    templateUrl: "./loading-overlay.component.html",
    styleUrls: ["./loading-overlay.component.scss"]
})
export class LoadingOverlayComponent implements AfterContentInit {

    constructor(private root: ElementRef) {

    }

    ngAfterContentInit() {
        const parent = this.root.nativeElement.parentElement;
        if (!parent.style)
            parent.style = {};
        parent.style.position = "relative";
    }
}
