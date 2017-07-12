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
        } else throw new Error("Unsupported platform");


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

export async function run(title: string, action: () => Promise<any>) {

    console.log("\x1b[1m\x1b[32m-------------------------------------------------------------------------------\x1b[0m");
    console.log("\x1b[1m\x1b[32m  " + title + "\x1b[0m");
    console.log("\x1b[1m\x1b[32m-------------------------------------------------------------------------------\x1b[0m");

    try {
        await action();
        console.log("");
        console.log("");
    } catch(e) {
        if (e instanceof Error) {
            console.error(e.name + ": " + e.message);
        } else {
            console.error(e);
        }

        console.log("");
        console.log("");
        console.log("\x1b[1m\x1b[31mBuild script failed.\x1b[0m");

        process.exit(1);
    }
}