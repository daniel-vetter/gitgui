import { HistoryRepository, HistoryCommitEntry, HistoryTag, HistoryBranch, HistoryCurrentChangesEntry } from "../model/model";
import { LaneAssigner } from "./lane-assigner";
import { Injectable } from "@angular/core";
import { RepositoryCommit, Repository, FileChangeType,
         RepositoryTagRef, RepositoryHeadRef, RepositoryRemoteRef } from "../../../../../services/git/model";

@Injectable()
export class RepositoryToHistoryRepositoryMapper {

    constructor(private laneAssigner: LaneAssigner) {
    }

    map(repository: Repository): HistoryRepository {
        const historyRepository = new HistoryRepository();
        historyRepository.entries = [];
        const hashToHistoryCommitMap = new Map<string, HistoryCommitEntry>();
        const hashToRepositoryCommitMap = new Map<string, RepositoryCommit>();
        if (repository === undefined)
            return historyRepository;

        // add "Current changes" entry
        if (repository.status.indexChanges.length > 0 ||
            repository.status.workTreeChanges.length > 0) {
            const entry = new HistoryCurrentChangesEntry();
            entry.index = 0;
            historyRepository.entries.push(entry);
        }

        // add all commits from the repository history
        for (let i = 0; i < repository.commits.length; i++) {
            const commit = repository.commits[i];
            const entry = new HistoryCommitEntry();
            entry.repositoryCommit = commit;
            entry.index = historyRepository.entries.length;
            entry.hash = commit.hash;
            entry.title = commit.title;
            entry.committerName = commit.committerName;
            entry.committerMail = commit.committerMail;
            entry.commitDate = commit.commitDate;
            entry.authorName = commit.authorName;
            entry.authorMail = commit.authorMail;
            entry.authorDate = commit.authorDate;
            entry.tags = this.getTagsFromCommit(commit);
            entry.branches = this.getBranchesFromCommit(commit);
            historyRepository.entries.push(entry);
            hashToHistoryCommitMap.set(entry.hash, entry);
            hashToRepositoryCommitMap.set(commit.hash, commit);
        }

        // connect all commit entries with each other (parents, children)
        for (const historyCommit of historyRepository.entries) {
            if (!(historyCommit instanceof HistoryCommitEntry))
                continue;
            const repositoryCommit = hashToRepositoryCommitMap.get(historyCommit.hash);
            for (const parent of repositoryCommit.parents) {
                const parentHistoryCommit = hashToHistoryCommitMap.get(parent.hash);
                historyCommit.parents.push(parentHistoryCommit);
                parentHistoryCommit.children.push(historyCommit);
            }
        }

        // connect "Current changes" entry with the HEAD entry
        if (historyRepository.entries.length > 0 && historyRepository.entries[0] instanceof HistoryCurrentChangesEntry) {
            const currentChangeEntry = historyRepository.entries[0];
            const headCommitEntry = hashToHistoryCommitMap.get(repository.head.hash);
            currentChangeEntry.parents.push(headCommitEntry);
            headCommitEntry.children.push(currentChangeEntry);
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
