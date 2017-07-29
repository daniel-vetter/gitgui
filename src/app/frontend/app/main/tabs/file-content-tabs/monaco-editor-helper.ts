export class MonacoEditorHelper {
    waitTillLibIsLoaded(): Promise<void> {
        // HACK: wait till the monaco editor is loaded
        // TODO: move this to the app startup, so the app is not display till the editor is fully loaded.
        return new Promise<void>(done => {
            const check = () => {
                if (!(<any>window)["monaco"]) {
                    setTimeout(() => {
                        check();
                    }, 0);
                } else {
                    done();
                }
            };
            check();
        });
    }

    disableCommandMenu(editor: monaco.editor.IStandaloneDiffEditor | monaco.editor.IStandaloneCodeEditor) {
        setTimeout(() => {
            let node = editor.getDomNode();
            if (node.children[0].classList.contains("monaco-diff-editor"))
                node = <HTMLElement>node.children[0];
            node.addEventListener("keydown", (e: KeyboardEvent) => {
                if (e.key === "F1") {
                    e.stopImmediatePropagation();
                    return false;
                }
            });
        }, 0);
    }
}
