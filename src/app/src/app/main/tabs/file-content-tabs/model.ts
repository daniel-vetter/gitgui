import { RepositoryCommit } from "../../../services/git/model";

export abstract class FileRef {
    constructor(public path: string) {}
    public static FromDisk(path: string) { return new DiskFileRef(path); }
    public static FromIndex(path: string) { return new IndexFileRef(path); }
    public static CommitIndex(commit: RepositoryCommit, path: string) { return new CommitFileRef(commit, path); }
}

export class DiskFileRef extends FileRef {
}

export class IndexFileRef extends FileRef {
}

export class CommitFileRef extends FileRef {
    constructor(public commit: RepositoryCommit, public path: string) {
        super(path);
    }
}