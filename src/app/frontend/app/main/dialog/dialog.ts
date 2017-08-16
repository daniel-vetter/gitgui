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

    create<TInput, TOutput, T extends DialogBase<TInput, TOutput>>(c: Type<DialogBase<TInput, TOutput>>): DialogItem<T, TInput, TOutput> {
        const callbacks = new DialogItemCallbacks();
        const dialogItem = new DialogItem<T, TInput, TOutput>(c, callbacks);
        this.onDialogCreatedSubscriber.next({ dialogItem: dialogItem, callbacks: callbacks })
        return dialogItem;
    }
}

export class DialogItem<TComponent, TInput, TOutput> {

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
    dialogItem: DialogItem<any, any, any>;
    callbacks: DialogItemCallbacks;
}

export abstract class DialogBase<TInput, TOutput> {
    public close: (result: TOutput) => void;
    abstract onInit(input: TInput): void;
}
