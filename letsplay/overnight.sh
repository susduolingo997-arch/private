#!/bin/bash
# Overnight pipeline: finish ep2+ep3 (ep3/finish.sh), mux + publish; then ep4 audio, render, mux + publish.
R=/home/user/private; L=$R/letsplay
log() { echo "[$(date +%H:%M)] $*"; }
mux() { # $1=ep dir  $2=name
  cd $L/$1 && printf "file 'parts/p0.mp4'\nfile 'parts/p1.mp4'\nfile 'parts/p2.mp4'\nfile 'parts/p3.mp4'\n" > build/list.txt &&
  ffmpeg -y -loglevel error -f concat -safe 0 -i build/list.txt -i build/audio.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart build/full.mp4 &&
  ffmpeg -y -loglevel error -i build/full.mp4 -c:v libx264 -preset veryfast -crf 31 -c:a aac -b:a 128k -movflags +faststart $2 && log "muxed $1 $(du -h $2 | cut -f1)"; }
publish() { cd $R && git add -f "$@" .github/workflows/release.yml && git commit -qm "Add rendered video(s): $*

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01J62yTktpiunm1PTbZep3t6" ; for d in 2 4 8 16 32; do git push -q origin claude/voxel-survival-letsplay-k76okk && { log "pushed $*"; return; }; sleep $d; done; log "PUSH FAILED $*"; }
while pgrep -f "ep3/finish.sh" >/dev/null; do sleep 30; done
log "ep2+ep3 renders done"
mux ep2 shardwild_ep2_web.mp4; mux ep3 shardwild_ep3_web.mp4
publish letsplay/ep2/shardwild_ep2_web.mp4 letsplay/ep3/shardwild_ep3_web.mp4
cd $L/ep4; while pgrep -f "narration.py" >/dev/null; do sleep 20; done
python3 audio.py > build/audio.log 2>&1; log "ep4 audio: $(tail -1 build/audio.log)"
mkdir -p build/parts
for i in 0 1 2 3; do a=$((i*75)); b=$((a+75)); PAGE=letsplay/ep4/index.html node ../render.mjs $a $b build/parts/p$i.mp4 > build/parts/log$i.txt 2>&1 & done; wait
log "ep4 render done"; mux ep4 shardwild_ep4_web.mp4; publish letsplay/ep4/shardwild_ep4_web.mp4
log ALL DONE
