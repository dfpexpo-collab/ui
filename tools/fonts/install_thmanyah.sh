#!/usr/bin/env bash
# Install the thmanyah font family (Sans, Serif Text, Serif Display; Light–Black) on this machine only.
# Licence: the font files may NOT be uploaded, hosted or redistributed (thmanyah Font License), so they
# never go into this repo or into published pages as font files. Outlined text (SVG paths) in designs is fine.
#   bash tools/fonts/install_thmanyah.sh <Thmanyah-Font-Family.zip>
set -euo pipefail
tmp=$(mktemp -d); unzip -q "$1" -d "$tmp"
mkdir -p ~/.fonts/thmanyah && find "$tmp" -name '*.otf' -exec cp {} ~/.fonts/thmanyah/ \;
fc-cache -f ~/.fonts >/dev/null && rm -rf "$tmp"
fc-list | grep -ic thmanyah | xargs echo "thmanyah faces installed:"
