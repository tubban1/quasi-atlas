#!/bin/bash
set -e
cd "$(dirname "$0")/.."
if [ ! -d node_modules ]; then
  echo "首次启动：安装项目依赖…"
  npm install
fi
echo ""
echo "Quasi Atlas: http://127.0.0.1:5188/"
echo "停止服务：在这里按 Control+C"
(sleep 2; open "http://127.0.0.1:5188/") >/dev/null 2>&1 &
npm run start
