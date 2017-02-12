export class OncePerFrame {
    actionToRun: () => void;
    isRunning = false;

    run(action: () => void): void {
        this.actionToRun = action;
        this.startRequest();
    }

    startRequest() {
        if (this.isRunning === false) {
            this.isRunning = true;
            requestAnimationFrame(() => this.onRequest());
        }
    }

    onRequest() {
        if (this.actionToRun === undefined) {
            this.isRunning = false;
            return;
        }

        const action = this.actionToRun;
        this.actionToRun = undefined;
        action();
        requestAnimationFrame(() => this.onRequest());
    }
}
