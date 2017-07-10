import * as fsExtra from "fs-extra";
import { shellRun, packager } from "./helper";
import * as electronPackager from "electron-packager";

(async function () {

    fsExtra.removeSync("./build");

    await shellRun("npm install", "./src/main");
    await shellRun("npm install", "./src/app");
    await shellRun("node ./node_modules/@angular/cli/bin/ng build -prod", "./src/app");
    await shellRun("node ./node_modules/webpack/bin/webpack.js", "./src/main");
    await shellRun("npm run  test-single-run", "./src/app");

    await packager({
        dir: "./build/app",
        out: "./build/dist",
        name: "GitGui",
        platform: "win32",
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
})();