#!/bin/bash
# Resume after container restart: render+publish ep4, then ep5.
R=/home/user/private; L=$R/letsplay
for ep in 4 5; do
  cd $L/ep$ep; [ -f build/audio.wav ] || python3 audio.py > build/audio.log 2>&1
  rm -rf build/parts; mkdir -p build/parts
  for i in 0 1 2 3; do a=$((i*75)); b=$((a+75)); PAGE=letsplay/ep$ep/index.html node ../render.mjs $a $b build/parts/p$i.mp4 > build/parts/log$i.txt 2>&1 & done; wait
  printf "file 'parts/p0.mp4'\nfile 'parts/p1.mp4'\nfile 'parts/p2.mp4'\nfile 'parts/p3.mp4'\n" > build/list.txt
  ffmpeg -y -loglevel error -f concat -safe 0 -i build/list.txt -i build/audio.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart build/full.mp4
  ffmpeg -y -loglevel error -i build/full.mp4 -c:v libx264 -preset veryfast -crf 31 -c:a aac -b:a 128k -movflags +faststart shardwild_ep${ep}_web.mp4
  cd $R && git add -f letsplay/ep$ep/shardwild_ep${ep}_web.mp4 && git commit -qm "Add rendered video: Episode $ep

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01J62yTktpiunm1PTbZep3t6"
  for d in 2 4 8 16 32; do git push -q origin claude/voxel-survival-letsplay-k76okk && break; sleep $d; done
  echo "[$(date +%H:%M)] ep$ep published"
done
