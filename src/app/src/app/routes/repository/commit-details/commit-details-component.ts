import { Component, Input, OnChanges, OnInit, ViewChild } from "@angular/core";
import { RepositoryCommit } from "../../../model/model";
import { CommitDetailsReader } from "../../../services/git/commit-details-reader";
import { ChangedFileTreeNodeModel, FileTreeBuilder } from "./services/file-tree-builder";
import { ChangedFileTreeNodeModelAdapter } from "./services/changed-file-tree-node-model-adapter";

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

    changeFilesTree: ChangedFileTreeNodeModel[];
    adapter = new ChangedFileTreeNodeModelAdapter();

    constructor(private commitDetailsReader: CommitDetailsReader,
        private fileTreeBuilder: FileTreeBuilder) { }

    ngOnChanges() {
        if (!this.commit)
            return;

        const localCommit = this.commit;

        this.authorName = this.commit.authorName;
        this.authorMail = this.commit.authorMail;
        this.authorDate = this.commit.authorDate.toLocaleDateString() + " " + this.commit.authorDate.toLocaleTimeString();
        this.commitDetailsReader.getLongCommitMessage(this.commit).subscribe(x => {
            if (localCommit === this.commit)
                this.commitTitle = x;
        });
        this.commitDetailsReader.getFileChangesOfCommit(this.commit).subscribe(x => {
            console.log("new map");
            this.changeFilesTree = this.fileTreeBuilder.getTree(x);
        });
    }
}
