(<any>window).require = (<any>window).parent.require;
import { Git } from "../git";
import { TestBed, async } from "@angular/core/testing";
import { GitModule } from "../git.module";
import { AppModule } from "../../../app.module";
import { Platform } from "../../platform";
import { FileSystem } from "../../file-system";
import { GitRaw } from "../infrastructure/git-raw";
import { run, getTempDirectory } from "./helper";
import { Repository } from "../model";
import { GitFetchResult } from "../actions/action-fetch";
import { GitRebaseResult } from "../actions/action-rebase";
import { Process } from "app/services/git/infrastructure/process";
const remote = (<any>window).require("electron").remote;
const fs = remote.require("fs");

describe(Git.name, () => {

    let fileSystem: FileSystem;
    let git: Git;
    let gitRaw: GitRaw;
    let originalWorkingDirectory = "";
    const testDirectory = getTempDirectory();

    beforeEach(async () => {

        // Init git system
        await TestBed.configureTestingModule({
            imports: [GitModule],
            providers: [Platform, FileSystem]
        }).compileComponents();

        fileSystem = TestBed.get(FileSystem);
        git = TestBed.get(Git);
        gitRaw = TestBed.get(GitRaw);

        // Create workspace directory where the tests will be run
        originalWorkingDirectory = fileSystem.getCurrentWorkingDirectory();
        if (fileSystem.exists(testDirectory))
            fileSystem.deleteDirectory(testDirectory);
        fileSystem.createDirectory(testDirectory);
        fileSystem.setCurrentWorkingDirectory(testDirectory);
    });

    afterEach(() => {
        fileSystem.setCurrentWorkingDirectory(originalWorkingDirectory!);
    });

    describe("Loading", () => {
        describe("Given a repository with one commit", () => {

            let repository: Repository;

            beforeEach(async () => {
                await run("git init");
                await run("git config user.name \"GitGui Testing User\"")
                await run("git config user.email \"testing@git.com\"")
                await run("git help > show.txt");
                await run("git add --all");
                await run("git commit -m \"Test Stuff\"");

                repository = await git.readRepository(testDirectory);
            });

            it("should load the correct commit count", async () => {
                expect(repository.commits.length).toBe(1);
            });
        });
    });

    describe("Fetch", () => {
        describe("Given a empty folder", () => {

            let fetchResult: GitFetchResult;

            beforeEach(async () => {
                fetchResult = await git.fetch(new Repository(testDirectory));
            });

            it("should fail with error: not_a_git_repository", () => {
                expect(fetchResult.success === false && fetchResult.errorType === "not_a_git_repository").toBe(true);
            });
        });

        describe("Given a repository with a upstream configured to an other repository", () => {

            let fetchResult: GitFetchResult;

            beforeEach(async () => {
                fileSystem.createDirectory(testDirectory + "/otherRepository");
                fileSystem.setCurrentWorkingDirectory(testDirectory + "/otherRepository");
                await run("git init");
                await run("git config user.name \"GitGui Testing User\"");
                await run("git config user.email \"testing@git.com\"");
                await run("git help > show.txt");
                await run("git add --all");
                await run("git commit -m \"Test Stuff\"");

                fileSystem.setCurrentWorkingDirectory(testDirectory);
                await run("git init");
                await run("git remote add origin ./otherRepository");

                const repository = await git.readRepository(testDirectory);
                fetchResult = await git.fetch(repository);
            });

            it("should successfully fetch from the other repository", () => {
                expect(fetchResult.success).toBe(true);
            });
        });
    });

    describe("Rebase", () => {
        describe("Given a empty folder", () => {

            let rebaseResult: GitRebaseResult;

            beforeEach(async () => {
                rebaseResult = await git.rebase(new Repository(testDirectory), "foo");
            });

            it("a rebase should fail with error: not_a_git_repository", () => {
                expect(rebaseResult.success === false && rebaseResult.errorType === "not_a_git_repository").toBe(true);
            });
        });

        describe("Given two divergent branches", () => {

            beforeEach(async () => {
                await run("git init");
                await run("git config user.name \"GitGui Testing User\"");
                await run("git config user.email \"testing@git.com\"");
                await run("git help  > initFile.txt");
                await run("git add --all");
                await run("git commit -m \"Init commit\"");
                await run("git checkout -b branch1");
                await run("git help > fileOnBranch1.txt");
                await run("git add --all");
                await run("git commit -m \"Commit on branch 1\"");
                await run("git checkout master");
                await run("git help > fileOnMaster.txt");
                await run("git add --all");
                await run("git commit -m \"Commit on master\"");
                await run("git checkout branch1");

                await git.rebase(new Repository(testDirectory), "master");
            });

            it("the working directory should contain all three files after the rebase", () => {
                expect(fileSystem.findFiles(testDirectory, x => x.endsWith(".txt")).length).toBe(3);
            })
        });

        if (Platform.getCurrent() === "Windows") {
            describe("Given a file is exclusive opened on windows", () => {

                let rebaseResult: GitRebaseResult;

                beforeEach(async () => {
                    await run("git init");
                    await run("git config user.name \"GitGui Testing User\"");
                    await run("git config user.email \"testing@git.com\"");
                    await run("git help  > initFile.txt");
                    await run("git add --all");
                    await run("git commit -m \"Init commit\"");
                    await run("git checkout -b branch1");
                    await run("git help > fileOnBranch1.txt");
                    await run("git add --all");
                    await run("git commit -m \"Commit on branch 1\"");
                    await run("git checkout master");
                    await run("git help > fileOnMaster.txt");
                    await run("git add --all");
                    await run("git commit -m \"Commit on master\"");
                    await run("git checkout branch1");

                    const fd = fs.openSync("./fileOnBranch1.txt", "a");
                    try {
                        rebaseResult = await git.rebase(new Repository(testDirectory), "master");
                    } finally {
                        fs.closeSync(fd);
                    }
                });

                it("the rebase should failed with error: access_denied", () => {
                    expect(rebaseResult.success === false && rebaseResult.errorType === "access_denied").toBe(true);
                }); 
            });
        } 
    });
});
