import { Component, Input, OnChanges, NgZone, ChangeDetectorRef, SimpleChanges } from "@angular/core";
import { RepositoryCommit } from "../../services/git/model";
import { md5 } from "./md5";

@Component({
    selector: "profile-image",
    templateUrl: "./profile-image.component.html"
})
export class ProfileImageComponent implements OnChanges {

    @Input() commit: RepositoryCommit;
    imageUrl?: string;
    shortName: string = "";
    requestId = 0;

    constructor(private changeDetectorRef: ChangeDetectorRef) {
        changeDetectorRef.detach();
    }

    ngOnInit() {
        this.changeDetectorRef.detectChanges();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (!changes.commit)
            return;
        if (this.commit === undefined) {
            this.imageUrl = undefined;
            this.changeDetectorRef.detectChanges();
            return;
        }

        let hash = "";
        if (this.commit && this.commit.authorMail) {
            hash = md5(this.commit.authorMail.trim().toLowerCase());
        }

        const url = "https://www.gravatar.com/avatar/" + hash + "?d=blank";
        const tempImage = new Image();
        const requestId = ++this.requestId;
        tempImage.onload = () => {
            if (this.requestId === requestId) {
                this.imageUrl = url;
                this.changeDetectorRef.detectChanges();
            }
        };
        tempImage.src = url;

        this.shortName = "";
        if (this.commit.authorName) {
            const parts = this.commit.authorName.trim().split(" ");
            if (parts.length === 1)
                this.shortName = parts[0].substr(0, 1);
            else {
                this.shortName = parts[0].substr(0, 1) + parts[parts.length - 1].substr(0, 1);
            }
        }
    }
}
