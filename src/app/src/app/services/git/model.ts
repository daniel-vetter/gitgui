import { EventEmitter } from "@angular/core";

export class Repository {
    status: RepositoryStatus;
    commits: RepositoryCommit[] = [];
    refs: RepositoryRef[] = [];
    location: string;
    head: RepositoryCommit;

    onStatusChanged = new EventEmitter();
}

export class RepositoryStatus {
    isMerge: boolean;
    isRebase: boolean;
    indexFiles: IndexFile[] = [];
}

export class IndexFile {
    path: string;
    indexChangeType: IndexFileChangeType;
    workTreeChangeType: IndexFileChangeType;
}

export enum IndexFileChangeType {
    Unmodified,
    Modified,
    Added,
    Deleted,
    Renamed,
    Copied,
    UpdatedButUnmerged
}

export class ChangedFile  {
    type: FileChangeType;
    oldFile: FileRef;
    newFile: FileRef;
}

export abstract class FileRef {
    constructor(public path: string) {}
    public static fromDisk(path: string) { return new DiskFileRef(path); }
    public static fromIndex(path: string) { return new IndexFileRef(path); }
    public static fromBlob(blob: string, path: string) { return new BlobFileRef(blob, path); }
}

export class DiskFileRef extends FileRef {
}

export class IndexFileRef extends FileRef {
}

export class BlobFileRef extends FileRef {
    constructor(public blob: string, public path: string) {
        super(path);
    }
}

export enum FileChangeType {
    Added,
    Copied,
    Deleted,
    Modified,
    Renamed,
    TypeChange,
    Unmerged,
    Unknown,
    Broken
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
    children: RepositoryCommit[] = [];
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
