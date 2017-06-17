import { Component, OnInit, OnDestroy } from "@angular/core";
import { Status } from "../../services/status";
import * as Rx from "rxjs";
import { Subscription } from "../../services/event-aggregator";

@Component({
    selector: "status-bar",
    templateUrl: "./status-bar.component.html",
    styleUrls: ["./status-bar.component.scss"]
})
export class StatusBarComponent implements OnInit, OnDestroy {

    private _subscription: Rx.Subscription;
    statusText: string;

    constructor(private status: Status) {}

    ngOnInit() {
        this._subscription = this.status.onRunningProcessesChange.subscribe(() => this.updateStatus());
        this.updateStatus();
    }

    ngOnDestroy() {
        this._subscription.unsubscribe();
    }

    private updateStatus() {
        const rp = this.status.runningProcesses;
        this.statusText = rp.map(x => x.description).join(", ");
        if (this.statusText === "") {
            this.statusText = "Ready";
        } else {
            this.statusText += "...";
        }
    }
}
