import * as Rx from "rxjs";
import { Config } from "../config";
import { Injectable, EventEmitter } from "@angular/core";
import { PackageLoader } from "./package-loader";
import { PackageParser, IconPackage } from "./package-parser";
import { Path } from "../path";
import { ThemeManager } from "../theme-manager";

@Injectable()
export class FileIconManager {

    iconPackage: IconPackage;
    defaultFolderIcon: IconBundle;
    defaultFileIcon: IconDefinition;

    onFileIconsChanged = new EventEmitter();

    constructor(private config: Config,
        private packageLoader: PackageLoader,
        private packageParser: PackageParser,
        private themeManager: ThemeManager) {
        this.defaultFolderIcon = new IconBundle();
        this.defaultFolderIcon.collapsed = new IconMaterialDefinition("folder");
        this.defaultFolderIcon.expanded = new IconMaterialDefinition("folder_open");
        this.defaultFileIcon = new IconMaterialDefinition("insert_drive_file");
    }

    init() {
        this.loadIcons();
        this.themeManager.onCurrentThemeChanged.subscribe(() => this.loadIcons());
    }

    private loadIcons() {
        this.packageLoader.load(this.config.get().fileIconPackageUrl).subscribe(manifestPath => {
            try {
                if (manifestPath) {
                    this.iconPackage = this.packageParser.parse(manifestPath, this.themeManager.currentTheme === "light");
                    this.onFileIconsChanged.emit();
                } else {
                    console.warn("no manifest file found in icon package");
                }
            } catch (error) {
                console.warn("error while parsing icon package", error);
            }
        }, error => {
            console.warn("error while parsing icon package", error);
        });
    }

    getFolderIcon(folderName: string): IconBundle {
        if (!this.iconPackage)
            return this.defaultFolderIcon;

        const bundle = new IconBundle();
        if (this.iconPackage.folderNames.has(folderName) &&
            this.iconPackage.folderNamesExpanded.has(folderName)) {
            bundle.collapsed = this.iconPackage.folderNames.get(folderName);
            bundle.expanded = this.iconPackage.folderNamesExpanded.get(folderName);
        } else {
            bundle.expanded = this.iconPackage.folderExpanded;
            bundle.collapsed = this.iconPackage.folder;
        }
        return bundle;
    }

    getFileIcon(fileName: string): IconDefinition {
        if (!this.iconPackage)
            return this.defaultFileIcon;

        if (this.iconPackage.fileNames.has(fileName)) {
            return this.iconPackage.folderNames.get(fileName);
        } else {
            const extension = Path.getExtension(fileName);
            if (this.iconPackage.fileExtensions.has(extension)) {
                return this.iconPackage.fileExtensions.get(extension);
            } else {
                return this.iconPackage.file;
            }
        }
    }
}

export class IconBundle {
    collapsed: IconDefinition;
    expanded: IconDefinition;
}

export abstract class IconDefinition {

}

export class IconImageDefinition extends IconDefinition {
    filePath: string;
}

export class IconMaterialDefinition extends IconDefinition {
    constructor(public name: string) {
        super();
    }
}
