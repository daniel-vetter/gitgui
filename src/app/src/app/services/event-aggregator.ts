import { Injectable, EventEmitter } from '@angular/core';

@Injectable()
export class EventAggregator {

    private emitters = new Map<string, EventEmitter<any>>();

    subscribe(messageType: string, handler: (any) => void): Subscription {
        return this.getEmitter(messageType).subscribe(x => handler(x));
    }

    publish(messageType: string, message: any) {
        this.getEmitter(messageType).emit(message);
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

    subscribe(messageType: string, handler: (any) => void) {
        this.eventAggregator.subscribe(messageType, handler);
    }

    unsubscribeAll() {
        this.subscriptions.forEach(x => x.unsubscribe());
    }
}

export interface Subscription {
    unsubscribe();
}
