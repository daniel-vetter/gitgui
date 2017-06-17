export class OncePerFrame {
    actionsToRun = new Map<string, () => void>()
    isRunning = false;

    run(key: string, action: () => void): void {
        this.actionsToRun.set(key, action);
        this.startRequest();
    }

    startRequest() {
        if (this.isRunning === false) {
            this.isRunning = true;
            requestAnimationFrame(() => this.onRequest());
        }
    }

    onRequest() {
        if (this.actionsToRun.size === 0) {
            this.isRunning = false;
            return;
        }
        const actions = this.actionsToRun;
        this.actionsToRun = new Map<string, () => void>();
        for (const key of Array.from(actions.keys())) {
            actions.get(key)!();
        }
        requestAnimationFrame(() => this.onRequest());
    }
}
