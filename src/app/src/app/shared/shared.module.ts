import { NgModule } from "@angular/core";
import { ProfileImageComponent } from "./profile-image/profile-image.component";
import { BrowserModule } from "@angular/platform-browser";
import { TreeViewComponent } from "./tree-view/tree-view.component";
import { CheckBoxComponent } from "./check-box/check-box.component";

@NgModule({
    declarations: [
        ProfileImageComponent,
        TreeViewComponent,
        CheckBoxComponent
    ],
    imports: [
        BrowserModule
    ],
    exports: [
        ProfileImageComponent,
        TreeViewComponent,
        CheckBoxComponent
    ]
})
export class SharedModule {
}
