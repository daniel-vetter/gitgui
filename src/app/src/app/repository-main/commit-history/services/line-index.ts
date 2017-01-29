import { Line, HistoryCommit, LaneSwitchPosition } from "../model/model";
import { Injectable } from "@angular/core";

@Injectable()
export class LineIndex {

    private lineIndex: { [lineIndex: number]: Line[]; } = [];

    constructor(private commits: HistoryCommit[]) {
        this.updateIndex();
    }

    private updateIndex() {
        if (!this.commits) return;
        let lines = [];
        this.lineIndex = [];

        for (const commit of this.commits) {
            for (const parent of commit.parents) {
                const line = new Line();
                line.indexStart = commit.index;
                line.laneStart = commit.lane;
                line.indexEnd = parent.index;
                line.laneEnd = parent.lane;
                line.laneSwitchPosition = commit.parents[0] === parent ? LaneSwitchPosition.End : LaneSwitchPosition.Start;
                lines.push(line);
            }
        }

        lines = this.optimizeLines(lines);

        for (const line of lines) {
            const start = Math.min(line.indexStart, line.indexEnd);
            const end = Math.max(line.indexStart, line.indexEnd);
            for (let i = start; i <= end; i++) {
                if (!this.lineIndex[i]) {
                    this.lineIndex[i] = [];
                }
                this.lineIndex[i].push(line);
            }
        }
    }

    getLinesInRangeRange(startX: number, startY: number, endX: number, endY: number): Line[] {
        const relevantLines: Line[] = [];
        for (let i = startY; i < endY; i++) {
            if (this.lineIndex[i]) {
                for (const line of this.lineIndex[i]) {
                    if (Math.max(line.laneStart, line.laneEnd) < startX ||
                        Math.min(line.laneStart, line.laneEnd) > endX)
                        continue;
                    if (relevantLines.indexOf(line) === -1) {
                        relevantLines.push(line);
                    }
                }
            }
        }
        return relevantLines;
    }

    private optimizeLines(lines: Line[]): Line[] {
        if (lines.length === 0)
            return lines;

        const newList: Line[] = [];
        const lastMergabelLines: Line[] = [];
        for (let i = 0; i < lines.length; i++) {

            const curLine = lines[i];

            if (curLine.laneStart === curLine.laneEnd) {
                const lastLineOnThisLane = lastMergabelLines[curLine.laneStart];

                if (lastLineOnThisLane &&
                    curLine.indexStart === lastLineOnThisLane.indexEnd &&
                    curLine.laneStart === curLine.laneEnd &&
                    lastLineOnThisLane.laneStart === lastLineOnThisLane.laneEnd &&
                    curLine.laneStart === lastLineOnThisLane.laneEnd) {
                    lastLineOnThisLane.indexEnd = curLine.indexEnd;
                } else {
                    lastMergabelLines[curLine.laneStart] = curLine;
                    newList.push(curLine);
                }


            } else {
                newList.push(curLine);
            }
        }

        return newList;
    }
}
