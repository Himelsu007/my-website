# Locked In Lx website

Static HTML/CSS/JS for www.lockedinlx.com: Lisbon pickup basketball runs, training, and a store that sells through WhatsApp. GitHub Pages deploys from `main`. The bare domain redirects to `www`.

## Workflow

- Commit straight to `main` and push. Don't open a pull request unless the owner asks for one. The site goes live about 30–60 seconds after a push.
- After any change to CSS, JS or the product catalogue, run `./bump-assets.sh` before committing. It:
  - updates the `?v=` stamps
  - syncs stock from Matrix (this only works on the owner's Mac)
  - rebuilds the generated store files listed below
- Check it's live with `curl -sL "https://www.lockedinlx.com/<page>?nc=$RANDOM"` and wait until the `?v=` stamp matches the commit. Use `www` and `-L`, because the bare domain redirects. Pages are cached for 10 minutes.
- When replacing an image, give it a new filename so browsers don't keep showing the old one.

## Generated files: never edit by hand

- `store/*/index.html`: one page per product, built from `merch.html`
- `feeds/google-merchant.xml`
- the `lx:store` block in `sitemap.xml`
- the `lx:store-ld` block in `merch.html`
- the `lx:home-store` block in `index.html` (the store card in the home hero)
- `javascript/product-stock.js`

`tools/build-store.mjs` writes the store pages, the feed, the sitemap block and the two HTML blocks from the catalogue. `tools/sync-stock.mjs` writes the stock file from Matrix, the owner's inventory app.

## Product catalogue: `javascript/product-catalog.js`

- Names and SKUs come from Matrix's inventory. Matrix is the source of truth for naming.
- Never change an existing `sku`. Renaming a product changes three things:
  - its page address (pin the old one with `slug`)
  - its order-link code (use `replaces`)
  - bag matching
- So, to show a shorter name on the shelf, set `shelfName` and keep the full `name`, colour included, for the product sheet, orders and Google.
- The shelf order is the catalogue order: the best-seller row (tanks and tees) first, then the newest arrivals, then the rest.
- Stock comes from Matrix:
  - A size at 0 shows dimmed with an "Out of stock" tooltip.
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
  - First-time visitors didn't know there was a store, so the owner chose a store card for the hero: a second iPhone-style card under the WhatsApp one, turning through a few products with their prices (`HOME_PICKS` in `build-store.mjs`, thumbnails in `assets/images/home-store/` at 120 px). On the home page the header's Store link shows from the start, as a "Store" pill.
  - The hero shares the store hero's motion: a light through "LOCKED IN?", the label above it decoding, and a scroll cue (computers and tall phones). On phones the stats sit in one row.

## Things that need the owner's Mac

- The Matrix stock sync. In the cloud, `sync-stock.mjs` finds no Matrix, keeps the last stock, and the rest of the build still runs.
- Photos in `~/Downloads` and in Matrix's media folder. Images for the site need to be committed to the repo first.

## Google

The product pages, sitemap and Merchant Center feed are already built. Search Console and Merchant Center are the owner's own steps. Don't suggest a Google Business Profile: the owner can't have one.
