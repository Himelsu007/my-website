#!/bin/sh
# Order emails show each item at 44px, and not every mail app reads WebP
# (Outlook on Windows doesn't). So every product photo also gets a 132px JPG
# on white at assets/images/email/p/<same path>.jpg, which the Sheet script's
# emailImage_ points at. Only missing or outdated ones are made.
# Needs macOS sips; anywhere else it says so and leaves them as they are.
cd "$(dirname "$0")/.." || exit 1
command -v sips >/dev/null 2>&1 || { echo "email thumbs -> skipped (no sips)"; exit 0; }
find assets/images/products -type f \( -name '*.webp' -o -name '*.png' -o -name '*.jpg' \) ! -name '*-motion*' |
while read -r src; do
    rel=${src#assets/images/products/}
    out="assets/images/email/p/${rel%.*}.jpg"
    [ "$out" -nt "$src" ] && continue
    mkdir -p "$(dirname "$out")"
    sips -s format jpeg -s formatOptions 82 -Z 132 "$src" --out "$out" >/dev/null 2>&1 &&
    sips --padToHeightWidth 132 132 --padColor FFFFFF "$out" >/dev/null 2>&1
done
echo "email thumbs -> $(find assets/images/email/p -name '*.jpg' 2>/dev/null | wc -l | tr -d ' ') product photos"
