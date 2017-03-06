import { Component, Input, OnChanges } from "@angular/core";
import { IconDefinition, IconImageDefinition, IconMaterialDefinition } from "../../../../services/file-icon/file-icon";

@Component({
    selector: "file-icon",
    templateUrl: "./file-icon.component.html",
    styleUrls: ["./file-icon.component.scss"]
})
export class FileIconComponent implements OnChanges {
    @Input() icon: IconDefinition;
    visible = false;
    imgPath: string;
    materialName: string;

    ngOnChanges() {
        if (!this.icon) {
            this.visible = false;
        } else {
            this.visible = true;
            this.imgPath = undefined;
            this.materialName = undefined;

            if (this.icon instanceof IconImageDefinition) {
                this.imgPath = this.icon.filePath;
            }
            if (this.icon instanceof IconMaterialDefinition) {
                this.materialName = this.icon.name;
            }
        }
    }
}
