import { Component, Input, OnChanges } from "@angular/core";
import { RepositoryCommit } from "../../model/model";
import { md5 } from "./md5";

@Component({
    selector: "profile-image",
    templateUrl: "./profile-image.component.html"
})
export class ProfileImageComponent implements OnChanges {

    @Input() commit: RepositoryCommit;
    imageUrl: string = undefined;

    ngOnChanges() {
        if (this.commit === undefined) {
            this.imageUrl = undefined;
            return;
        }

        let hash = "";
        if (this.commit && this.commit.authorMail) {
            hash = md5(this.commit.authorMail.trim().toLowerCase());
        }
        this.imageUrl = "https://www.gravatar.com/avatar/" + hash + "?d=mm";
    }
}
