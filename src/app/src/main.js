const electron = require('electron');
const ipcMain = electron.ipcMain;
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const path = require('path')
const url = require('url')
const spawn = require('child_process').spawn;


let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({ width: 1200, height: 800, show: false })
  mainWindow.webContents.on("did-finish-load", () => { mainWindow.show(); })
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))
  mainWindow.setMenu(null);
  if (process.argv.indexOf("--devtools") !== -1) {
    mainWindow.webContents.openDevTools({ mode: "undocked" });
  }


  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

app.on('ready', createWindow)
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})
