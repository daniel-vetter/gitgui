import { HistoryRepository, HistoryCommit, HistoryTag, HistoryBranch } from "../model/model";
import { Repository, RepositoryCommit, RepositoryTagRef, RepositoryHeadRef, RepositoryRemoteRef } from "../../../model/model";
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
        if (repository === undefined) 
            return historyRepository;

        for (let i = 0; i < repository.commits.length; i++) {
            const commit = repository.commits[i];
            const r = new HistoryCommit();
            r.repositoryCommit = commit;
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
            r.tags = this.getTagsFromCommit(commit);
            r.branches = this.getBranchesFromCommit(commit);
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

        this.laneAssigner.assignLanes(historyRepository);

        return historyRepository;
    }

    private getTagsFromCommit(commit: RepositoryCommit): HistoryTag[] {
        return commit.refs
            .filter(x => x instanceof RepositoryTagRef)
            .map(x => {
                const tag = new HistoryTag();
                tag.name = x.shortName;
                return tag;
            });
    }

    private getBranchesFromCommit(commit: RepositoryCommit): HistoryBranch[] {
        const result: HistoryBranch[] = [];


        const allLocalRefs = <RepositoryHeadRef[]>commit.refs.filter(x => x instanceof RepositoryHeadRef);
        const allRemoteRefs = <RepositoryRemoteRef[]>commit.refs.filter(x => x instanceof RepositoryRemoteRef);
        const refToSkip: RepositoryRemoteRef[] = [];

        for (const ref of allLocalRefs) {
            const historyBranch = new HistoryBranch();
            historyBranch.localName = ref.shortName;

            // if the upstream of this ref is also on this commit, set the branches remote name
            if (ref.upstream && ref.upstream.commit === commit) {
                historyBranch.remoteName = ref.upstream.shortName;
                refToSkip.push(ref.upstream);
            }
            result.push(historyBranch);
        }

        for (const ref of allRemoteRefs) {
            if (refToSkip.indexOf(ref) !== -1)
                continue;
            const historyBranch = new HistoryBranch();
            historyBranch.remoteName = ref.remote + "/" + ref.shortName;
            result.push(historyBranch);
        }
        return result;
    }
}
