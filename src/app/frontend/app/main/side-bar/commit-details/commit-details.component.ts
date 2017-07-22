import { Component, Input, OnChanges } from "@angular/core";
import { RepositoryCommit, ChangedFile, FileRef } from "../../../services/git/model";
import { TabManager } from "../../../services/tab-manager";
import { FileContentDiffTab, FileContentTab } from "../../tabs/tabs";
import { Git } from "../../../services/git/git";
import { FileTreeBuilder } from "../changed-files-tree/file-tree-builder";

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
            const tab = new FileContentTab();
            tab.repository = this.commit.repository;
            tab.file = file!;
            tab.ui.isPersistent = false;
            this.tabManager.createNewTab(tab);
        } else {
            const tab = new FileContentDiffTab();
            tab.repository = this.commit.repository;
            tab.leftFile = changedFile.oldFile;
            tab.rightFile = changedFile.newFile;
            tab.ui.isPersistent = false;
            this.tabManager.createNewTab(tab);
        }
    }
}
