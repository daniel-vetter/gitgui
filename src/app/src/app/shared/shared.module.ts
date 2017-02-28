import { NgModule } from "@angular/core";
import { ProfileImageComponent } from "./profile-image/profile-image.component";
import { BrowserModule } from "@angular/platform-browser";
import { TreeViewComponent } from "./tree-view/tree-view.component";

@NgModule({
    declarations: [
        ProfileImageComponent,
        TreeViewComponent
    ],
    imports: [
        BrowserModule
    ],
    exports: [
        ProfileImageComponent,
        TreeViewComponent
    ]
})
export class SharedModule {
}
