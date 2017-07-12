@echo off
cmd /c "cd .\src\build && npm install" > NUL
cmd /c "cd .\src\build && npm run build" > NUL
echo Build script compiled
node .\src\build\build\build.js
