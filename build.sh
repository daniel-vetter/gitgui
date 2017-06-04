#!/bin/bash
rm -rf ./build
cd src/app
npm install
node node_modules/@angular/cli/bin/ng build -prod
cd ..
cd main
npm install
node node_modules/webpack/bin/webpack.js
cd ../..
node src/app/node_modules/electron-packager/cli.js \
    build/app \
    GitGui \
    --platform=linux \
    --electron-version=1.7.2 \
    --out=build/dist \
    --icon=src/app/icon.ico \
    --app-copyright="Daniel Vetter 2017" \
    --win32metadata.CompanyName="Daniel Vetter" \
    --win32metadata.ProductName="GitGui" \
    --win32metadata.OriginalFilename="GitGui.exe" \
    --win32metadata.FileDescription="GitGui" \
    --asar \
    --overwrite