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
            await TestBed.configureTestingModule({
                declarations: [StatusBarComponent],
                providers: [Status]
            }).compileComponents();

            fixture = TestBed.createComponent(StatusBarComponent);
            fixture.detectChanges();
        }));

        it("should show the message 'Ready'", () => {
            expect(fixture.nativeElement.textContent).toContain("Ready");
        });
    });
});
