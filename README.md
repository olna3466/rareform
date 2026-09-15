# RAREFORM landing page

Single-page marketing site for RAREFORM, a curated platform for independent fashion and accessory brands. Vite + vanilla HTML/CSS/JS, no framework.

## Run

```powershell
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle in dist/
npm run preview  # serve dist/ locally
```

## Layout

- `index.html` — semantic markup: pattern rail, main content, portrait panel, pattern strip, brand-application `<dialog>`.
- `src/style.css` — all styling. The nine pattern tiles are photographic textures in `public/patterns/`, cropped from the brand collage and mapped to `:root` custom properties (`--pat-zebra` … `--pat-dots`) so they can be reused anywhere via `background-image: var(--pat-…)`.
- `src/tiles.js` — fills the rail/strip with tiles, keeps them square-ish on resize, and crossfade-swaps two random tiles every 4s.
- `src/forms.js` — email capture with inline validation and a mocked 1s submit.
- `src/modal.js` — accessible brand-application modal: focus trap, Esc/overlay close, focus restore.

## Breakpoints

| Width | Layout |
| --- | --- |
| ≥1200px | Rail (12%) · main · portrait panel (30%), bottom strip, all within one viewport height |
| 768–1199px | Top strip, main, portrait panel, bottom strip |
| <768px | Same stack; 40px headline, stats shrink and wrap to 2+1 if needed |

## Notes

- No backend. Both forms resolve after a 1s mock delay.
- Brand assets live in `public/brand/`: the wordmark and RF mark (backgrounds knocked out to transparent), the hero textile placeholder, and the full set of texture images from the deck under `textures/`. The hero image is a textile stand-in until a fashion photo is supplied.
- The CTA button uses `--terracotta-cta` (#B84E37), a 4% darker terracotta, so 14px white text clears WCAG 4.5:1. Badges and other terracotta surfaces use the spec colour #C4573F.
