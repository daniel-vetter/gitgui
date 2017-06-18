import { Component, TemplateRef, ContentChild, ElementRef, AfterContentInit, Input } from "@angular/core";

@Component({
    selector: "loading-overlay",
    templateUrl: "./loading-overlay.component.html",
    styleUrls: ["./loading-overlay.component.scss"]
})
export class LoadingOverlayComponent implements AfterContentInit {

    @Input() type: LoadingOverlayType = "Top";

    constructor(private root: ElementRef) {

    }

    ngAfterContentInit() {
        const parent = this.root.nativeElement.parentElement;
        if (!parent.style)
            parent.style = {};
        parent.style.position = "relative";
    }
}

export type LoadingOverlayType = "Full" | "Top";
