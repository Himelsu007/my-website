#!/bin/sh
# Bump the ?v= stamp on every local CSS/JS reference so browsers (and phones)
# fetch the new files instead of serving a cached copy.
# Run this before pushing whenever you change spot counts, the leaderboard,
# prices, or anything else in javascript/ or css/.
cd "$(dirname "$0")" || exit 1
VER=$(date +%Y%m%d%H%M%S)
python3 - "$VER" <<'PY'
import re, sys, glob
ver = sys.argv[1]
for p in glob.glob('*.html'):
    s = open(p, encoding='utf-8').read(); before = s
    s = re.sub(r'(<script[^>]*\bsrc=")(javascript/[^"?]+\.js)(?:\?v=\d+)?(")',
               lambda m: f'{m.group(1)}{m.group(2)}?v={ver}{m.group(3)}', s)
    s = re.sub(r'(<link[^>]*\bhref=")(css/[^"?]+\.css)(?:\?v=\d+)?(")',
               lambda m: f'{m.group(1)}{m.group(2)}?v={ver}{m.group(3)}', s)
    if s != before:
        open(p, 'w', encoding='utf-8').write(s)
print('assets version ->', ver)
PY
