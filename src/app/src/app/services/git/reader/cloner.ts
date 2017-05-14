import { GitRaw } from "../infrastructure/git-raw";
import { Platform } from "../../platform";
import { Injectable } from "@angular/core";
import { FileSystem } from "../../file-system";

@Injectable()
export class Cloner {

    constructor(private gitRaw: GitRaw,
        private platform: Platform,
        private fileSystem: FileSystem) {
    }

    async cloneRepositoryFromUrl(url: string, targetPath: string): Promise<boolean> {
        this.fileSystem.ensureDirectoryExists(targetPath);
        return (await this.gitRaw.run(targetPath, ["clone", url])).exitCode === 0;
    }
}
