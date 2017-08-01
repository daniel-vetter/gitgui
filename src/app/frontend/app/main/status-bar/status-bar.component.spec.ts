import { StatusBarComponent } from "./status-bar.component";
import { TestBed } from "@angular/core/testing";
import { Status } from "../../services/status";
import { ComponentFixture } from "@angular/core/testing";
import { by } from "protractor";
import { By } from "@angular/platform-browser/src/platform-browser";
import { async } from "@angular/core/testing";

describe(StatusBarComponent.name, () => {

    describe("When the component is shown", () => {

        let fixture: ComponentFixture<StatusBarComponent>;

        beforeEach(async(async () =>  {
            console.log("a2");
            await TestBed.configureTestingModule({
                declarations: [StatusBarComponent],
                providers: [Status]
            }).compileComponents();

            fixture = TestBed.createComponent(StatusBarComponent);
            fixture.detectChanges();
        }));

        afterEach(async () => {
            TestBed.resetTestingModule();
        })

        it("should show the message 'Ready'", () => {
            console.log("a3")
            expect(fixture.nativeElement.textContent).toContain("Ready");
        });
    });
});
