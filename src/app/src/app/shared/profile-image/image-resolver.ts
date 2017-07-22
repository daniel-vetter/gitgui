import { md5 } from "./md5";
import { NgZone, Injectable } from "@angular/core";

@Injectable()
export class ImageResolver {

    private cache = new Map<string, Promise<string>>();

    constructor(private ngZone: NgZone) { }

    resolve(mail: string): Promise<string> {

        const cacheEntry = this.cache.get(mail);
        if (cacheEntry !== undefined)
            return cacheEntry;

        this.cache.set(mail, new Promise(done => {
            const hash = md5(mail.trim().toLowerCase());
            const url = "https://www.gravatar.com/avatar/" + hash + "?d=blank";
            const tempImage = new Image();
            tempImage.onload = () => {
                this.ngZone.run(() => { done(url); });
            };
            tempImage.src = url;
        }));

        return this.cache.get(mail)!;
    }
}
