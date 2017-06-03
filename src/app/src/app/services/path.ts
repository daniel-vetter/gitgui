const remote = (<any>window).require("electron").remote;
const process = remote.process;
const pathLib = remote.require("path");

export class Path {

    static combine(...paths: string[]): string {
        return pathLib.join(...paths);
    }

    static makeAbsolute(path: string, workingDirectory: string = undefined): string {
        if (workingDirectory)
            return pathLib.resolve(workingDirectory, path);
        return pathLib.resolve(path)
    }

    static getLastPart(path: string): string {
        const index = Math.max(path.lastIndexOf("\\"), path.lastIndexOf("/"));
        if (index === -1)
            return path;
        return path.substr(index + 1);
    }

    static getAllParts(path: string): string[] {
        return path.split(/\/|\\/);
    }

    static getExtension(path: string): string {
        const fileName = this.getLastPart(path);
        const index = fileName.lastIndexOf(".");
        if (index === -1)
            return "";
        return fileName.substr(index + 1);
    }

    static getDirectoryFromFilePath(path: string): string {
        const index = Math.max(path.lastIndexOf("\\"), path.lastIndexOf("/"));
        if (index === -1)
            return ".";
        return path.substr(0, index);
    }
}
