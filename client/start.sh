#!/bin/sh
if [ -d "dist" ]; then
  npx serve -s dist -l ${PORT:-3000}
else
  npm run build
  npx serve -s dist -l ${PORT:-3000}
fi
