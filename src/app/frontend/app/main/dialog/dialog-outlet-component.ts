import { Component, OnInit, OnDestroy } from "@angular/core";
import { Dialog, DialogItem, DialogCreateRequest } from "./dialog";
import { Subscription } from "../../services/event-aggregator";
import * as Rx from "rxjs";
import { trigger, state, style, transition, animate } from "@angular/animations";

@Component({
    selector: "dialog-outlet",
    templateUrl: "./dialog-outlet-component.html",
    styleUrls: ["./dialog-outlet-component.scss"],
    animations: [
        trigger("opacityInOut", [
            state("*", style({
                opacity: 1
            })),
            state("void", style({
                opacity: 0
            })),
            transition("void <=> *", [
                animate("100ms linear")
            ])
        ]),
        trigger("flyInOut", [
            state("*", style({
                transform: "scale(1)",
                opacity: 1
            })),
            state("void", style({
                transform: "scale(0.9)",
                opacity: 0
            })),
            transition("void <=> *", [
                animate("100ms linear")
            ])
        ])
    ]
})
export class DialogOutletComponent implements OnInit, OnDestroy {

    dialogs: DialogViewModel[] = [];
    private onDialogOpenedSubscription: Rx.Subscription;

    constructor(private dialog: Dialog) {}

    ngOnInit(): void {
        this.onDialogOpenedSubscription = this.dialog.onDialogCreated.subscribe(x => this.onNewDialog(x));
    }

    ngOnDestroy() {
        this.onDialogOpenedSubscription.unsubscribe();
    }

    private onNewDialog(request: DialogCreateRequest) {
        request.callbacks.onShow = (input) => this.onShowDialog(request.dialogItem, input);
        request.callbacks.onClose = (output) => this.onCloseDialog(request.dialogItem, output);
    }

    private onShowDialog(dialogItem: DialogItem<any, any, any>, input: any) {
        this.dialogs.push({
            dialogItem: dialogItem,
            input: input
        });
    }

    private onCloseDialog(dialogItem: DialogItem<any, any, any>, output: any) {
        this.dialogs = this.dialogs.filter(x => x.dialogItem !== dialogItem);
    }
}

export interface DialogViewModel {
    dialogItem: DialogItem<any, any, any>;
    input: any;
}
