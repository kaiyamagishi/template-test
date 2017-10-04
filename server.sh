#!/usr/bin/env bash

echo '念のため'
./kill.sh
echo ''

# フロント専門の人はこっちを実行せよ
# サーバーサイドもやりなよ
gulp server&
npm run watchpack&

echo '起動したでよ'
