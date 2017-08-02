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
import { GitFetchResult } from "../actions/fetcher";


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
            expect(fetchResult.result === "success").toBe(true);
        })
    });
});
