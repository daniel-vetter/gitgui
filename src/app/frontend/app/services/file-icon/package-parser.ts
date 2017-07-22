import { FileSystem } from "../file-system";
import { Path } from "../path";
import { Injectable } from "@angular/core";
import { IconDefinition, IconImageDefinition } from "./file-icon";

@Injectable()
export class PackageParser {

    constructor(private fileSystem: FileSystem) { }

    parse(manifestPath: string, lightTheme: boolean): IconPackage {
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
        this.parseFileContent(pack, iconFile, allIconDefinitions);
        if (lightTheme)
            this.parseFileContent(pack, iconFile.light, allIconDefinitions);
        return pack;
    }

    private parseFileContent(pack: IconPackage, data: any, allIconDefinitions: Map<string, IconDefinition>) {
        if (!data)
            return;
        if (data.file && allIconDefinitions.get(data.file))
            pack.file = allIconDefinitions.get(data.file)!;
        if (data.folder && allIconDefinitions.get(data.folder))
            pack.folder = allIconDefinitions.get(data.folder)!;
        if (data.folderExpanded && allIconDefinitions.get(data.folderExpanded))
            pack.folderExpanded = allIconDefinitions.get(data.folderExpanded)!;

        this.readReferences(data.fileExtensions, pack.fileExtensions, allIconDefinitions);
        this.readReferences(data.fileNames, pack.fileNames, allIconDefinitions);
        this.readReferences(data.folderNames, pack.folderNames, allIconDefinitions);
        this.readReferences(data.folderNamesExpanded, pack.folderNamesExpanded, allIconDefinitions);

    }

    readReferences(data: any,
                   target: Map<string, IconDefinition>,
                   allIconDefinitions: Map<string, IconDefinition>): void {
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                target.set(key, allIconDefinitions.get(data[key])!);
            }
        }
    }
}

export class IconPackage {
    fileExtensions = new Map<string, IconDefinition>();
    fileNames = new Map<string, IconDefinition>();
    file: IconDefinition;
    folder: IconDefinition;
    folderExpanded: IconDefinition;
    folderNames = new Map<string, IconDefinition>();
    folderNamesExpanded = new Map<string, IconDefinition>();
}


