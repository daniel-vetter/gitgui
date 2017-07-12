import * as fsExtra from "fs-extra";
import { shellRun, packager, run } from "./helper";
import * as electronPackager from "electron-packager";

(async function () {
    await run("Clean", async () => {
        fsExtra.removeSync("./build");
    });

    await run("Installing packages", async () => {
        await shellRun("npm install", "./src/main", true);
        await shellRun("npm install", "./src/app", true);
    });

    await run("Building app", async () => {
        await shellRun("node ./node_modules/@angular/cli/bin/ng build --prod --progress=false", "./src/app");
        await shellRun("node ./node_modules/webpack/bin/webpack.js", "./src/main");
    });

    await run("Running test", async () => {
        await shellRun("node ./node_modules/@angular/cli/bin/ng test --single-run --progress=false", "./src/app");
    });

    await run("Packaging", async () => {
        await packager({
            dir: "./build/app",
            out: "./build/dist",
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
