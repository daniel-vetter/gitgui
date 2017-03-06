import * as Rx from "rxjs";
import { FileSystem } from "../file-system";
import { Path } from "../path";
import { Injectable } from "@angular/core";
import { IconDefinition, IconImageDefinition } from "./file-icon";

@Injectable()
export class PackageParser {

    constructor(private fileSystem: FileSystem) { }

    parse(manifestPath: string): IconPackage {
        const iconFile = this.fileSystem.readJson(manifestPath);
        const allIconDefinitions = new Map<string, IconDefinition>();
        for (const key in iconFile.iconDefinitions) {
            if (iconFile.iconDefinitions.hasOwnProperty(key)) {
                const iconDef = new IconImageDefinition();
                iconDef.filePath = Path.combine(Path.getDirectoryFromFilePath(manifestPath), iconFile.iconDefinitions[key].iconPath);
                allIconDefinitions.set(key, iconDef);
            }
        }

        const pack = new IconPackage();
        pack.file = allIconDefinitions.get(iconFile.file);
        pack.folder = allIconDefinitions.get(iconFile.folder);
        pack.folderExpanded = allIconDefinitions.get(iconFile.folderExpanded);
        pack.fileExtensions = this.readReferences(iconFile.fileExtensions, allIconDefinitions);
        pack.fileNames = this.readReferences(iconFile.fileNames, allIconDefinitions);
        pack.folderNames = this.readReferences(iconFile.fileNames, allIconDefinitions);
        pack.folderNamesExpanded = this.readReferences(iconFile.fileNames, allIconDefinitions);
        return pack;
    }

    readReferences(data: any, allIconDefinitions: Map<string, IconDefinition>): Map<string, IconDefinition> {
        const result = new Map<string, IconDefinition>();
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                result.set(key, allIconDefinitions.get(data[key]));
            }
        }
        return result;
    }
}

export class IconPackage {
    fileExtensions: Map<string, IconDefinition>;
    fileNames: Map<string, IconDefinition>;
    file: IconDefinition;
    folder: IconDefinition;
    folderExpanded: IconDefinition;
    folderNames: Map<string, IconDefinition>;
    folderNamesExpanded: Map<string, IconDefinition>;
}


