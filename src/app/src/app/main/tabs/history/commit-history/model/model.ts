import { RepositoryCommit } from "../../../../../services/git/model";

export class HistoryRepository {
    totalLaneCount = 0;
    entries: HistoryEntryBase[];
    userName: string;
    userMail: string;
}

export class HistoryEntryBase {
    index: number;
    lane: number;
    parents: HistoryEntryBase[] = [];
    children: HistoryEntryBase[] = [];
}

export class HistoryCurrentChangesEntry extends HistoryEntryBase {
    addedFileCount: number = 0;
    removedFileCount: number = 0;
    changedFileCount: number = 0;
}

export class HistoryCommitEntry extends HistoryEntryBase {
    hash: string;
    title: string;
    committerName: string;
    committerMail: string;
    commitDate: Date;
    authorName: string;
    authorMail: string;
    authorDate: Date;
    tags: HistoryTag[] = [];
    branches: HistoryBranch[] = [];
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
