import { Line, LaneSwitchPosition, HistoryEntryBase } from "../model/model";

export class LineRangeQueryHelper {

    private lineIndex: { [lineIndex: number]: Line[]; } = [];
    private lines: Line[];

    constructor(private entries: HistoryEntryBase[]) {
        this.updateIndex();
    }

    private updateIndex() {
        if (!this.entries) return;
        const lines = [];
        this.lineIndex = [];

        for (const entry of this.entries) {
            for (const parent of entry.parents) {
                const line = new Line();
                line.indexStart = entry.index;
                line.laneStart = entry.lane;
                line.indexEnd = parent.index;
                line.laneEnd = parent.lane;
                line.laneSwitchPosition = entry.parents[0] === parent ? LaneSwitchPosition.End : LaneSwitchPosition.Start;
                lines.push(line);
            }
        }

        this.lines = this.optimizeLines(lines);
    }

    getLinesInRange(startX: number, startY: number, endX: number, endY: number): Line[] {
        const relevantLines: Line[] = [];
        for (const line of this.lines) {
            const start = Math.min(line.indexStart, line.indexEnd);
            const end = Math.max(line.indexStart, line.indexEnd);
            if (!(end < startY || start > endY)) {
                if (Math.max(line.laneStart, line.laneEnd) < startX ||
                    Math.min(line.laneStart, line.laneEnd) > endX)
                    continue;
                relevantLines.push(line);
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
