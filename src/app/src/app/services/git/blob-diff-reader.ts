import { Injectable } from "@angular/core";
import * as Rx from "rxjs";
import { GitRaw } from "./infrastructure/git-raw";

@Injectable()
export class BlobDiffReader {

    constructor(private gitRaw: GitRaw) { }

    getDiff(gitRepositoryPath: string, sourceBlob: string, destinationBlob: string): Rx.Observable<Hunk[]> {
        return this.gitRaw.run(gitRepositoryPath, ["diff", sourceBlob, destinationBlob, "--word-diff=porcelain", "--word-diff-regex=.", "-U99999999"]).map(x => {
            console.log(x.data);
            const lines = x.data.split("\n");
            const allHunks = [];
            let hunk: Hunk = undefined;
            for (const line of lines) {
                if (line.startsWith("@")) {
                    hunk = this.parseHunkStart(line);
                    allHunks.push(hunk);
                    continue;
                }
                if (!hunk)
                    continue;

                const predecessor = hunk.content.length > 0 ? hunk.content[hunk.content.length - 1] : undefined;

                const content = new HunkContent();
                content.text = line.substr(1);
                if (line[0] === " ") content.type = HunkContentType.Unchanged;
                if (line[0] === "+") content.type = HunkContentType.Added;
                if (line[0] === "-") content.type = HunkContentType.Removed;
                if (line[0] === "~") {
                    content.type = predecessor ? predecessor.type : HunkContentType.Unchanged;
                    content.text = "\n";
                }

                if (predecessor && predecessor.type === content.type) {
                    predecessor.text += content.text;
                } else {
                    hunk.content.push(content);
                }
            }
            return allHunks;
        });
    }

    private parseHunkStart(line: string): Hunk {
        const hunk = new Hunk();
        hunk.header = line;
        hunk.content = [];
        return hunk;
    }
}

export class Hunk {
    header: string;
    from: Range;
    to: Range;
    content: HunkContent[]
}

export class Range {
    start: number;
    length: number;
}

export class HunkContent {
    text: string;
    type: HunkContentType;
}

export enum HunkContentType {
    Unchanged,
    Added,
    Removed
}
