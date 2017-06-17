import { Component, Input, EventEmitter, Output, OnChanges, OnInit } from "@angular/core";

@Component({
    selector: "check-box",
    templateUrl: "./check-box.component.html",
    styleUrls: ["./check-box.component.scss"]
})
export class CheckBoxComponent implements OnInit,  OnChanges {

    @Input() triState: boolean = false;
    @Input() checked: boolean | Intermediate = false;
    @Output() checkedChange = new EventEmitter<boolean | Intermediate>();

    showCheck: boolean = false;
    showIntermediate: boolean = false;

    ngOnInit() {
        this.update();
    }

    ngOnChanges(changes: any) {
        this.update();
    }

    onClick(event: MouseEvent) {

        if (this.checked === undefined || this.checked === false) {
            this.checked = true;
        } else if (this.checked === true) {
            if (this.triState)
                this.checked = "Intermediate";
            else
                this.checked = false;
        } else if (this.checked === "Intermediate") {
            this.checked = false;
        } else {
            throw new Error("invalid checkbox state: " + this.checked);
        }

        this.checkedChange.emit(this.checked);
        this.update();
        event.stopPropagation();
        return false;
    }

    private update() {
        this.showCheck = this.checked === true;
        this.showIntermediate = this.checked === "Intermediate";
    }
}

export type Intermediate = "Intermediate";
