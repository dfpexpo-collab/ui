#!/usr/bin/env bash
# Install the Voom brand fonts (Gabarito, IBM Plex Sans Arabic, Poppins) for this machine/session,
# so Chromium/Playwright, HyperFrames, Remotion and fontconfig find them by family name.
# Safe to run again.  bash tools/fonts/install_voom_fonts.sh
set -euo pipefail
root="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"
src="$root/.claude/skills/voom-brand/assets/fonts"
case "$(uname -s)" in Darwin) dst="$HOME/Library/Fonts" ;; *) dst="$HOME/.fonts/voom" ;; esac   # Windows: right-click the .ttf files > Install for all users
[ -d "$src" ] || exit 0
mkdir -p "$dst"
cp -u "$src"/*.ttf "$dst"/
command -v fc-cache >/dev/null && fc-cache -f "$HOME/.fonts" >/dev/null 2>&1 || true
