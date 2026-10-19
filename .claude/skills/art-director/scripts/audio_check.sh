#!/usr/bin/env bash
# Loudness + true peak of a video/audio file: ./audio_check.sh film.mp4   (target -14 LUFS, TP <= -1 dBTP)
ffmpeg -nostats -i "$1" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I|LRA|Peak):"
