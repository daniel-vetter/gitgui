import { Repository, UpdatedElements } from "../model";
import { Injectable } from "@angular/core";

@Injectable()
export class RepositoryUpdateTracker {

    private updatedElements = new Map<Repository, UpdatedElements>();
    private concurrentUpdateCount = new Map<Repository, number>();

    updateStarting(repository: Repository, commits: boolean, refs: boolean, status: boolean, head: boolean) {
        let item = this.updatedElements.get(repository);
        let concurrentUpdateCount = this.concurrentUpdateCount.get(repository);
        if (item === undefined)
            item = new UpdatedElements();
        if (concurrentUpdateCount === undefined)
            concurrentUpdateCount = 0;

        concurrentUpdateCount++;
        item.commits = item.commits || commits;
        item.refs = item.refs || refs;
        item.status = item.status || status;
        item.head = item.head || head;

        this.updatedElements.set(repository, item);
        this.concurrentUpdateCount.set(repository, concurrentUpdateCount);

        if (concurrentUpdateCount === 1) {
            repository.updateState.isUpdating = true;
            repository.updateState.onUpdateStarted.next(item);
        }
    }

    updateFinished(repository: Repository) {
        let item = this.updatedElements.get(repository);
        let concurrentUpdateCount = this.concurrentUpdateCount.get(repository);
        if (item === undefined || concurrentUpdateCount === undefined)
            throw Error("Could not change update state to finished because updateStarting was never called for this repository.")

        concurrentUpdateCount--;
        this.concurrentUpdateCount.set(repository, concurrentUpdateCount);

        if (concurrentUpdateCount === 0) {
            this.concurrentUpdateCount.delete(repository);
            this.updatedElements.delete(repository);

            repository.updateState.isUpdating = false;
            repository.updateState.onUpdateFinished.next(item);
        }
    }
}
