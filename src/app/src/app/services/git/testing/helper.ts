import { TestBed } from "@angular/core/testing";
import { Process } from "../infrastructure/process";
import { Path } from "app/services/path";
const remote = (<any>window).require("electron").remote;
const remoteProcess = remote.process;
const remoteOs = remote.require("os");

export function waitForPromise(action: () => Promise<any>) {
    return (done: any) => {
        try {
            const result = action();
            result.then(() => done());
            result.catch((e) => done.fail(e));
        } catch (e) {
            done.fail(e);
        }
    };
};


export async function run(cmd: string, expectedExitCode = 0): Promise<number> {
    const process = <Process>TestBed.get(Process);
    const result = await process.runAndWait(cmd, [], ".", true);
    if (expectedExitCode !== undefined) {
        if (expectedExitCode !== result.exitCode)
            throw new Error("Shell command \"" + cmd + "\" returned exit code " + result.exitCode + ". Expected was " + expectedExitCode + ".\n\nOutput\n---------------\n" + result.data + "\n---------------\n");
    }
    return result.exitCode;
}

export function getTempDirectory() {
    if (remoteProcess.platform === "win32") {
        return "C:\\GitGuiTests";
    } else if (remoteProcess.platform === "linux") {
        return Path.combine(remoteOs.homedir(), "GitGuiTests");
    } else throw new Error("Unsported platform");
}

