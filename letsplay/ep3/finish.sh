#!/bin/bash
# waits for ep3 narration + ep2 render, then builds ep3 audio and renders ep3
cd /home/user/private/letsplay/ep3
while pgrep -f "narration.py" >/dev/null; do sleep 20; done
python3 audio.py > build/audio.log 2>&1
while pgrep -f "PAGE=letsplay/ep2\|ep2/build/parts" >/dev/null || pgrep -f "node ../render.mjs [0-9]" >/dev/null; do sleep 20; done
mkdir -p build/parts
for i in 0 1 2 3; do a=$((i*75)); b=$((a+75)); PAGE=letsplay/ep3/index.html node ../render.mjs $a $b build/parts/p$i.mp4 > build/parts/log$i.txt 2>&1 & done
wait
echo done
