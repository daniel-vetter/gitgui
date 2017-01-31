export class Metrics {
    get bubbleSpacing() { return 23; }
    get bubbleWidth() { return 31; }
    get bubbleHeight() { return 31; }
    get commitHeight() { return 30; }

    getBubbleCenterX(lane: number) { return (lane * this.bubbleSpacing) + (this.bubbleWidth / 2.0); }
    getBubbleCenterY(index: number) { return (index * this.commitHeight) + (this.commitHeight / 2.0); }
    getBubbleTop(index: number) { return this.getBubbleCenterY(index) - this.bubbleHeight / 2.0; }
    getBubbleBottom(index: number) { return this.getBubbleCenterY(index) + this.bubbleHeight / 2.0; }
    getBubbleLeft(lane: number) { return this.getBubbleCenterX(lane) - this.bubbleWidth / 2.0; }
    getBubbleRight(lane: number) { return this.getBubbleCenterX(lane) + this.bubbleWidth / 2.0; }
}
