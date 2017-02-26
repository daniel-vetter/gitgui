export class WidthCalculator {

    private context: CanvasRenderingContext2D;
    private cache = new Map<string, number>();

    constructor() {
        this.context = document.createElement("canvas").getContext("2d");
    }

    getWidth(text: string, font: string): number {
        const key = text + "#" + font;
        if (this.cache.has(key))
            return this.cache.get(key);
        this.context.font = font;
        const width = this.context.measureText(text).width;
        this.cache.set(key, width);
        return width;
    }
}
