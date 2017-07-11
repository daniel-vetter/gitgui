(<any>window).require = (<any>window).parent.require;
import { Git } from "../git";
import { TestBed, async } from "@angular/core/testing";
import { GitModule } from "../git.module";
import { AppModule } from "../../../app.module";
import { Platform } from "../../platform";
import { FileSystem } from "../../file-system";
import { GitRaw } from "../infrastructure/git-raw";
import { waitForPromise, run, getTempDirectory } from "./helper";
import { Repository } from "../model";


describe(Git.name, () => {

    var fileSystem: FileSystem;
    var git: Git;
    var gitRaw: GitRaw;
    let originalWorkingDirectory: string | undefined = undefined;
    const testDirectory = getTempDirectory();

    beforeEach(waitForPromise(async () => {
        //Init git system
        await TestBed.configureTestingModule({
            imports: [GitModule],
            providers: [Platform, FileSystem]
        }).compileComponents();

        fileSystem = TestBed.get(FileSystem);
        git = TestBed.get(Git);
        gitRaw = TestBed.get(GitRaw);

        //Create workspace directory where the tests will be run
        originalWorkingDirectory = fileSystem.getCurrentWorkingDirectory();
        if (fileSystem.exists(testDirectory))
            fileSystem.deleteDirectory(testDirectory);
        fileSystem.createDirectory(testDirectory);
        fileSystem.setCurrentWorkingDirectory(testDirectory);
    }));

    afterEach(() => {
        fileSystem.setCurrentWorkingDirectory(originalWorkingDirectory!);
    });


    describe("Sample test", () => {

        it("should load the correct commit count", waitForPromise(async () => {

            await run("git init");
            await run("git help > show.txt");
            await run("git add --all");
            await run("git commit -m \"Test Stuff\"");

            const repository = await git.readRepository(testDirectory);
            expect(repository.commits.length).toBe(1);
        }));
    });
});
