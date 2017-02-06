import { Injectable } from "@angular/core";

@Injectable()
export class LaneColorProvider {
    getColorForLane(lane: number, light = 0.4): string {
        return this.hslToRgb((lane * 0.1) % 1, 1, light);
    }

    private hslToRgb(h: number, s: number, l: number): string {
        let r, g, b;

        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return "#" +
                this.toHex(Math.round(r * 255)) +
                this.toHex(Math.round(g * 255)) +
                this.toHex(Math.round(b * 255));
    }

    private toHex(c: number) {
        const hex = c.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }
}
