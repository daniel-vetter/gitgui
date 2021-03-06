import { Injectable, EventEmitter } from "@angular/core";
import { AppEvents, AppEvent } from "../model/events";
import * as Rx from "rxjs";

@Injectable()
export class EventAggregator {

    private emitters = new Map<string, Rx.Subject<any>>();

    subscribe<K extends keyof AppEvents>(type: K, handler: (ev: AppEvents[K]) => void): Subscription {
        return this.getEmitter(type).subscribe(x => handler(x));
    }

    publish<K extends keyof AppEvents>(type: K, message: AppEvents[K] = new AppEvent()): void {
        this.getEmitter(type).next(message);
    }

    private getEmitter(messageType: string): Rx.Subject<any> {
        let emitter = this.emitters.get(messageType);
        if (!emitter) {
            emitter = new EventEmitter<any>();
            this.emitters.set(messageType, emitter);
        }
        return emitter;
    }
}

export class SubscriptionBag {
    private subscriptions: Subscription[] = [];

    constructor(private eventAggregator: EventAggregator) { }

    subscribe<K extends keyof AppEvents>(type: K, handler: (ev: AppEvents[K]) => void): void {
        this.subscriptions.push(this.eventAggregator.subscribe(type, handler));
    }

    unsubscribeAll() {
        this.subscriptions.forEach(x => x.unsubscribe());
    }
}

export interface Subscription {
    unsubscribe(): void;
}
