import { Injectable } from "@angular/core";
import * as Rx from "rxjs";
import { GitRaw } from "../infrastructure/git-raw";
import { RepositoryCommit } from "../model";

@Injectable()
export class CommitsReader {

    constructor(private gitRaw: GitRaw) { }

    readAllCommits(repositoryPath: string): Rx.Observable<RepositoryCommit[]> {

        const prettyParts = ["ae", "an", "P", "s", "aD", "cD"];
        const args = ["rev-list", "--all", "--pretty=" + prettyParts.map(x => "%" + x).join("%n")];
        return this.gitRaw.run(repositoryPath, args).map(x => {
            const parts = x.data.split("\n");
            const allCommits: RepositoryCommit[] = [];
            const commitIndex = new Map<string, RepositoryCommit>();
            const parents = new Map<string, string[]>();
            for (let i = 0; i < parts.length - 1; i += prettyParts.length + 1) {
                const commit = new RepositoryCommit();
                commit.parents = [];
                commit.children = [];
                commit.hash = parts[i + 0];
                if (!commit.hash.startsWith("commit ")) {
                    throw new Error("not a commit: " + commit.hash);
                }
                commit.hash = commit.hash.substr("commit ".length);
                commit.authorMail = parts[i + 1];
                commit.authorName = parts[i + 2];
                parents.set(commit.hash, parts[i + 3].split(" "));
                commit.title = parts[i + 4];
                commit.authorDate = new Date(Date.parse(parts[i + 5]));
                commit.commitDate = new Date(Date.parse(parts[i + 6]));
                allCommits.push(commit);
                commitIndex.set(commit.hash, commit);
            }

            // Parents/Children
            parents.forEach((parentHashes, currentCommitHash) => {
                for (const parentHash of parentHashes) {
                    const parentCommit = commitIndex.get(parentHash);
                    if (!parentCommit) {
                        continue;
                    }
                    commitIndex.get(currentCommitHash).parents.push(commitIndex.get(parentHash));
                    if (commitIndex.get(parentHash)) {
                        commitIndex.get(parentHash).children.push(commitIndex.get(currentCommitHash));
                    }
                }
            });
            return allCommits;
        });
    }
}