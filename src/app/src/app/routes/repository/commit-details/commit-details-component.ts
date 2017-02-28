import { Component, Input, OnChanges } from "@angular/core";
import { RepositoryCommit } from "../../../model/model";
import { CommitDetailsReader } from "../../../services/git/commit-details-reader";
@Component({
    selector: "commit-details",
    styleUrls: ["./commit-details.component.scss"],
    templateUrl: "./commit-details.component.html"
})
export class CommitDetailsComponent implements OnChanges {

    @Input() commit: RepositoryCommit;

    commitTitle: string = "";
    authorName: string = "";
    authorMail: string = "";
    authorDate: string = "";

    constructor(private commitDetailsReader: CommitDetailsReader) {}

    ngOnChanges() {
        if (!this.commit)
            return;

        this.commitTitle = this.commit.title;
        this.authorName = this.commit.authorName;
        this.authorMail = this.commit.authorMail;
        this.authorDate = this.commit.authorDate.toLocaleDateString() + " " + this.commit.authorDate.toLocaleTimeString();
    }
}
