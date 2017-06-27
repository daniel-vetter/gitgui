(<any>window).require = (<any>window).parent.require;
import { Git } from "./git";
import { TestBed, async } from "@angular/core/testing";
import { GitModule } from "./git.module";
import { AppModule } from "../../app.module";
import { Platform } from "../platform";
import { FileSystem } from "../file-system";


describe(Git.name, () => {

    var git: Git;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [GitModule],
            providers: [Platform, FileSystem]
        })

        git = TestBed.get(Git);
    }));

    describe("stuff", () => {
        it("should", async(async () => {

            const repository = await git.readRepository("C:\\temp\\TypeScript");
            console.log(repository.config.userMail);
            expect(true).toBe(true);
        }));
    });
})

