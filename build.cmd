@echo off
cmd /c "cd .\src\build && npm install"
cmd /c "cd .\src\build && npm run build"
echo Build script compiled
node .\src\build\build\build.js
