export class Repository {
    status: RepositoryStatus;
    commits: RepositoryCommit[];
    refs: RepositoryRef[];
    location: string;
}

export class RepositoryStatus {
    isMerge: boolean;
    isRebase: boolean;
    unstaged: FileStatus[];
    staged: FileStatus[];
}

export class FileStatus {
    fileName: string;
    type: FileStatusType;
}

export enum FileStatusType {
    Added,
    Modified,
    Moved,
    Removed
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
    parents: RepositoryCommit[];
    children: RepositoryCommit[];
}

export class RepositoryRef {
}
