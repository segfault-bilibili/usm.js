#!/bin/bash
set -e

VER=0.11.6

for FILE in ffmpeg.min.js ffmpeg.min.js.map; do
    curl "https://unpkg.com/@ffmpeg/ffmpeg@${VER}/dist/${FILE}" > "${FILE}"
done

COREVER=0.11.0

curl "https://unpkg.com/@ffmpeg/core@${COREVER}/dist/ffmpeg-core.worker.js" > "ffmpeg-core.worker.js"

# single-threaded version
for FILE in ffmpeg-core.js ffmpeg-core.wasm; do
    curl "https://unpkg.com/@ffmpeg/core-st@${COREVER}/dist/${FILE}" > "${FILE}"
done