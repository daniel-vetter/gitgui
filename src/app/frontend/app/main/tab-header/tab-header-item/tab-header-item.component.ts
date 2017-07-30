import { Component, OnInit, Input, EventEmitter, Output } from "@angular/core";

@Component({
    selector: "tab-header-item",
    templateUrl: "./tab-header-item.component.html",
    styleUrls: ["./tab-header-item.component.scss"]
})
export class TabHeaderItemComponent implements OnInit {

    @Input() closeable = true;
    @Input() selected = false;
    @Input() title = "";
    @Input() persistent = true;

    @Output() clicked = new EventEmitter();
    @Output() makePersistent = new EventEmitter();
    @Output() closed = new EventEmitter();

    constructor() { }

    ngOnInit() {
    }

    onTabClicked(event: MouseEvent) {
        if (event.button === 1) { // Middle mouse button
            this.closed.emit();
            return false;
        }
        this.clicked.emit();
    }

    onCloseClicked() {
        this.closed.emit();
    }

    onMakePersistentClicked() {
        this.makePersistent.emit();
    }
}
