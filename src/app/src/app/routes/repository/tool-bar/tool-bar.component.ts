import { Component } from "@angular/core";
import { FileOpenRepository } from "../../../menu/handler/file-open-repository";
@Component({
    templateUrl: "./tool-bar.component.html",
    styleUrls: ["./tool-bar.component.scss"],
    selector: "tool-bar"
})
export class ToolBarComponent {

    constructor(private fileOpenRepository: FileOpenRepository) {}

    onOpenClicked() {
        this.fileOpenRepository.onClick();
    }
}
