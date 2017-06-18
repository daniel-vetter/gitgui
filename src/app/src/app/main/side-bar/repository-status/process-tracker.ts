export class ProcessTracker {

    private trackerItems: ProcessTrackerItem[] = [];
    private onAllCompletedResolver: any[] = [];

    processHasStarted(): ProcessTrackerItem {
        const item = new ProcessTrackerItem(x => this.onCompleted(x));
        this.trackerItems.push(item);
        return item;
    }

    allDone(): Promise<void> {
        if (this.trackerItems.length === 0) {
            return Promise.resolve();
        }

        return new Promise<void>((resolve) => {
            this.onAllCompletedResolver.push(resolve);
        });
    }

    private onCompleted(item: ProcessTrackerItem) {
        const index = this.trackerItems.indexOf(item);
        if (index !== -1) {
            this.trackerItems.splice(index, 1);
        }

        if (this.trackerItems.length === 0) {
            while (this.onAllCompletedResolver.length > 0) {
                this.onAllCompletedResolver[0]();
                this.onAllCompletedResolver.splice(0, 1);
            }
        }
    }
}

export class ProcessTrackerItem {
    constructor(private onCompleted:  ((item: ProcessTrackerItem) => void)) {

    }

    completed() {
        this.onCompleted(this);
    }
}
