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


describe(Git.name, () => {

    let fileSystem: FileSystem;
    let git: Git;
    let gitRaw: GitRaw;
    let originalWorkingDirectory = "";
    const testDirectory = getTempDirectory();

    beforeAll(async () => {
        console.log("1");
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

    afterAll(() => {
        TestBed.resetTestingModule();
        fileSystem.setCurrentWorkingDirectory(originalWorkingDirectory!);
    });

    describe("Given a repository with one commit", () => {

        let repository: Repository;

        beforeAll(async () => {
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
