import { Injectable, NgZone } from "@angular/core";
import { Observable } from "rxjs";
import * as Rx from "rxjs";
import { spawn } from "child_process";
import { ProcessStartRequest, PROCESS_START_REQUEST, PROCESS_START_RESPONSE, ProcessStartResponse, PROCESS_START_RESPONSE_TYPE_EXIT, PROCESS_START_RESPONSE_TYPE_STDOUT, PROCESS_START_RESPONSE_TYPE_STDERR } from "../../../../../../shared/ipc-interfaces/process-start";
const { ipcRenderer } = (<any>window).require("electron");

declare var TextDecoder;

@Injectable()
export class Process {

    private lastId = 0;
    private runningRequest = new Map<number, Rx.Subscriber<ProcessStatus>>();

    constructor(private zone: NgZone) {
        ipcRenderer.on(PROCESS_START_RESPONSE, (event, args) => {
            this.onIncommingResponse(args);
        })
    }

    run(command: string, args: string[], workDirectory: string): Observable<ProcessStatus> {

        const id = ++this.lastId;

        const oberservable = Rx.Observable.create((subscriber: Rx.Subscriber<ProcessStatus>) => {
            this.runningRequest.set(id, subscriber);
        })

        ipcRenderer.send(PROCESS_START_REQUEST, <ProcessStartRequest>{
            id: id,
            command: command,
            args: args,
            workDirectory: workDirectory
        });

        return oberservable;
    }

    private onIncommingResponse(arg: ProcessStartResponse) {
        const subscriber = this.runningRequest.get(arg.id);

        if (arg.type === PROCESS_START_RESPONSE_TYPE_EXIT) {
            this.zone.run(() => {
                subscriber.next(new ProcessRunExit(arg.code));
                subscriber.complete();
                this.runningRequest.delete(arg.id);
            });
        }

        if (arg.type === PROCESS_START_RESPONSE_TYPE_STDOUT) {
            this.zone.run(() => {
                subscriber.next(new ProcessRunStdOut(arg.data));
            });
        }

        if (arg.type === PROCESS_START_RESPONSE_TYPE_STDERR) {
            this.zone.run(() => {
                subscriber.next(new ProcessRunErrOut(arg.data));
            });
        }
    }

    runAndWait(pathToApp: string, args: string[], workDirectory: string): Rx.Observable<ProcessResult> {
        const data: string[] = [];
        return Rx.Observable.create(subscriber => {

            return this.run(pathToApp, args, workDirectory).subscribe(x => {

                if (x instanceof ProcessRunStdOut || x instanceof ProcessRunErrOut) {
                    // Save all data block for later concatenation.
                    data.push(x.data);
                } else if (x instanceof ProcessRunExit) {
                    // Calculate the full data length.
                    let totalCount = 0;
                    for (const item of data) {
                        totalCount += item.length;
                    }

                    // Create the end result.
                    const result = new ProcessResult();
                    result.exitCode = x.code;
                    result.data = data.join("");
                    subscriber.next(result);
                    subscriber.complete();
                } else {
                    throw new Error("invalid type");
                }
            });
        });
    }
}

export class ProcessRunStdOut {
    constructor(public data: string) { }
}

export class ProcessRunErrOut {
    constructor(public data: string) { }
}

export class ProcessRunExit {
    constructor(public code: number) { }
}

export type ProcessStatus = ProcessRunStdOut | ProcessRunErrOut | ProcessRunExit;

export class ProcessResult {
    exitCode: number;
    data: string;
}
