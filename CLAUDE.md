# Locked In Lx website

Static HTML/CSS/JS for www.lockedinlx.com: Lisbon pickup basketball runs, training, and a store that sells through WhatsApp. GitHub Pages deploys from `main`. The bare domain redirects to `www`.

## Workflow

- Commit straight to `main` and push. Don't open a pull request unless the owner asks for one. The site goes live about 30–60 seconds after a push.
- After any change to CSS, JS or the product catalogue, run `./bump-assets.sh` before committing. It:
  - updates the `?v=` stamps
  - syncs stock from Matrix (this only works on the owner's Mac)
  - rebuilds the generated store files listed below
- Matrix publishes stock on its own. A minute after stock changes in Matrix (and once when it opens), it runs `tools/publish-stock.sh`:
  - it syncs the stock, and stops at "unchanged" if nothing moved;
  - otherwise it runs `./bump-assets.sh`, commits "Stock from Matrix" and pushes;
  - it stops at "busy" while the repo has uncommitted changes, so commit or stash your work, or the store's stock waits.
- The site is published by `.github/workflows/static.yml`, which uploads the repo as it is (no Jekyll) after removing `CLAUDE.md`, `docs/`, `tools/`, `bump-assets.sh` and `skills-lock.json`. Anything else in the repo is public, so keep personal details out of it.
- Check it's live with `curl -sL "https://www.lockedinlx.com/<page>?nc=$RANDOM"` and wait until the `?v=` stamp matches the commit. Use `www` and `-L`, because the bare domain redirects. Pages are cached for 10 minutes.
- When replacing an image, give it a new filename so browsers don't keep showing the old one.

## Generated files: never edit by hand

- `store/*/index.html`: one page per product, built from `merch.html`
- `feeds/google-merchant.xml`
- the `lx:store` block in `sitemap.xml`
- the `lx:store-ld` block in `merch.html`
- `javascript/product-stock.js`

`tools/build-store.mjs` writes the first four from the catalogue. `tools/sync-stock.mjs` writes the stock file from Matrix, the owner's inventory app.

## Product catalogue: `javascript/product-catalog.js`

- Names and SKUs come from Matrix's inventory. Matrix is the source of truth for naming.
- Never change an existing `sku`. Renaming a product changes three things:
  - its page address (pin the old one with `slug`)
  - its order-link code (use `replaces`)
  - bag matching
- So, to show a shorter name on the shelf, set `shelfName` and keep the full `name`, colour included, for the product sheet, orders and Google.
- Colours of one model (the black and white tanks, the black and white tees) are separate products with their own shelf cards. A shared `colorGroup` plus a `colorName` on each gives the product sheet a Colour row: one button per colour, and tapping one swaps the sheet to that product (photo, sizes, stock and address), keeping the picked size if it's in stock.
- The shelf order is the catalogue order: the best-seller row (tanks and tees) first, then the newest arrivals, then the rest.
- Stock and sizes come from Matrix (`lxApplyStock` in `product-catalog.js`), whatever `options` lists:
  - Clothing sizes (S, M, L, XL) are every size Matrix holds, in order. A size at 0 shows dimmed with an "Out of stock" tooltip.
  - Other sizes (socks' 42 - 46, a ball's 7) are only the ones in stock. The owner's socks are all 42 - 46.
  - A product at 0 moves to "Back Soon" (with a WhatsApp "Notify me"), and goes back onto the shelf when Matrix has stock again.
  - Quantity in the sheet and in the bag is capped by stock.
  - `matrixSku` is set where Matrix's SKU differs from ours.
  - Only products Matrix doesn't have carry a hand-set `stock`.
- Don't change prices without asking. Some Matrix prices differ from the store on purpose.

## Images

- Use WebP, made with `cwebp -q 84–88`, about 1200 px for product shots.
- Product shots sit on pure white. Lift a light-grey studio background to white with ffmpeg `curves`.
- The product sheet's gallery crops photos to fill its frame. The frame is tall on desktop (about 0.82 wide-to-tall) and wide on phones (about 1.1). Crop lifestyle photos to about 0.95 so heads and the product stay in frame on both.
- Basketballs are shown whole (`contain`), with no delivery line.
- Size every image to how it's shown, about 3× its on-screen width, never a camera original. A 12-megapixel photo takes seconds to decode on a phone and stalls scrolling while it does.
- The home hero's photos are in `assets/images/hero/` in two sizes: `<name>-1200.avif` for phones, `<name>-1920.avif` for larger screens. `javascript/hero_section.js` picks one, and the two preloads at the top of `index.html` must name the same first photo.

## Fonts

- Barlow Condensed and Inter are served from `assets/fonts/` (`@font-face` in `css/fonts.css`), not Google Fonts. Don't add the Google Fonts link back.
- Pages preload Barlow Condensed 900 and 700 so headings don't reflow when the font lands. The legal pages and the store also preload 400. Don't preload Inter: at 71 KB it delays the first paint more than it saves.

## Design decisions the owner has made

- **Product sheet:** light on desktop (900 px and wider), dark on phones. On phones it's a centred card at 95% of the screen height over a blurred store. One theme for every product, not per product.
- **Store hero** (top of `merch.html`, `css/store-hero.css`, `javascript/store-hero.js`):
  - Light editorial look after the Kinfield reference the owner chose: the black headline "Wear what the pros wear.", small mono labels, a tracking ring with a gold dot on the player, numbered colour tabs, a gold "Shop the tank" button. The owner rejected a framed box behind the players and a dark version.
  - Five players (`assets/images/store-hero/shot-1…5`, 4:5, black and white tanks alternating) take turns every 3 seconds and fade into the page with no frame. Each `<img>` says the tank's colour (`data-c`), where the ring and the chip sit on him (`data-ring`, `data-chip`, % of the photo) and how far right to move him so his head clears the headline (`data-x`). To add a player, add an `<img>` with those and the photo at 760 and 960 px wide.
  - The colour tabs follow the photo on show, and tapping one keeps to that colour's players. Colours follow the catalogue: a colour that can't be bought leaves the hero, players and all, and the price and link come from the product. `build-store.mjs` drops the first photo's `fetchpriority` on product pages, so the sheet's photo loads first.
  - On phones there is no "Shop the tank" button (the owner's call); an animated scroll cue at the foot leads to the shelf. The owner tried and rejected dark and per-photo-colour backgrounds: keep it light.
- **Bag:** a light floating panel on desktop, dark on phones.
- **Order slip:** `order.html` stays dark.
- **Training page pack cards** are React Bits' Pixel Card, ported to plain JS (`javascript/pixel-card.js`, `css/pixel-card.css`; turn one on with `data-pixel-card`). Pixels ripple out on hover, focus or tap, and once when a card scrolls into view. Shooting Drills uses the blue preset and Drills & Recovery the yellow one. Both use `data-pixel-fade="0.85"` and `data-pixel-opacity="0.75"` so the text stays readable over the pixels (the demo cards hold far less text). They replaced the old frame: grain, gold glow, gold border and hover lift.
- **Sign-up forms** (`private_run_sign_up.html`, `training_sign_up.html`): no `alert()` boxes. `javascript/signup-motion.js` gives them their motion: the summary card's steps tick off as they go, changing numbers roll, a missing answer shakes and says what it needs (`lxSignup.flag`), and sending draws a check on the button and bursts confetti (`lxSignup.success`). WhatsApp still opens straight from the tap.
- **Shelf cards:**
  - no borders, rings or panels around them
  - hovering only lifts the card and zooms the photo, with no gold
  - tags have square-ish corners (5 px radius)
- **Desktop scale (`css/desktop-scale.css`):**
  - laptops (up to 1799 px wide, with a mouse or trackpad): 80% for the site, 90% for the store
  - large monitors: 90% for the site, 100% for the store
  - the store's header always matches the other pages' header
- **Phones:**
  - Every page's status bar area is white, with no line showing under it, and so is the bar behind Safari's address bar while a product sheet is open (`css/statusbar.css`).
    - iOS 26 Safari ignores `theme-color`. It colours each bar from the CSS `background-color` of the frontmost fixed element at that edge, and skips any element 10 px tall or less.
    - `.lx-statusbar` (top, every page) and `.lx-chin` (bottom, store) are 12 px strips whose white is clipped to an empty box: Safari reads it, nothing is drawn. Don't make them thinner, give them a border, or let their white show.
    - `theme-color` stays white on every page, and in `site.webmanifest`, for older iPhones and Android.
  - Full-screen overlays must be `visibility: hidden` when closed. iOS Safari paints the colour of fixed layers behind its bars, which showed up as black bands.
- **Home page:** don't redesign it without asking first. A type-led "sentence as layout" redesign was rejected. Keep the current brand look: the plum "LOCKED IN?", the section labels, and the event cards with the moving border.
  - First-time visitors didn't know there was a store. On the home page the header's Store link is a "Store" pill that appears with the nav bar on scroll (the owner wants it hidden until then). Under the WhatsApp pill (faces, "Join the group chat", green button) sits its twin for the store (product shots from `assets/images/home-store/`, "Shop the store", and the bag icon from the store's bag button in black on white). A busier store card that turned through products and prices was tried and removed at the owner's request.
  - On phones the hero is only as tall as its content, so the upcoming runs show below it.
  - The hero shares the store hero's motion: a light through "LOCKED IN?", the label above it decoding, and a scroll cue (computers and tall phones). On phones the stats sit in one row.

## Orders, order emails and the Sheet script

- An order goes to WhatsApp with a short link, `lockedinlx.com/o/#XU4F-K7M2P9` (the reference, then a random key from `crypto.getRandomValues`). `o/index.html` asks the Sheet for the full order link and forwards to `order.html?s=…`, whose scan code then encodes the short link. The key stops anyone walking references to other people's addresses.
- The bag asks for an optional "Email for order updates". It goes to the Sheet only, never into the order link.
- `docs/google-apps-script.gs` runs behind the Player Roster Sheet. The owner pastes it into Extensions → Apps Script and then has to Deploy → New version; the site and Matrix only see the deployed version.
  - Keep that file plain ASCII: write special characters as `’`-style escapes. Pasted through the clipboard, anything else arrived garbled (`,Äô` for `’`). Copy it with `LANG=en_US.UTF-8 pbcopy`.
  - Order emails are sent by hand from Matrix (the owner's call: an accidental Status edit in the Sheet must not email a customer). Matrix uses `?orderEmail=<ref>&key=…[&status&to&note&eta][&send=1]` and the status route `{kind:'status', ref, status, key}`, both locked behind the Sheet's `MATRIX_KEY`. Automatic sending exists but is off unless the Sheet's Locked In menu turns it on.
  - Emails go out from support@lockedinlx.com (iCloud+ domain, through Gmail's "Send mail as"), with the Gmail account as fallback.
  - Email photos are 132 px JPGs on white in `assets/images/email/p/` (same paths as `assets/images/products/`), made by `tools/email-thumbs.sh` during `./bump-assets.sh`, because not every mail app shows WebP. A new product photo gets one on the next bump.
  - Locked In → "Send test emails…" sends all seven designs to any address; "Repair Signups & Roster" rebuilds those tabs if they are turned into a Google Sheets Table again.

## Legal pages

- Privacy Policy, Cookie Policy, Store Terms (`whatsap_merchandise_disclaimer.html`, kept at that address), Terms of Participation and the Injury Waiver were rewritten in plain English on 3 Nov 2026, set for reading with `css/legal.css`. Update the "Last updated" line with any change.
- The owner's name is not shown anywhere on the site (their choice): it's "Locked In Lx, Lisbon, Portugal" and support@lockedinlx.com.
- The facts they state, which must stay in step with the site: refunds for runs and training are full if cancelled 2+ hours before, 50% after that, full if Locked In cancels (the home FAQ says the same); data is kept 12 months, accounting records 10 years; payment is MB WAY, bank transfer or cash, on delivery or at pickup; 30-day returns; order links close on delivery, cancellation or after 18 days.

## Things that need the owner's Mac

- The Matrix stock sync. In the cloud, `sync-stock.mjs` finds no Matrix, keeps the last stock, and the rest of the build still runs.
- Photos in `~/Downloads` and in Matrix's media folder. Images for the site need to be committed to the repo first.

## Google

The product pages, sitemap and Merchant Center feed are already built. Search Console and Merchant Center are the owner's own steps. Don't suggest a Google Business Profile: the owner can't have one.
