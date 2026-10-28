#!/bin/sh
# Publish Matrix's stock to the live store, and nothing else.
#
# Matrix runs this a minute after stock changes there (and once at launch):
# it pulls, reads the stock from Matrix (tools/sync-stock.mjs), and only if a
# count or a size changed does the rest of a publish — ./bump-assets.sh for the
# stamps, product pages and feed — then commits and pushes to main.
#
# It never publishes someone's unfinished work: with any uncommitted change in
# the repo (bar .DS_Store) it stops at "busy" and Matrix tries again later.
# The last line it prints is the result: published / unchanged / busy / error.
cd "$(dirname "$0")/.." || { echo "error: no repo"; exit 1; }
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH" GIT_TERMINAL_PROMPT=0

if git status --porcelain | grep -v '\.DS_Store$' | grep -q .; then
    echo "busy: the site has uncommitted changes"; exit 0
fi
git pull --rebase --autostash -q origin main >/dev/null 2>&1 || { echo "error: git pull failed"; exit 1; }

before=$(git hash-object javascript/product-stock.js)
node tools/sync-stock.mjs >/dev/null || { echo "error: stock sync failed"; exit 1; }
if [ "$(git hash-object javascript/product-stock.js)" = "$before" ]; then
    echo "unchanged"; exit 0
fi

./bump-assets.sh >/dev/null || { git checkout -q -- . ; echo "error: store build failed"; exit 1; }
git add -A -- . ':!.DS_Store'
changed=$(git diff --cached -U0 javascript/product-stock.js | grep '^+  ' | sed 's/^+ *//; s/,$//')
git commit -q -m "Stock from Matrix

$changed" || { echo "error: commit failed"; exit 1; }
if ! git push -q origin main >/dev/null 2>&1; then
    git pull --rebase -q origin main >/dev/null 2>&1 && git push -q origin main >/dev/null 2>&1 \
        || { echo "error: push failed (committed locally)"; exit 1; }
fi
echo "published: $(echo "$changed" | grep -c .) product(s) changed"
