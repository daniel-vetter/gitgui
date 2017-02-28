import { Component, Input, OnChanges, OnInit } from "@angular/core";
import { RepositoryCommit } from "../../../model/model";
import { CommitDetailsReader } from "../../../services/git/commit-details-reader";
import { ITreeViewAdapter } from "../../../shared/tree-view/tree-view.component";
@Component({
    selector: "commit-details",
    styleUrls: ["./commit-details.component.scss"],
    templateUrl: "./commit-details.component.html"
})
export class CommitDetailsComponent implements OnChanges, OnInit {

    @Input() commit: RepositoryCommit;

    commitTitle: string = "";
    authorName: string = "";
    authorMail: string = "";
    authorDate: string = "";

    samples: SampleModel[];
    adapter: SampleModelTreeAdapter;

    constructor(private commitDetailsReader: CommitDetailsReader) {}

    ngOnChanges() {
        if (!this.commit)
            return;

        this.commitTitle = this.commit.title;
        this.authorName = this.commit.authorName;
        this.authorMail = this.commit.authorMail;
        this.authorDate = this.commit.authorDate.toLocaleDateString() + " " + this.commit.authorDate.toLocaleTimeString();
    }

    ngOnInit() {
        this.samples = [
            new SampleModel("Node 1", [
                new SampleModel("SubNode 1"),
                new SampleModel("SubNode 2"),
                new SampleModel("SubNode 3"),
            ]),
            new SampleModel("Node 2", [
                new SampleModel("SubNode 4"),
                new SampleModel("SubNode 5"),
                new SampleModel("SubNode 6"),
            ]),
            new SampleModel("Node 3")
        ]
        this.adapter = new SampleModelTreeAdapter();
    }
}


export class SampleModel {
    constructor(public label: string = "", public childs: SampleModel[] = []) {}
}

export class SampleModelTreeAdapter implements ITreeViewAdapter<SampleModel> {
    hasChildren(data: SampleModel): boolean {
        return data.childs.length > 0
    }
    getChildren(data: SampleModel): SampleModel[] {
        return data.childs;
    }
}