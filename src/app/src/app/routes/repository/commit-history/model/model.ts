import { RepositoryCommit } from "../../../model/model";

export class HistoryRepository {
    totalLaneCount = 0;
    commits: HistoryCommit[];
}

export class HistoryCommit {
    hash: string;
    title: string;
    committerName: string;
    committerMail: string;
    commitDate: Date;
    authorName: string;
    authorMail: string;
    authorDate: Date;
    parents: HistoryCommit[];
    children: HistoryCommit[];
    index: number;
    lane: number;
    tags: HistoryTag[];
    branches: HistoryBranch[];
    repositoryCommit: RepositoryCommit;
}

export class HistoryTag {
    name: string;
}

export class HistoryBranch {
    localName: string;
    remoteName: string;
}

export class VisibleRange {
    constructor(public start: number, public end: number) {
    }
}

export class Line {
    indexStart: number;
    indexEnd: number;
    laneStart: number;
    laneEnd: number;
    laneSwitchPosition: LaneSwitchPosition;
}

export enum LaneSwitchPosition {
    Start,
    End
}
