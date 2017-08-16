import { AppComponent } from "../../app.component";
import { Type, ComponentFactoryResolver, Component } from "@angular/core";
import { Observable } from "rxjs";
import * as Rx from "rxjs";

export class Dialog {

    onDialogCreated: Rx.Observable<DialogCreateRequest>;
    private onDialogCreatedSubscriber: Rx.Subscriber<DialogCreateRequest>;

    constructor() {
        const observable = new Rx.Observable<DialogCreateRequest>(x => this.onDialogCreatedSubscriber = x).publish();
        observable.connect();
        this.onDialogCreated = observable;
    }

    create<TInput, TOutput, T extends DialogBase<TInput, TOutput>>(c: Type<DialogBase<TInput, TOutput>>): DialogItem<TInput, TOutput> {
        const callbacks = new DialogItemCallbacks();
        const dialogItem = new DialogItem<TInput, TOutput>(c, callbacks);
        this.onDialogCreatedSubscriber.next({ dialogItem: dialogItem, callbacks: callbacks })
        return dialogItem;
    }
}

export class DialogItem<TInput, TOutput> {

    private closeResolver: (x: TOutput) => void;

    constructor(public componentType: Type<DialogBase<TInput, TOutput>>,
        private callbacks: DialogItemCallbacks) { }

    showModal(input: TInput): Promise<TOutput> {
        this.callbacks.onShow(input);
        return new Promise<TOutput>(x => this.closeResolver = x);
    }

    close(output: TOutput) {
        this.callbacks.onClose(output);
        this.closeResolver(output);
    }
}

export class DialogItemCallbacks {
    onShow: (input: any) => void;
    onClose: (output: any) => void;
}

export interface DialogCreateRequest {
    dialogItem: DialogItem<any, any>;
    callbacks: DialogItemCallbacks;
}

export abstract class DialogBase<TInput, TOutput> {
    dialogItem: DialogItem<any, any>;
    public close(result: TOutput) {
        this.dialogItem.close(result);
    };
    abstract onInit(input: TInput): void;
}
