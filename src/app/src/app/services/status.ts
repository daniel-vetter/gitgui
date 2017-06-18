import { EventEmitter } from "@angular/core";
import * as Rx from "rxjs";
export class Status {

    private _runningProcesses: StatusProcessTracker[] = [];
    onRunningProcessesChange = new Rx.Subject<void>();

    startProcess(description: string, workToDo: (() => void) | (() => Promise<void>) | undefined = undefined): StatusProcessTracker {
        const tracker = new StatusProcessTracker(description, x => {
            const index = this._runningProcesses.indexOf(x);
            if (index !== -1) {
                this._runningProcesses.splice(index, 1);
                this.onRunningProcessesChange.next();
            }
        });

        this._runningProcesses.push(tracker);
        this.onRunningProcessesChange.next();

        if (workToDo) {
            let result: any;
            try {
                result = workToDo();
                if (result instanceof Promise) {
                    result.then(() => tracker.completed(), (e) => { tracker.completed(); throw e });
                }
            }
            finally {
                if (!(result instanceof Promise))
                    tracker.completed();
            }
        }

        return tracker;
    }

    get runningProcesses() {
        return Array.from(this._runningProcesses);
    }
}

export class StatusProcessTracker {

    constructor(private desc: string, private onEnd: (instance: StatusProcessTracker) => void) {
    }

    completed() {
        this.onEnd(this);
    }

    get description() {
        return this.desc;
    }
}
