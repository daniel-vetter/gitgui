#!/bin/bash
set -e
(cd src/build; npm install) > /dev/null
(cd src/build; npm run build) > /dev/null
echo Build script compiled
node ./src/build/build/build.js
