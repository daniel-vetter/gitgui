import { md5 } from "./md5";
import { Injectable } from "@angular/core";

@Injectable()
export class GravatarUrlBuilder {

    getUrlFor(email: string): string {
        const hash = md5(email.trim().toLowerCase());
        return "https://www.gravatar.com/avatar/" + hash + "?d=mm&s=30";
    }
}
