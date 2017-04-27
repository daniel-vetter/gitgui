import { Injectable } from "@angular/core";
import { GitRaw } from "./infrastructure/git-raw";
import { RepositoryCommit, RepositoryRef, RepositoryHeadRef, RepositoryTagRef, RepositoryRemoteRef } from "../../model/model";
import * as Rx from "rxjs";

@Injectable()
export class RefsReader {
    constructor(private gitRaw: GitRaw) {
    }

    readAllRefs(pathToRepository: string, allCommits: RepositoryCommit[]): Rx.Observable<RepositoryRef[]> {

        // Create a index to quickly find commits by there hash
        const commitIndex = new Map<string, RepositoryCommit>();
        for (const commit of allCommits) {
            commitIndex.set(commit.hash, commit);
        }

        // run git-each-ref
        const columns = ["objectname", "objecttype", "*objectname", "*objecttype" ,"refname", "upstream"];
        const format = "--format=" + columns.map(x => "%(" + x + ")").join("%00");
        const args = ["for-each-ref", format];
        return this.gitRaw.run(pathToRepository, args).map(x => {
            const result: RepositoryRef[] = [];
            const lines = x.data.split("\n")
                .map(y => y.trim())
                .filter(y => y.trim() !== "")
                .map(y => this.parseLine(y));

                console.log(x.data);

            // go through each line and create RepositoryRef objects for each
            for (const line of lines) {

                // /ref/heads/*
                if (line.ref.type === "heads") {
                    const ref = new RepositoryHeadRef();
                    ref.fullName = line.ref.fullName;
                    ref.shortName = line.ref.shortName;
                    if (line.objectType !== "commit") {
                        throw new Error("The ref \"" + line.ref.fullName + "\" is not connected to a commit. " +
                                        "(connected to: \"" + line.objectType + "\")");
                    }
                    ref.commit = commitIndex.get(line.objectName);
                    result.push(ref);
                    continue;
                }

                // /ref/tags/*
                if (line.ref.type === "tags") {
                    const ref = new RepositoryTagRef();
                    ref.fullName = line.ref.fullName;
                    ref.shortName = line.ref.shortName;
                    if (line.objectType === "commit") { // lightweight tag
                        ref.commit = commitIndex.get(line.objectName);
                    } else if (line.objectName === "tag") { // annotated tag
                        if (line.resolvedObjectType !== "commit") {
                            throw new Error("Tag \"" + line.objectName + "\" not pointing to a commit.")
                        }
                        ref.commit = commitIndex.get(line.resolvedObjectName);
                        (<RepositoryTagRef>ref).annotationHash = line.objectName;
                    }
                    result.push(ref);
                    continue;
                }

                // /ref/remotes/*
                if (line.ref.type === "remotes") {
                    const ref = new RepositoryRemoteRef();
                    ref.fullName = line.ref.fullName;
                    const splitter = line.ref.shortName.indexOf("/");
                    if (splitter === -1) {
                        throw new Error("Remote name could not be extracted from: \"" + line.ref.shortName + "\"");
                    }
                    ref.shortName = line.ref.shortName.substr(splitter + 1);
                    ref.remote = line.ref.shortName.substr(0, splitter);
                    ref.commit = commitIndex.get(line.objectName);
                    result.push(ref);
                    continue;
                }

                // unknown ref types get skipped
                console.warn("skipped ref: " + line.ref.fullName);
            }

            // after all ref object are created, we can connect all local branch refs with its upstream refs.
            for (const line of lines.filter(y => y.upstream)) {
                const upstream = <RepositoryRemoteRef>result.find(y => y.fullName === line.upstream.fullName);
                const localRef = <RepositoryHeadRef>result.find(y => y.fullName === line.ref.fullName);
                if (!upstream) {
                    console.warn("upstream \"" + line.upstream.fullName + "\" not found.")
                    continue;
                }

                localRef.upstream = upstream;
                upstream.downstreams.push(localRef);
            }


            // all refs should also be referenced from the commit
            for (const ref of result) {
                if (ref.commit) {
                    ref.commit.refs.push(ref);
                }
            }
            return result;
        });
    }

    private parseLine(line: string): OutputLine {
        const parts = line.split("\0");
        const result = new OutputLine();
        result.objectName = parts[0];
        result.objectType = parts[1];
        result.resolvedObjectName = parts[2];
        result.resolvedObjectType = parts[3];
        result.ref = this.parseRef(parts[4]);
        result.upstream = parts[5] !== "" ? this.parseRef(parts[5]) : undefined;
        return result;
    }

    private parseRef(refFullName: string): Ref {
        const pre = "refs/";
        if (!refFullName.startsWith(pre)) {
            throw new Error("\"" + refFullName + "\" is not a valid ref");
        }

        refFullName = refFullName.substr(pre.length);

        const refName = new Ref();
        refName.fullName = pre + refFullName;
        const typePartEnd = refFullName.indexOf("/");
        if (typePartEnd === -1) {
            refName.type = refFullName;
            refName.shortName = "";
        } else {
            refName.shortName = refFullName.substr(typePartEnd + 1);
            refName.type = refFullName.substr(0, typePartEnd);
        }
        return refName;
    }
}

class Ref {
    fullName: string;
    shortName: string;
    type: string;
}

class OutputLine {
    objectName: string;
    objectType: string;
    resolvedObjectName: string;
    resolvedObjectType: string;
    ref: Ref;
    upstream: Ref;
}
