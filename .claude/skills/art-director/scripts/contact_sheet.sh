#!/usr/bin/env bash
# Contact sheet of a video at N fps (default 2): ./contact_sheet.sh film.mp4 out.jpg [fps] [cols]
set -e; in=$1; out=${2:-contact.jpg}; fps=${3:-2}; cols=${4:-16}
d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$in"); n=$(python3 -c "import math;print(math.ceil($d*$fps))")
rows=$(( (n + cols - 1) / cols ))
ffmpeg -loglevel error -y -i "$in" -vf "fps=$fps,scale=135:-1,tile=${cols}x${rows}" -frames:v 1 "$out" && echo "$out ($n frames, ${cols}x${rows})"
