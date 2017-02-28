import { Injectable, EventEmitter } from "@angular/core";
import { AppEvents } from "../model/events";

@Injectable()
export class EventAggregator {

    private emitters = new Map<string, EventEmitter<any>>();

    subscribe<K extends keyof AppEvents>(type: K, handler: (ev: AppEvents[K]) => void): Subscription {
        return this.getEmitter(type).subscribe(x => handler(x));
    }

    publish<K extends keyof AppEvents>(type: K, message: AppEvents[K] = undefined): void {
        this.getEmitter(type).emit(message);
    }

    private getEmitter(messageType: string) {
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
    unsubscribe();
}
