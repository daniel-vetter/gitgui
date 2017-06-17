import { EventEmitter } from "@angular/core";
import * as Rx from "rxjs";

export class Repository {
    status: RepositoryStatus;
    commits: RepositoryCommit[] = [];
    refs: RepositoryRef[] = [];
    location: string;
    head: RepositoryCommit;

    updateState = new RepositoryUpdateState();
}

export class RepositoryUpdateState {
    onUpdateStarted = new Rx.Subject<UpdatedElements>();
    onUpdateFinished = new Rx.Subject<UpdatedElements>();
    currentlyUpdatingElements: UpdatedElements | undefined;
}

export class UpdatedElements {
    constructor(public commits: boolean,
                public refs: boolean,
                public status: boolean,
                public head: boolean) {}
}

export class RepositoryStatus {
    isMerge: boolean;
    isRebase: boolean;
    indexChanges: IndexChangedFile[] = [];
    workTreeChanges: IndexChangedFile[] = [];
}

export class ChangedFile  {
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
    constructor(public path: string) {}
    public static fromDisk(path: string) { return new DiskFileRef(path); }
    public static fromIndex(path: string) { return new IndexFileRef(path); }
    public static fromHead(path: string) { return new HeadFileRef(path); }
    public static fromBlob(blob: string, path: string) { return new BlobFileRef(blob, path); }
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
