#!/bin/bash
set -e
(cd src/build; npm install)
(cd src/build; npm run build)
echo Build script compiled
node ./src/build/build/build.js
