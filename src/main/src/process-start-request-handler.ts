import { ipcMain } from "electron";
import { spawn } from "child_process";
import { ProcessStartRequest, PROCESS_START_REQUEST, PROCESS_START_RESPONSE, ProcessStartResponse, PROCESS_START_RESPONSE_TYPE_EXIT, PROCESS_START_RESPONSE_TYPE_STDOUT, PROCESS_START_RESPONSE_TYPE_STDERR } from "../../shared/ipc-interfaces/process-start";

export class ProcessStartRequestHandler {

    setup() {
        ipcMain.on(PROCESS_START_REQUEST, (event, arg) => { this.onProcessStart(event, arg) });
    }

    private onProcessStart(event, arg: ProcessStartRequest) {
        const process = spawn(arg.command, arg.args, { cwd: arg.workDirectory })
        process.on("exit", code => {
            event.sender.send(PROCESS_START_RESPONSE, <ProcessStartResponse>{
                id: arg.id,
                type: PROCESS_START_RESPONSE_TYPE_EXIT,
                code: code
            });
        });

        process.stdout.on("data", data => {
            event.sender.send(PROCESS_START_RESPONSE, <ProcessStartResponse>{
                id: arg.id,
                type: PROCESS_START_RESPONSE_TYPE_STDOUT,
                data: (<any>data).toString("utf8")
            });
        });

        process.stderr.on("data", data => {
            event.sender.send(PROCESS_START_RESPONSE, <ProcessStartResponse>{
                id: arg.id,
                type: PROCESS_START_RESPONSE_TYPE_STDERR,
                data: (<any>data).toString("utf8")
            });
        });
    }
}