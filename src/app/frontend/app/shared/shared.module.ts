import { NgModule } from "@angular/core";
import { ProfileImageComponent } from "./profile-image/profile-image.component";
import { BrowserModule } from "@angular/platform-browser";
import { TreeViewComponent } from "./tree-view/tree-view.component";
import { CheckBoxComponent } from "./check-box/check-box.component";
import { LoadingComponent } from "./loading/loading.component";
import { LoadingOverlayComponent } from "./loading-overlay/loading-overlay.component";
import { ImageResolver } from "./profile-image/image-resolver";
import { SplitterComponent } from "./splitter/splitter.component";

@NgModule({
    declarations: [
        ProfileImageComponent,
        TreeViewComponent,
        CheckBoxComponent,
        LoadingComponent,
        LoadingOverlayComponent,
        SplitterComponent
    ],
    imports: [
        BrowserModule
    ],
    exports: [
        ProfileImageComponent,
        TreeViewComponent,
        CheckBoxComponent,
        LoadingComponent,
        LoadingOverlayComponent,
        SplitterComponent
    ],

    providers: [
        ImageResolver
    ]
})
export class SharedModule {
}
