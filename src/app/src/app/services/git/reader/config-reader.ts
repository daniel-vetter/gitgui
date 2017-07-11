import { Injectable } from "@angular/core";
import { GitRaw } from "../infrastructure/git-raw";
import { Repository } from "../model";
@Injectable()
export class ConfigReader {
    constructor(private gitRaw: GitRaw) {

    }

    async readConfig(repositoryPath: string): Promise<RepositoryConfig> {
        const data = await this.gitRaw.run(repositoryPath, ["config", "--list", "-z"]);
        const lines = data.data.split("\0").map(x => x.trim())
        const config = new RepositoryConfig();

        for (const line of lines) {
            if (line.trim() === "")
                continue;
            var firstLineEnd = line.indexOf("\n");
            if (firstLineEnd === -1) {
                console.log("Skipped config line: " + line);
                continue;
            }

            const key = line.substr(0, firstLineEnd).toLowerCase();
            const value = line.substr(firstLineEnd + 1);

            if (key === "user.name") config.userName = value;
            if (key === "user.email") config.userMail = value;
        }

        return config;
    }
}

export class RepositoryConfig {
    userName: string = "";
    userMail: string = "";
}
