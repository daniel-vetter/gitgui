import { NgModule } from "@angular/core";
import { ProfileImageComponent } from "./profile-image/profile-image.component";
import { BrowserModule } from "@angular/platform-browser";

@NgModule({
    declarations: [ProfileImageComponent],
    imports: [
        BrowserModule
    ],
    exports: [ProfileImageComponent]
})
export class SharedModule {
}
