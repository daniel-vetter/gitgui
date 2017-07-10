import { ipcMain } from "electron";
import { FSEXTRA_REMOVE_DIRECTORY } from "../../shared/ipc-interfaces/fs-extra";
const fsExtra = require("fs-extra");

export class FsExtra {
  setup() {
    ipcMain.on(FSEXTRA_REMOVE_DIRECTORY, (event, arg) => {
      fsExtra.removeSync(arg.path);
      event.returnValue = true;
    });
  }
}

