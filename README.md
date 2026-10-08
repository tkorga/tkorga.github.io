# Tigistu Korga — Portfolio

A hand-built static site with no framework, no build step and no trackers. It is designed as a
**memory map**: each section lives at an address (`0x10 .about`, `0x20 .skills`, …), and the hero
has a live hexdump.

## Run locally
```sh
python3 -m http.server 8000   # then open http://localhost:8000
```

## Structure
```
index.html            all content (edit text here)
assets/css/styles.css design tokens at the top: colors, type scale, spacing
assets/js/main.js     theme toggle, mobile nav, scroll reveals, clock, hexdump
assets/img/og.png     1200×630 social preview
favicon.svg  404.html  robots.txt  sitemap.xml
```

## Before you publish
- [ ] Replace `https://tkorga.github.io/` (in `index.html`, `robots.txt`, `sitemap.xml`) with your real domain.
- [ ] Add internships or jobs to the `.path` timeline as they come. Copy an `<li class="tl-item">` block.
- [ ] Update the "open to internships" line in the hero once you've accepted an offer.
- [ ] To change the hexdump message, edit `text` in `main.js`. Lines of 15 characters plus `\n` fill exactly one row.

## Deploy
Any static host works. For GitHub Pages: push to a repo named `tkorga.github.io` and the site goes live at that address.
Netlify, Vercel and Cloudflare Pages work too: drag in the folder and there's nothing to configure.

## Built-in quality
- Semantic landmarks, skip link, visible focus styles, `aria-current` nav, live region for copy feedback
- Honors `prefers-reduced-motion` and `prefers-color-scheme`, with a manual theme toggle saved in localStorage
- Content is visible without JavaScript (animations are added only when JS loads)
- Open Graph and Twitter cards, JSON-LD `Person`, canonical URL, sitemap
- About 40 KB of code plus fonts; no JS dependencies
