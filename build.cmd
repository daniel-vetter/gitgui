@echo off
cd src\app
cmd /c npm install
node node_modules\angular-cli\bin\ng build -prod -o ..\..\build\app
cd ..\..
node src\app\node_modules\electron-packager\cli.js ^
     build\app GitGui ^
     --platform=win32 ^
     --electron-version=1.4.15 ^
     --out=build\dist ^
     --icon=src\app\icon.ico ^
     --app-copyright="Daniel Vetter 2017" ^
     --win32metadata.CompanyName="Daniel Vetter" ^
     --win32metadata.ProductName="GitGui" ^
     --win32metadata.OriginalFilename="GitGui.exe" ^
     --win32metadata.FileDescription="GitGui" ^
     --asar ^
     --overwrite