import { Injectable, EventEmitter } from '@angular/core';

@Injectable()
export class EventAggregator {

    private emitters = new Map<string, EventEmitter<any>>();

    subscribe(messageType: any, handler: (any) => void): Subscription {
        return this.getEmitter(messageType.name).subscribe(x => handler(x));
    }

    publish(message: any) {
        this.getEmitter(message.constructor.name).emit(message);
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

    subscribe(messageType: any, handler: (any) => void) {
        this.eventAggregator.subscribe(messageType, handler);
    }

    unsubscribeAll() {
        this.subscriptions.forEach(x => x.unsubscribe());
    }
}

export interface Subscription {
    unsubscribe();
}
