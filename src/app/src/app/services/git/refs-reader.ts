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

            // go through each line and create RepositoryRef objects for each
            for (const line of lines) {

                // creating objects inherited from RepositoryRef depending on the type of the ref
                let ref: RepositoryRef = undefined;

                // /ref/heads/*
                if (line.ref.type === "heads") {
                    ref = new RepositoryHeadRef();
                    if (line.objectType !== "commit") {
                        throw new Error("The ref \"" + line.ref.fullName + "\" is not connected to a commit. " +
                                        "(connected to: \"" + line.objectType + "\")");
                    }
                    ref.commit = commitIndex.get(line.objectName);
                }

                // /ref/tags/*
                if (line.ref.type === "tags") {
                    ref = new RepositoryTagRef();
                    if (line.objectType === "commit") { // lightweight tag
                        ref.commit = commitIndex.get(line.objectType);
                    } else if (line.objectName === "tag") { // annotated tag
                        if (line.resolvedObjectType !== "commit") {
                            throw new Error("Tag \"" + line.objectName + "\" not pointing to a commit.")
                        }
                        ref.commit = commitIndex.get(line.resolvedObjectName);
                        (<RepositoryTagRef>ref).annotationHash = line.objectName;
                    }
                }

                // /ref/remotes/*
                if (line.ref.type === "remotes") {
                    ref = new RepositoryRemoteRef();
                    ref.commit = commitIndex.get(line.objectName);
                }

                // unknown ref types get skipped
                if (!ref) {
                    console.warn("skipped ref: " + ref.fullName);
                    continue;
                }

                // set the remaining values and add the object to the list
                ref.fullName = line.ref.fullName;
                ref.shortName = line.ref.shortName;
                result.push(ref);
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
        const typePartEnd = refFullName.indexOf("/");
        if (typePartEnd === -1) {
            throw new Error("Could not determine ref type from \"" + refFullName + "\"");
        }

        const refName = new Ref();
        refName.fullName = pre + refFullName;
        refName.shortName = refFullName.substr(typePartEnd + 1);
        refName.type = refFullName.substr(0, typePartEnd);
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
