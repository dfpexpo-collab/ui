#!/usr/bin/env python3
"""Rebuild Mado.md: the user's own catalog of motion, design and content skills and agents in this repo.

Scans .claude/skills/*/SKILL.md and .claude/agents/*.md, skips brand skills (voom-brand), and groups
the rest by category. A skill missing from CATEGORIES lands under "Unsorted" until it is added here.

    python3 tools/mado/build_mado.py
"""
import re
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[2]
SKILLS = ROOT / ".claude" / "skills"
AGENTS = ROOT / ".claude" / "agents"
OUT = ROOT / "Mado.md"

EXCLUDE = {"voom-brand"}

# (heading, skill names) in display order
CATEGORIES = [
    ("الإخراج الفني والتخطيط", [
        "art-director", "motion-art-direction", "motion-prompt-playbook",
        "prompt-motion-templates", "premium-motion-reels", "od-motion-design",
    ]),
    ("أفلام وفيديوهات المنتج والإعلانات", [
        "saas-animation", "product-film", "product-launch-video", "launch-video",
        "ad-creative-video", "general-video", "motion-graphics",
    ]),
    ("موشن: مبادئ وتقنيات", [
        "animation-principles", "kinetic-typography", "logo-animation", "motion-background",
        "beat-sync-editing", "color-motion", "shot-composition", "od-shader-dev",
        "od-frame-glitch-title", "od-frame-liquid-bg-hero", "od-frame-logo-outro",
        "od-video-hyperframes",
    ]),
    ("HyperFrames", [
        "hyperframes", "hyperframes-core", "hyperframes-animation", "hyperframes-creative",
        "hyperframes-keyframes", "hyperframes-cli",
    ]),
    ("Remotion", ["remotion-motion-graphics"]),
    ("GSAP", [
        "gsap-core", "gsap-timeline", "gsap-plugins", "gsap-utils", "gsap-scrolltrigger",
        "gsap-react", "gsap-frameworks", "gsap-performance",
    ]),
    ("موشن الواجهات (UI)", [
        "od-animate", "od-emilkowalski-motion", "od-ui-animation", "od-review-animations",
    ]),
    ("ديزاين ومراجعة الجودة", [
        "design-qa", "od-design-review", "od-emil-design-eng", "od-impeccable-design-polish",
        "od-mockup-device-3d",
    ]),
]


def frontmatter(path):
    text = path.read_text(encoding="utf-8")
    m = re.match(r"^---\s*\n(.*?)\n---", text, re.S)
    if not m:
        return {}
    try:
        return yaml.safe_load(m.group(1)) or {}
    except yaml.YAMLError:
        # Unquoted descriptions with ": " inside are not valid YAML; read the fields line by line.
        return dict(re.findall(r"^(name|description):\s*(.*)$", m.group(1), re.M))


def summary(desc, limit=220):
    desc = " ".join(str(desc or "").split())
    first = re.split(r"(?<=[.!?])\s", desc, maxsplit=1)[0]
    return first if len(first) <= limit else first[: limit - 1].rstrip() + "…"


def main():
    skills = {}
    for d in sorted(p for p in SKILLS.iterdir() if (p / "SKILL.md").is_file()):
        if d.name in EXCLUDE:
            continue
        fm = frontmatter(d / "SKILL.md")
        files = sum(1 for f in d.rglob("*") if f.is_file())
        skills[d.name] = (summary(fm.get("description")), files)

    agents = []
    if AGENTS.is_dir():
        for f in sorted(AGENTS.glob("*.md")):
            fm = frontmatter(f)
            agents.append((fm.get("name", f.stem), summary(fm.get("description")), f.relative_to(ROOT)))

    placed = set()
    lines = [
        "# Mado",
        "",
        "مهاراتي في الموشن والديزاين وصناعة المحتوى: كل الـ skills والـ agents اللي ضفتها للريبو (من غير skills البراندات زي voom-brand).",
        "",
        "> الملف ده بيتبني أوتوماتيك من الريبو. ما تعدّلوش بإيدك: `python3 tools/mado/build_mado.py`",
        "",
        "## أنقلهم لأكونت تاني إزاي",
        "",
        "الملف ده فهرس، والـ skills نفسها في الريبو `dfpexpo-collab/ui` (ملفات وسكربتات وخطوط، أكبر من إن ملف واحد يشيلها).",
        "",
        "1. في الأكونت الجديد، افتح جلسة Claude Code وقوله: **\"هات Mado من dfpexpo-collab/ui\"**.",
        "2. لو الجلسة على ريبو تاني: هينسخ فولدرات الـ skills والـ agents اللي تحت لـ `.claude/skills/` و`.claude/agents/` في الريبو ده.",
        "3. لو عايزهم في claude.ai (Customize > Skills): هيعمل zip لكل skill ترفعه هناك.",
        "",
        f"**الإجمالي:** {len(skills)} skill و{len(agents)} agent.",
        "",
    ]

    if agents:
        lines += ["## Agents", "", "| Agent | بيعمل إيه | المكان |", "|---|---|---|"]
        for name, desc, rel in agents:
            lines.append(f"| `{name}` | {desc} | `{rel}` |")
        lines.append("")

    def table(names):
        out = ["| Skill | بيعمل إيه | ملفات |", "|---|---|---|"]
        for n in names:
            desc, files = skills[n]
            out.append(f"| `{n}` | {desc} | {files} |")
        return out + [""]

    for heading, names in CATEGORIES:
        present = [n for n in names if n in skills]
        if not present:
            continue
        placed.update(present)
        lines += [f"## {heading}", ""] + table(present)

    lib = SKILLS / "art-director" / "library"
    extras = sorted(d for d in lib.iterdir() if d.is_dir()) if lib.is_dir() else []
    if extras:
        lines += [
            "## جوه مكتبة الـ Art Director",
            "",
            "Skills مش متثبتة لوحدها في الريبو، محفوظة في `.claude/skills/art-director/library/` والـ Art Director بيقراها من هناك.",
            "",
            "| Skill | بيعمل إيه | ملفات |",
            "|---|---|---|",
        ]
        for d in extras:
            entry = d / "GUIDE.md"
            desc = summary(frontmatter(entry).get("description")) if entry.is_file() else "حزمة خارجية، فهرسها في `library/INDEX.md`"
            files = sum(1 for f in d.rglob("*") if f.is_file())
            lines.append(f"| `{d.name}` | {desc} | {files} |")
        lines.append("")

    unsorted = [n for n in skills if n not in placed]
    if unsorted:
        lines += ["## Unsorted", "", "أضفها لـ `CATEGORIES` في `tools/mado/build_mado.py`.", ""] + table(unsorted)

    OUT.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")
    print(f"Mado.md: {len(skills)} skills, {len(agents)} agents, {len(unsorted)} unsorted")


if __name__ == "__main__":
    main()
