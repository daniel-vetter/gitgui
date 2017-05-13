import { Injectable } from "@angular/core";
import * as Rx from "rxjs";
import { GitRaw } from "../infrastructure/git-raw";

@Injectable()
export class ObjectDiffReader {

    constructor(private gitRaw: GitRaw) { }

    getDiff(gitRepositoryPath: string, sourceObjectId: string, destinationObjectId: string): Rx.Observable<DiffResult> {
        const params = ["diff", sourceObjectId, destinationObjectId, "--word-diff=porcelain", "--word-diff-regex=.", "-U99999999"];
        return this.gitRaw.run(gitRepositoryPath, params).map(x => {
            const lines = x.data.split("\n");
            const result = new DiffResult();
            let hunk: Hunk = undefined;
            for (const line of lines) {
                if (line.startsWith("@")) {
                    hunk = this.parseHunkStart(line);
                    result.hunks.push(hunk);
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

            if (result.hunks.length === 0) {
                result.isBinary = lines.filter(x => x.startsWith("Binary files") && x.endsWith("differ")).length === 1;
            }

            return result;
        });
    }

    private parseHunkStart(line: string): Hunk {
        const hunk = new Hunk();
        hunk.header = line;
        hunk.content = [];
        return hunk;
    }
}

export class DiffResult {
    isBinary: boolean;
    hunks: Hunk[] = [];
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
