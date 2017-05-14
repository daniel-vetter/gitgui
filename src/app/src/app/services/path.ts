const remote = (<any>window).require("electron").remote;
const process = remote.process;

export class Path {

    static combine(...paths: string[]): string {
        let sum = "";
        let separator = undefined;
        let altSeparator = undefined;

         if (process.platform === "win32") {
             separator = "\\";
             altSeparator = "/";
         } else if (process.platform === "linux") {
             separator = "/";
             altSeparator = "\\";
         } else {
             throw Error("TODO: Add platform support.")
         }

        for (let path of paths) {
            path = path.replace(altSeparator, separator);
            if (sum.endsWith(separator) && !path.startsWith(separator))
                sum += path;
            if (!sum.endsWith(separator) && path.startsWith(separator))
                sum += path;
            if (!sum.endsWith(separator) && !path.startsWith(separator)) {
                if (sum === "")
                    sum = path;
                else
                    sum += separator + path;
            }
            if (sum.endsWith(separator) && path.startsWith(separator)) {
                let shorten = path;
                while (shorten.startsWith(separator)) {
                    shorten = shorten.substr(separator.length);
                }
                sum += shorten;
            }
        }
        return sum;
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
