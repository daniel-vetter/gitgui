import { Injectable, NgZone } from "@angular/core";
import { Observable } from "rxjs";
import * as Rxjs from "rxjs";
const remote = (<any>window).require("electron").remote;
const child_process = remote.require("child_process");

declare var TextDecoder;

@Injectable()
export class Process {

    constructor(private zone: NgZone) { }

    run(pathToApp: string, args: string[], workDirectory: string): Observable<ProcessRunStdOut | ProcessRunErrOut | ProcessRunExit> {
        const list = [];
        return Rxjs.Observable.create(subscriber => {
            const p = child_process.spawn(pathToApp, args, { cwd: workDirectory });
            p.stdout.on("data", data => {
                list.push(new ProcessRunStdOut(data));
            });
            p.stderr.on("data", data => {
                list.push(new ProcessRunErrOut(data));
            });
            p.on("exit", code => {
                list.push(new ProcessRunExit(code));
                this.zone.run(() => {
                    for (let d of list) {
                        subscriber.next(d);
                    }
                    subscriber.complete();
                });
            });
        });
    }

    runAndWait(pathToApp: string, args: string[], workDirectory: string): Rxjs.Observable<ProcessResult> {
        const data: Uint8Array[] = [];
        return Rxjs.Observable.create(subscriber => {

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

                    // Create a new buffer and fill it with all blocks
                    const totalBuffer = new Uint8Array(totalCount);
                    let offset = 0;
                    for (const item of data) {
                        totalBuffer.set(item, offset);
                        offset += item.length;
                    }

                    // TODO: Breaks on large buffers.
                    const content = new TextDecoder().decode(totalBuffer);

                    // Create the end result.
                    const result = new ProcessResult();
                    result.exitCode = x.code;
                    result.data = content;
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
    constructor(public data: Uint8Array) { }
}

export class ProcessRunErrOut {
    constructor(public data: Uint8Array) { }
}

export class ProcessRunExit {
    constructor(public code: number) { }
}

export class ProcessResult {
    exitCode: number;
    data: string;
}
