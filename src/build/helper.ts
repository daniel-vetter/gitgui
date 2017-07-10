import * as child_process from "child_process";
import * as electronPackager from "electron-packager";

export function shellRun(command: string, workingDir: string = "."): Promise<number> {
    return new Promise<number>((d, r) => {
        child_process.spawn("cmd", ["/c", command], { cwd: workingDir, shell: true, stdio: "inherit" })
            .on("exit", code => { d(code); });
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