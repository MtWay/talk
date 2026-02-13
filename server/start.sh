#!/bin/sh
if [ -d "dist" ]; then
  node dist/app.js
else
  npm run build
  node dist/app.js
fi
