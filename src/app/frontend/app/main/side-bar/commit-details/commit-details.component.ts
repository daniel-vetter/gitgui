import { Component, Input, OnChanges } from "@angular/core";
import { RepositoryCommit, ChangedFile, FileRef } from "../../../services/git/model";
import { FileContentDiffTabData, FileContentTabData } from "../../tabs/tabs";
import { Git } from "../../../services/git/git";
import { FileTreeBuilder } from "../changed-files-tree/file-tree-builder";
import { TabManager } from "app/services/tabs/tab-manager";

@Component({
    selector: "commit-details",
    styleUrls: ["./commit-details.component.scss"],
    templateUrl: "./commit-details.component.html"
})
export class CommitDetailsComponent implements OnChanges {

    @Input() commit: RepositoryCommit;

    commitTitle = "";
    authorName = "";
    authorMail = "";
    authorDate = "";

    changedFiles: ChangedFile[];

    constructor(private git: Git,
        private fileTreeBuilder: FileTreeBuilder,
        private tabManager: TabManager) { }

    ngOnChanges() {
        if (!this.commit)
            return;

        const localCommit = this.commit;

        this.authorName = this.commit.authorName;
        this.authorMail = this.commit.authorMail;
        this.authorDate = this.commit.authorDate.toLocaleDateString() + " " + this.commit.authorDate.toLocaleTimeString();
        this.git.getLongCommitMessage(this.commit).then(x => {
            if (localCommit === this.commit)
                this.commitTitle = x;
        });
        this.git.getFileChangesOfCommit(this.commit).then(x => {
            this.changedFiles = x;
        });
    }

    async onFileSelected(changedFile: ChangedFile) {
        if (!changedFile.oldFile || !changedFile.newFile) {
            const file = changedFile.oldFile ? changedFile.oldFile : changedFile.newFile;
            const page = this.tabManager.createNewTab({
                type: "FileContentTab",
                repository: this.commit.repository,
                file: file!
            });
            page.isPersistent = false;
        } else {
            const page = this.tabManager.createNewTab({
                type: "FileContentDiffTab",
                repository: this.commit.repository,
                leftFile: changedFile.oldFile,
                rightFile: changedFile.newFile
            });
            page.isPersistent = false;
        }
    }
}
