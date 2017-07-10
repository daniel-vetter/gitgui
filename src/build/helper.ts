import * as child_process from "child_process";
import * as electronPackager from "electron-packager";

export function shellRun(command: string, workingDir: string = ".", expectedExitCode = 0): Promise<number> {
    return new Promise<number>((onDone, onError) => {

        let shellName = undefined;
        let args = [];

        if (process.platform === "win32") {
            shellName = "cmd";
            args = ["/c", command];
        } else if (process.platform === "linux") {
            shellName = "bash";
            args = ["-c", "\"" + command + "\""]
        } else throw new Error("Unsported platform");


        child_process.spawn(shellName, args, {
            cwd: workingDir,
            shell: true,
            stdio: "inherit"
        }).on("exit", code => {
            if (code === expectedExitCode) {
                onDone(code);
            } else {
                onError("Unexpected exit code: " + code);
            }
        });
    });
}

export function packager(options: electronPackager.Options): Promise<void> {
    return new Promise<void>((onDone, onError) => {
        electronPackager(options, error => {
            if (error) {
                onError(error);
            } else {
                onDone();
            }
        });
    });
}