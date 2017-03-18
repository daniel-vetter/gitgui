import * as Rx from "rxjs";
import { Clone } from "../git/clone";
import { Platform } from "../platform";
import { FileSystem } from "../file-system";
import { Path } from "../path";
import { Injectable } from "@angular/core";
import { Status, StatusProcessTracker } from "../status";

@Injectable()
export class PackageLoader {

    constructor(private clone: Clone,
        private platform: Platform,
        private fileSystem: FileSystem,
        private status: Status) { }

    load(url: string): Rx.Observable<string> {
        let processStatus: StatusProcessTracker;
        return Rx.Observable.create((subscriber: Rx.Subscriber<string>) => {
            processStatus = this.status.startProcess("Loading icon package");
            const onError = (error) => {
                subscriber.error(error);
                if (processStatus)
                    processStatus.completed();
            };
            try {

                const packageBasePath = Path.combine(this.platform.appDataDirectory, "fileIconPackages");
                const indexFilePath = Path.combine(packageBasePath, "index.json");
                this.fileSystem.ensureDirectoryExists(packageBasePath);
                let index: IndexFileContent = undefined;
                if (!this.fileSystem.exists(indexFilePath)) {
                    index = <IndexFileContent>{};
                    index.packages = [];
                } else {
                    index = this.fileSystem.readJson(indexFilePath);
                }

                let indexEntry = index.packages.find(x => x.url === url);
                if (indexEntry === undefined) {
                    indexEntry = <IndexFilePackage>{
                        id: this.getNewId(),
                        url: url
                    };
                    index.packages.push(indexEntry);
                }

                const repositoryPath = Path.combine(packageBasePath, indexEntry.id);
                let gitClone: Rx.Observable<boolean> = undefined;
                if (this.fileSystem.exists(repositoryPath)) {
                    gitClone = Rx.Observable.of(true);
                } else {
                    gitClone = this.clone.cloneRepositoryFromUrl(url, repositoryPath);
                }

                gitClone.subscribe(() => {
                    try {
                        const subDirs = this.fileSystem.getDirectories(repositoryPath);
                        if (subDirs.length !== 1)
                            throw Error("Could not clone repository");
                        const repositoryContentPath = Path.combine(repositoryPath, subDirs[0]);
                        if (!indexEntry.manifestFilePath) {
                            indexEntry.manifestFilePath = this.findManifestFile(repositoryContentPath);
                        }
                        this.fileSystem.saveJsonAsync(indexFilePath, index);
                        if (indexEntry.manifestFilePath) {
                            subscriber.next(Path.combine(repositoryContentPath, indexEntry.manifestFilePath));
                        } else {
                            subscriber.next(undefined);
                        }
                        subscriber.complete();
                        processStatus.completed();
                    } catch (error) {
                        onError(error);
                    }
                }, error => {
                    onError(error);
                });
            } catch (error) {
                onError(error);
            }
        });
    }

    private findManifestFile(path: string): string {

        // Look for a package.json which points to manifest file.
        const packageJsonPath = Path.combine(path, "package.json");
        if (this.fileSystem.exists(packageJsonPath)) {
            const packageJson = this.fileSystem.readJson(packageJsonPath);
            if (packageJson &&
                packageJson.contributes &&
                packageJson.contributes.iconThemes &&
                packageJson.contributes.iconThemes[0] &&
                packageJson.contributes.iconThemes[0].path) {
                const manifestFile = packageJson.contributes.iconThemes[0].path;
                if (this.fileSystem.exists(Path.combine(path, manifestFile))) {
                    return manifestFile;
                }
            }
        }

        // if the manifest wasn't found, we try a more "brute force" approach
        const allJsonFiles = this.fileSystem.findFiles(path,
            x => !x.endsWith("package.json") && Path.getExtension(x) === "json",
            x => !x.endsWith(".git"));

        for (const jsonPath of allJsonFiles) {
            try {
                const json = this.fileSystem.readJson(jsonPath);
                if (json.iconDefinitions)
                    return jsonPath.substr(path.length + 1);
            } catch (e) {
                continue;
            }
        }
        return undefined;
    }

    private getNewId(): string {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
    }
}

interface IndexFileContent {
    packages: IndexFilePackage[];
}

interface IndexFilePackage {
    id: string;
    url: string;
    manifestFilePath: string;
}