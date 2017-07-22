import * as fsExtra from "fs-extra";
import { shellRun, packager, run } from "./helper";
import * as electronPackager from "electron-packager";

(async function () {
    await run("Clean", async () => {
        fsExtra.removeSync("./build");
    });

    await run("Installing packages", async () => {
        await shellRun("npm install", "./src/app", true);
    });

    await run("Building app", async () => {
        await shellRun("npm run build", "./src/app");
    });

    await run("Running test", async () => {
        await shellRun("npm run test", "./src/app");
    });

    await run("Packaging", async () => {
        await packager({
            dir: "./build/app",
            out: "./build/dist",
			asar: true,
            name: "GitGui",
            icon: "./src/app/icon.ico",
            appCopyright: "Daniel Vetter 2017",
            electronVersion: "1.6.11",
            win32metadata: <electronPackager.Win32Metadata>{
                CompanyName: "Daniel Vetter",
                ProductName: "GitGui",
                OriginalFilename: "GitGui.exe",
                FileDescription: "GitGui"
            }
        });
    });

    process.exit(0);
})();
