import { EventEmitter } from "@angular/core";
import * as Rx from "rxjs";
import { RepositoryConfig } from "./reader/config-reader";

export class Repository {
    status: RepositoryStatus;
    commits: RepositoryCommit[] = [];
    refs: RepositoryRef[] = [];
    head: RepositoryCommit;
    config: RepositoryConfig;

    updateState = new RepositoryUpdateState();

    constructor(public location: string) {
    }
}

export class RepositoryUpdateState {
    onUpdateStarted = new Rx.Subject<UpdatedElements>();
    onUpdateFinished = new Rx.Subject<UpdatedElements>();
    isUpdating = false;
}

export class UpdatedElements {
    public commits = false;
    public refs = false;
    public status = false;
    public head = false;
    public config = false;
}

export class RepositoryStatus {
    isMerge: boolean;
    isRebase: boolean;
    indexChanges: IndexChangedFile[] = [];
    workTreeChanges: IndexChangedFile[] = [];
}

export class ChangedFile {
    type: FileChangeType;
    oldFile?: FileRef;
    newFile?: FileRef;
}

export class IndexChangedFile extends ChangedFile {
    isStaged: boolean;
}

export enum FileChangeType {
    Added = 1,
    Copied = 2,
    Deleted = 3,
    Modified = 4,
    Renamed = 5,
    TypeChange = 6,
    Unmerged = 7
}

export abstract class FileRef {
    public static fromDisk(path: string) { return new DiskFileRef(path); }
    public static fromIndex(path: string) { return new IndexFileRef(path); }
    public static fromHead(path: string) { return new HeadFileRef(path); }
    public static fromBlob(blob: string, path: string) { return new BlobFileRef(blob, path); }

    constructor(public path: string) { }
}

export class DiskFileRef extends FileRef {
}

export class IndexFileRef extends FileRef {
}

export class HeadFileRef extends FileRef {
}

export class BlobFileRef extends FileRef {
    constructor(public blob: string, public path: string) {
        super(path);
    }
}



export class RepositoryCommit {
    hash: string;
    title: string;
    committerName: string;
    committerMail: string;
    commitDate: Date;
    authorName: string;
    authorMail: string;
    authorDate: Date;
    parents: RepositoryCommit[] = [];
    refs: RepositoryRef[] = [];
    repository: Repository;
}

export class RepositoryRef {
    fullName: string;
    shortName: string;
    commit: RepositoryCommit;
}

export class RepositoryHeadRef extends RepositoryRef {
    upstream: RepositoryRemoteRef;
}

export class RepositoryTagRef extends RepositoryRef {
    annotationHash: string;
}

export class RepositoryRemoteRef extends RepositoryRef {
    remote: string;
    downstreams: RepositoryHeadRef[] = [];
}
