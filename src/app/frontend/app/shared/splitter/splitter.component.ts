import { Component, OnInit, NgZone, ViewChild, ElementRef, Input, EventEmitter, Output, OnChanges, SimpleChanges } from "@angular/core";
import * as Rx from "rxjs";

@Component({
    selector: "splitter",
    templateUrl: "./splitter.component.html",
    styleUrls: ["./splitter.component.scss"]
})
export class SplitterComponent implements OnInit, OnChanges {

    firstValue: number | undefined;
    secondValue: number | undefined = 200;

    @Input() fixedPart: SplitterPart = "first";
    @Input() minValue = 100;
    @Input() position = 200;
    @Input() showFirst = true;
    @Input() showSecond = true;
    @Output() positionChange = new EventEmitter();

    @ViewChild("root") rootElement: ElementRef;

    isResizing = false;
    private mouseMoveSubscription: Rx.Subscription;

    constructor(private ngZone: NgZone) { }

    ngOnInit() {
        this.setValue(this.position);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.minValue) {
            if (this.position < this.minValue) {
                this.setValue(this.minValue);
            }
        }
    }

    private setValue(value: number) {
        if (value < this.minValue)
            value = this.minValue;
        if (this.fixedPart === "first") {
            this.firstValue = this.position;
            this.secondValue = undefined;
        } else if (this.fixedPart === "second") {
            this.firstValue = undefined;
            this.secondValue = this.position;
        } else {
            this.assertNever(this.fixedPart);
        }

        if (this.position !== value) {
            this.position = value;
            this.positionChange.emit(value);
        }
    }

    private assertNever(never: never): never {
        throw new Error("Invalid value: " + never);
    }

    onResizeMouseDown() {
        this.isResizing = true;

        this.ngZone.runOutsideAngular(() => {
            this.mouseMoveSubscription =
                Rx.Observable.fromEvent(document, "mousemove").subscribe((x: MouseEvent) => this.onResizeMouseMove(x))
        });
    }

    onResizeMouseUp() {
        if (this.isResizing) {
            this.isResizing = false;
            this.mouseMoveSubscription.unsubscribe();
        }
    }

    onResizeMouseMove(event: MouseEvent) {
        event.preventDefault();
        this.ngZone.run(() => {
            if (this.fixedPart === "first") {
                this.setValue(event.clientX);
            } else if (this.fixedPart === "second") {
                this.setValue(this.rootElement.nativeElement.getBoundingClientRect().right - event.clientX);
            } else {
                this.assertNever(this.fixedPart);
            }
        });
        return false;
    }
}

type SplitterPart = "first" | "second";
