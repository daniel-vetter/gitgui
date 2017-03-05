import { EventEmitter } from "@angular/core";
export class Status {

    private _runningProcesses: StatusProcessTracker[] = [];
    onRunningProcessesChange = new EventEmitter();

    startProcess(description: string): StatusProcessTracker {
        const tracker = new StatusProcessTracker(description, x => {
            const index = this._runningProcesses.indexOf(x);
            if (index !== -1) {
                this._runningProcesses.splice(index, 1);
                this.onRunningProcessesChange.emit();
            }
        });

        this._runningProcesses.push(tracker);
        this.onRunningProcessesChange.emit();
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
