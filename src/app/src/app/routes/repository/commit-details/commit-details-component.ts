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

    samples: ChangeFileTreeNodeModel[];
    adapter: ChangeFileTreeNodeModelAdapter;

    constructor(private commitDetailsReader: CommitDetailsReader) {}

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
            const root = new ChangeFileTreeNodeModel();
            for (const change of x) {
                const parts = change.path.split("/");
                let curNode = root;
                for (const part of parts) {
                    let childNode = curNode.children.find(y => y.label === part);
                    if (!childNode) {
                        childNode = new ChangeFileTreeNodeModel();
                        childNode.label = part;
                        curNode.children.push(childNode);
                    }
                    curNode = childNode;
                }
            }
            this.samples = root.children;
        });
    }

    ngOnInit() {
        this.adapter = new ChangeFileTreeNodeModelAdapter();
    }
}


export class ChangeFileTreeNodeModel {
    label: string = "";
    children: ChangeFileTreeNodeModel[] = [];
}

export class ChangeFileTreeNodeModelAdapter implements ITreeViewAdapter<ChangeFileTreeNodeModel> {
    hasChildren(data: ChangeFileTreeNodeModel): boolean {
        return data.children.length > 0;
    }
    getChildren(data: ChangeFileTreeNodeModel): ChangeFileTreeNodeModel[] {
        return data.children;
    }
}
