import { Component, Input, OnChanges, NgZone, ChangeDetectorRef, SimpleChanges } from "@angular/core";
import { RepositoryCommit } from "../../services/git/model";
import { md5 } from "./md5";
import { ImageResolver } from "./image-resolver";

@Component({
    selector: "profile-image",
    templateUrl: "./profile-image.component.html"
})
export class ProfileImageComponent implements OnChanges {

    @Input() userName?: string = "";
    @Input() userMail?: string = "";

    imageUrl?: string;
    shortName: string = "";
    requestId = 0;

    constructor(private changeDetectorRef: ChangeDetectorRef, private ngZone: NgZone, private imageResolver: ImageResolver) {
        //   changeDetectorRef.detach();
    }

    ngOnInit() {
        // this.changeDetectorRef.detectChanges();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.userMail === undefined || this.userName === undefined) {
            this.imageUrl = undefined;
            //this.changeDetectorRef.detectChanges();
            return;
        }

        const requestId = ++this.requestId;
        this.imageResolver.resolve(this.userMail).then(x => {
            if (this.requestId === requestId) {
                this.imageUrl = x;
            }
        });

        this.shortName = "";
        this.userName
        const parts = this.userName.trim().split(" ");
        if (parts.length === 1)
            this.shortName = parts[0].substr(0, 1);
        else {
            this.shortName = parts[0].substr(0, 1) + parts[parts.length - 1].substr(0, 1);
        }
    }
}
