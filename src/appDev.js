const spawn = require('child_process').spawn;

if (process.platform === "linux") {
    spawn("gnome-terminal", ["-e", "node node_modules/@angular/cli/bin/ng build -w"], { cwd: "./app" });
    spawn("gnome-terminal", ["-e", "node node_modules/webpack/bin/webpack.js -w"], { cwd: "./main" });
}
else if (process.platform === "win32") {
    spawn("cmd", ["/c", "start node node_modules/@angular/cli/bin/ng build -w"], { cwd: "./app" });
    spawn("cmd", ["/c", "start node node_modules/webpack/bin/webpack.js -w"], { cwd: "./main" });
} else {
    console.log("platform not supported");
}
