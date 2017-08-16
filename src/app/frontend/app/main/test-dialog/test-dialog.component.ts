import { Component, OnInit } from "@angular/core";
import { DialogBase } from "../dialog/dialog";

@Component({
    selector: "test-dialog",
    templateUrl: "./test-dialog.component.html",
    styleUrls: ["./test-dialog.component.scss"]
})
export class TestDialogComponent extends DialogBase<void, RebaseAccessDeniedResponse> {


    constructor() {
        super();
    }

    onInit(input: void): void {

    }

    onAbortClicked() {
        this.close("Abort");
    }

    onRetryClicked() {
        this.close("Retry");
    }

}

export type RebaseAccessDeniedResponse = "Retry" | "Abort";
