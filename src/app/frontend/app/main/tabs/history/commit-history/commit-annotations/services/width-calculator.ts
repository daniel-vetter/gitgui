export class WidthCalculator {

    private context: CanvasRenderingContext2D;
    private cache = new Map<string, number>();

    constructor() {
        const context = document.createElement("canvas").getContext("2d");
        if (!context)
            throw Error("Could not create 2d context");
        this.context = context;
    }

    getWidth(text: string, font: string): number {
        const key = text + "#" + font;
        const value = this.cache.get(key);
        if (value !== undefined)
            return value;
        this.context.font = font;
        const width = this.context.measureText(text).width;
        this.cache.set(key, width);
        return width;
    }
}
