import { HistoryRepository, HistoryCommit, HistoryHeadRef, HistoryRemoteRef } from "../model/model";
import { Repository, RepositoryCommit, RepositoryHeadRef, RepositoryRemoteRef } from "../../../model/model";
import { LaneAssigner } from "./lane-assigner";
import { Injectable } from "@angular/core";

@Injectable()
export class RepositoryToHistoryRepositoryMapper {

    constructor(private laneAssigner: LaneAssigner) {
    }

    map(repository: Repository): HistoryRepository {
        const historyRepository = new HistoryRepository();
        historyRepository.commits = [];
        const hashToHistoryCommitMap = new Map<string, HistoryCommit>();
        const hashToRepositoryCommitMap = new Map<string, RepositoryCommit>();
        for (let i = 0; i < repository.commits.length; i++) {
            const commit = repository.commits[i];
            const r = new HistoryCommit();
            r.index = i;
            r.hash = commit.hash;
            r.title = commit.title;
            r.committerName = commit.committerName;
            r.committerMail = commit.committerMail;
            r.commitDate = commit.commitDate;
            r.authorName = commit.authorName;
            r.authorMail = commit.authorMail;
            r.authorDate = commit.authorDate;
            r.parents = [];
            r.children = [];
            r.refs = [];
            historyRepository.commits.push(r);
            hashToHistoryCommitMap.set(r.hash, r);
            hashToRepositoryCommitMap.set(commit.hash, commit);
        }

        for (const historyCommit of historyRepository.commits) {
            const repositoryCommit = hashToRepositoryCommitMap.get(historyCommit.hash);
            for (const parent of repositoryCommit.parents) {
                const parentHistoryCommit = hashToHistoryCommitMap.get(parent.hash)
                historyCommit.parents.push(parentHistoryCommit);
                parentHistoryCommit.children.push(historyCommit);
            }
        }

        for (const ref of repository.refs) {
            if (!ref.commit)
                continue;
            const historyCommit = hashToHistoryCommitMap.get(ref.commit.hash);
            if (ref instanceof RepositoryHeadRef) {
                const historyRef = new HistoryHeadRef();
                historyRef.shortName = ref.shortName;
                historyRef.fullName = ref.fullName;
                historyCommit.refs.push(historyRef);
            }
            if (ref instanceof RepositoryRemoteRef) {
                const historyRef = new HistoryRemoteRef();
                historyRef.shortName = ref.shortName;
                historyRef.fullName = ref.fullName;
                historyCommit.refs.push(historyRef);
            }
        }

        this.laneAssigner.assignLanes(historyRepository);

        return historyRepository;
    }
}
