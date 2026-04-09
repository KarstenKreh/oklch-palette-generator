# standby.design

Design tool suite at [standby.design](https://standby.design). Generates production-ready design systems (colors, typography, spacing) for designers and developers.

---

## Architecture

```
standby.design/              Hub landing page (static HTML)
├── /color                    OKLCH Palette Generator (React SPA)
├── /type                     Fluid Type Scale Generator (React SPA)
├── /shape                    Shape Token Generator (React SPA)
├── /system                   Design System Viewer (React SPA)
├── /api/fonts                Fontshare catalog proxy (CORS workaround)
├── /color/og-image?c=HEX    Dynamic OG image endpoint (SVG → PNG via sharp)
└── og-server.js              Node.js server: routing, static files, OG injection
```

### Apps

| App | Dir | Route | Purpose |
|-----|-----|-------|---------|
| **Color** | `color-react/` | `/color` | OKLCH palette generation: 18-step scales, semantic tokens, shadows, light/dark/HC modes, shadcn/ui export |
| **Type** | `type-react/` | `/type` | Fluid type scales with `clamp()`, three scale modes, Fontshare font preview, spacing derivation |
| **Shape** | `shape-react/` | `/shape` | Shape tokens: shadows, borders, radii, glass effects, focus rings |
| **System** | `system-react/` | `/system` | Combined design system viewer: merges color + type + shape into a single export |
| **Hub** | `index.html` | `/` | Landing page linking to all tools |
| **Legacy** | `color/` | — | Original vanilla JS color tool (superseded, kept for reference only — never edit) |

### Shared Stack

All three React apps share identical dependencies:
- **React 18.3** + **Vite 5.4** + **TypeScript 5.6**
- **Tailwind CSS v4.2** (with `@tailwindcss/vite` plugin)
- **Zustand 5** (state management)
- **Base UI React 1.3** (headless components)
- **Lucide React** (icons), **Sonner** (toasts), **next-themes** (dark mode)
- **shared.css** — full Standby.Design theme: primitive tokens (Brand/Surface/Error/Neutral/Success/Warning/Info), semantic tokens (light+dark, shadcn/ui compatible), Tailwind v4 `@theme inline` bridge

### Shared Patterns

- **State**: Zustand stores with `setFullState()` for bulk updates from URL decode (Color + Type). System app is read-only (no store).
- **Unified URL persistence**: All tools share a unified hash format: `#c=<color-hash>&t=<type-hash>&s=<shape-hash>`. Each tool reads/writes only its own segment, preserves the rest. Legacy hashes are auto-detected for backward compatibility. See `lib/unified-hash.ts`.
- **Cross-tool navigation**: Color → Type → System flow via links that carry the full hash. Each link encodes the current tool's state and passes through the other segments.
- **Export**: CSS custom properties, Tailwind v4 `@theme`, design tokens JSON. System app provides a merged export combining color + type tokens.
- **UI**: shadcn/ui-style components in `components/ui/` (Button, Tabs, Slider, etc.)
- **Dark-only UI**: All apps force dark mode for their own chrome

---

## Color App — OKLCH Palette Generator

### Core Concept

Takes a brand color (hex) and generates an 18-step perceptually uniform palette in OKLCH color space, with semantic token mapping, shadow generation, and multi-mode export.

### State (`store/theme-store.ts`)

| Field | Type | Default | Purpose |
|-------|------|---------|---------|
| `brandHex` | string | `#335A7F` | Primary brand color |
| `bgColorHex` | string | — | Surface tint color (can auto-match brand) |
| `bgAutoMatch` | boolean | true | Surface mirrors brand color |
| `errorColorHex` | string | `#CC3333` | Error/destructive color |
| `errorAutoMatch` | boolean | true | Error auto-derives from brand hue |
| `currentMode` | `'balanced' \| 'exact'` | — | Palette generation algorithm |
| `chromaScale` | number | 0–1.0 | Surface saturation (0=grey, 1=vibrant) |
| `brandPin` / `errorPin` | boolean | — | Lock semantic tokens to exact input hex |
| `brandInvert` / `errorInvert` | boolean | — | Invert pinned color lightness in dark mode (L → 1-L) |
| `fgContrastMode` | `'best' \| 'preferLight' \| 'preferDark'` | — | Text color strategy on colored backgrounds |
| `extraAccents` | Accent[] | 3 defaults | Up to 3 additional named accent colors (default: Success, Warning, Info with autoMatch) |
| `themeName` | string | — | User-defined name (appears in exports, title, OG) |

**Accent fields**: `{ name, hex, pin, invert, autoMatch, autoHue }` — `autoMatch` derives the accent hue from the brand color, `invert` mirrors lightness in dark mode.

### Palette Generation (`lib/palette.ts`)

**18 Steps**: `[25, 50, 75, 100, 200, 300, 400, 500, 600, 700, 800, 825, 850, 875, 900, 925, 950, 975]`

Zones:
- **Light Surfaces** (25–100): Near-white, low chroma
- **Core Palette** (200–800): Main usable range
- **Dark Surfaces** (825–875): Dark mode backgrounds
- **High Contrast** (900–975): Near-black, minimal chroma

**Two Modes**:

| Mode | Step 500 Lightness | Chroma Envelope | Use Case |
|------|-------------------|-----------------|----------|
| **Balanced** | Always L=0.50 (perceptual midpoint) | Inverted parabola: `1 - (2L-1)²` | Even light/dark distribution |
| **Exact** | Input color's actual lightness | Parabolic: `1 - (1-norm)²` | Brand-exact midpoint |

**Chroma Envelope**: Controls how saturation distributes across the scale. Maximum at midpoint, falling to zero at white/black extremes. Creates natural, smooth palettes.

**Surface Chroma Correction**: `pow(L / 0.45, 1.2)` boosts chroma for very dark surfaces (L < 0.45) so they don't look washed out.

**Gamut Safety**: All colors clamped to sRGB via binary search (20 iterations) with 95% safety margin.

**Generated Palettes**: Brand (full chroma), Surface (reduced by `chromaScale`), Error, Error Surface, Neutral (0% chroma), + up to 3 accent colors.

### Color Math (`lib/color-math.ts`)

Conversion pipeline: `Hex → RGB → Linear sRGB → OKLab → OKLCH` (and reverse)

Key functions:
- `hexToOklch()` / `oklchToHex()` — full pipeline
- `isInGamut(L, C, H)` — sRGB gamut check with ±0.001 tolerance
- `maxChromaInGamut(L, H)` — binary search for maximum displayable chroma
- `contrastRatio(hex1, hex2)` — WCAG contrast ratio
- `relativeLuminance(hex)` — ITU-R BT.709 coefficients
- `rgbToHsv` / `hsvToRgb` / `rgbToHsl` / `hslToRgb` — for color picker UI

### Shadows (`lib/shadows.ts`)

5 elevation levels scaled by **golden ratio** (phi ≈ 1.618):
- xs (0.618×), sm (0.786×), md (1×), lg (1.272×), xl (1.618×)

Each level: 2-layer CSS shadow with hue-matched color from surface palette. Dark mode shadows use 2× alpha multiplier.

### Semantic Tokens (`lib/code-export.ts`)

**4 export formats**:

| Format | Function | Output |
|--------|----------|--------|
| Primitives OKLCH | `generatePrimitivesOklch()` | `:root { --color-brand-25: oklch(...); ... }` |
| Primitives Hex | `generatePrimitivesHex()` | Same but hex values |
| Semantic | `generateSemantic()` | `:root` + `.dark` with shadcn/ui-compatible mappings |
| LLM Briefing | `generateLlmBriefing()` | Markdown doc for AI code generation |

**Semantic mapping** (shadcn/ui compatible):
- `--primary` → brand-600 (light) / brand-400 (dark)
- `--background` → surface-50 (light) / surface-875 (dark)
- `--destructive` → error-600 (light) / error-400 (dark)
- `--border`, `--muted`, `--accent`, `--ring`, `--sidebar-*` — all mapped
- Each accent color gets 12 semantic tokens × 2 modes

**Foreground contrast logic**: Picks light or dark text based on WCAG contrast ratio and user preference mode (best/preferLight/preferDark).

**Lightness Invert** (`invertHex` in `color-math.ts`): For pinned colors, mirrors OKLCH lightness (L → 1-L) while preserving hue and chroma, with gamut clamping. Allows e.g. black buttons in light mode, white in dark mode. Applied per-color via `brandInvert`, `errorInvert`, `accent.invert`.

**Contrast Warnings**: When a pinned color has low contrast (< WCAG AA 4.5:1) against light or dark surfaces, a warning icon appears with tooltip specifying which mode is affected. Also injected as CSS comments in the semantic export and as a callout in the LLM briefing.

### URL State (`lib/url-state.ts`)

Format: `#brand,bg,bgAuto,error,errAuto,chroma%,mode,brandPin,errorPin,fgMode,name,brandInvert,errorInvert!accentName:hex:pin:autoMatch:autoHue:invert`

Backwards compatible: old URLs with fewer fields decode with invert=false defaults.

Also supports `?t=ThemeName&c=HEX` query params for server-side OG tag injection.

### Components

**Controls**: `seed-colors.tsx` (main panel), `color-picker.tsx` (HSV picker with HSL/RGB inputs), `color-input.tsx` (hex input + swatch), `accent-inputs.tsx` (up to 3 extra colors with auto/pin/invert), `chroma-slider.tsx` (0–100% surface saturation), `mode-switch.tsx` (segmented toggle)

**UI Components**: `ui/tooltip.tsx` (Base UI tooltip with zero delay, TooltipProvider in App root), `ui/toggle.tsx`, `ui/button.tsx`, etc.

**Preview**: `surface-preview.tsx` (2×2 grid), `surface-panel.tsx` (one theme mode with cards, buttons, shadows, badges)

**Export**: `code-export.tsx` (4-tab code viewer + "Copy All" dropdown), `palette-table.tsx` (step/hex/oklch table), `primitive-tabs.tsx` (tabbed palettes: Brand/Error/Accents/Neutral)

### Data Flow

```
User controls → Zustand store → usePalette() memoized computation
  → SurfacePreview (live 4-mode preview)
  → PrimitiveTabs (palette tables)
  → CodeExport (on-demand generation)
  → useUrlState() (hash sync)
  → useFavicon() (dynamic favicon)
  → useThemeCss() (app chrome variables)
```

---

## Type App — Fluid Type Scale Generator

### Core Concept

Generates fluid typographic scales using CSS `clamp()` for responsive sizing, with three mathematical approaches, font management via Fontshare, and derived spacing tokens.

### State (`store/type-store.ts`)

| Field | Type | Default | Purpose |
|-------|------|---------|---------|
| `scaleMode` | `'golden' \| 'traditional' \| 'custom'` | `'custom'` | Scale algorithm |
| `baseSize` | number | 1.0 | Desktop base in rem (0.5–2.0) |
| `mobileBaseSize` | number | 1.0 | Mobile base in rem (≤ baseSize) |
| `customRatio` | number | 1.272 | Custom scale multiplier (1.067–1.618) |
| `mobileRatioMode` | `'auto' \| 'custom'` | `'auto'` | Mobile ratio derivation |
| `mobileRatio` | number | 1.2 | Manual mobile ratio |
| `autoShrink` | number | 25 | % reduction for auto mobile ratio |
| `headingFont` / `bodyFont` / `monoFont` | string | `'satoshi'` | Fontshare slugs |
| `headingWeight` | number | 500 | Font weight (100–900) |
| `weightCompensation` | boolean | true | Optical weight correction |
| `lineHeightOverrides` | Record | {} | Per-level line-height overrides |
| `letterSpacingOverrides` | Record | {} | Per-level letter-spacing overrides |
| `spacingBaseMultiplier` | number | 1.0 | Uniform spacing scale factor |
| `previewViewport` | number | 1920 | Preview viewport width (320–1920px) |

**11 Type Levels**: Display, H1, H2, H3, H4, H5, H6, Body-L, Body-M, Body-S, Caption

### Three Scale Modes (`lib/scale.ts`)

#### Golden Ratio (sqrt(phi) ≈ 1.272)

Based on the user's original research: scales the perceived **visual area** of letterforms by phi. Hard-coded lookup table of min/max rem values validated against Renaissance type foundry data.

| Level | Min (rem) | Max (rem) |
|-------|-----------|-----------|
| Display | 3.00 | 4.70 |
| H1 | 2.40 | 3.70 |
| H2 | 2.20 | 2.90 |
| H3 | 1.80 | 2.20 |
| H4 | 1.50 | 1.70 |
| H5 | 1.20 | 1.30 |
| H6 | 1.00 | 1.00 |
| Body-S | 1.00 | 1.00 |
| Caption | 0.79 | 0.79 |

(At baseSize=1.0. All values scale proportionally.)

#### Traditional Typographic Scale

Classical Renaissance point sizes (6pt Nonpareille to 72pt Imperial). Users assign a canonical size per level from 19 predefined options. Separate desktop/mobile assignments.

#### Custom Ratio

Compound multiplication: `size = baseSize × ratio^step`

Step mapping: Display=6, H1=5, H2=4, H3=3, H4=2, H5=1, H6=0, Caption=-1

Preset ratios: Minor Second (1.067), Major Second (1.125), Minor Third (1.2), Major Third (1.25), **√φ (1.272)**, Perfect Fourth (1.333), Augmented Fourth (1.414), Perfect Fifth (1.5), Golden Ratio (1.618)

**Auto mobile ratio**: `effectiveRatio = 1 + (ratio - 1) × (1 - shrink/100)`

### Fluid Typography (`lib/clamp.ts`)

Linear interpolation between mobile (375px) and desktop (1920px):

```
slope = (maxSize - minSize) / (120rem - 23.4375rem)
intercept = minSize - slope × 23.4375rem
→ clamp(minRem, slope×100vw ± interceptRem, maxRem)
```

### Weight Compensation (`lib/weight-compensation.ts`)

Heavier fonts appear optically larger. Correction factors (relative to Regular 400 = 0%):
- Thin 100: +6%, Light 300: +3%, Regular 400: 0%
- Medium 500: -1.5%, Bold 700: -5%, Black 900: -8%

Applied only to headings. Scales min/max rem by `1 + correction`.

### Typography Defaults (`lib/typography.ts`)

**Line Heights**: Display 1.05 → Body 1.5 (WCAG compliant gradient)
**Letter Spacing**: Display -0.04em → Caption +0.01em (tighter headings, looser small text)

User overrides take precedence per level.

### Spacing Tokens (`lib/spacing.ts`)

Derived from Body-M: `baseline = bodyM_maxRem × lineHeight × multiplier`

9 steps: 3xs (0.25×), 2xs (0.5×), xs (0.75×), sm (1×), md (1.5×), lg (2×), xl (3×), 2xl (4×), 3xl (6×)

Rounded to grid: <1rem → 0.25rem grid, <4rem → 0.5rem grid, else 1rem.

### Font Management (`lib/fontshare.ts`)

- Fontshare API catalog (~100 fonts), lazy-loaded with seed catalog for instant start
- System mono stacks (system-mono, consolas, sf-mono) — no external loading
- On-demand font loading via `<link>` injection
- Categories: Sans, Serif, Display, Mono, Handwritten
- Production: proxied through `/api/fonts` to avoid CORS

### Code Export (`lib/code-export.ts`, `lib/design-token-export.ts`)

| Format | Content |
|--------|---------|
| CSS Custom Properties | `--text-*`, `--leading-*`, `--tracking-*`, `--font-*`, `--space-*` |
| Tailwind v4 | Same tokens in `@theme { }` block |
| W3C Design Tokens | DTCG JSON (compatible with Figma, Style Dictionary) |
| Fontshare Embed | `<link>` snippet for selected fonts |

### URL State (`lib/url-state.ts`)

Format: `#mode,baseSize,customRatio,mobileRatio,headingFont,bodyFont,monoFont[,traditionalAssignments...]`

### Components

**Controls**: `scale-controls.tsx` (master panel), `base-input-v2.tsx` (dual rem/px), `ratio-slider-v2.tsx` (1.067–1.618 + presets), `mobile-ratio-slider-v2.tsx` (auto/custom), `heading-weight-controls.tsx` (weight + compensation toggle), `typography-details.tsx` (per-level line-height/letter-spacing), `traditional-assignments.tsx` (desktop/mobile size dropdowns), `font-selector.tsx` (searchable dropdown with live preview + categories)

**Preview**: `type-preview.tsx` (viewport simulator 320–1920px with snap points, all 11 levels rendered at current width)

**Tables**: `scale-table.tsx` (min/max/clamp values), `scale-diagram.tsx` (visual bar chart), `spacing-table.tsx` (token table with visual bars)

**Export**: `code-export.tsx` (4-tab: CSS / Tailwind / Design Tokens / Embed)

### Data Flow

```
User controls → Zustand store → useComputedScale() memoized
  → applies weight compensation + typography overrides
  → useComputedSpacing() derives spacing tokens
  → TypePreview (live viewport simulation)
  → ScaleTable + ScaleDiagram (visual tables)
  → SpacingTable (spacing tokens)
  → CodeExport (on-demand generation)
  → useUrlState() (hash sync)
```

---

## Server (`og-server.js`)

Lightweight Node.js HTTP server (no framework) running on port 80 inside Docker.

**Responsibilities**:
1. **Static file serving** with content-type detection and immutable caching
2. **SPA fallback** — `/color/*` and `/type/*` without file extension serve respective `index.html`
3. **OG tag injection** — `/color/?t=Name&c=HEX` rewrites HTML with dynamic meta tags for social sharing
4. **OG image generation** — `/color/og-image?c=HEX` renders 1200×630 SVG → PNG via sharp
5. **Fontshare proxy** — `/api/fonts` proxies the Fontshare catalog with 1h cache (CORS workaround)

---

## Deployment

| Component | Detail |
|-----------|--------|
| **Host** | Hetzner VPS at `46.225.131.97` |
| **Proxy** | Traefik v3 (Let's Encrypt SSL, HTTP→HTTPS redirect) |
| **DNS** | Namecheap A records → Hetzner IP |
| **SSH Key** | `C:/Users/karst/repositories/SSH Keys/hetzner_ed25519` |
| **Remote Dir** | `/opt/oklch-palette` |
| **Container** | Docker multi-stage: build color → build type → Node.js Alpine + sharp |
| **Orchestration** | Docker Compose with Traefik labels |

### Docker Build (`Dockerfile`)

```
Stage 1 (build-color):  node:20-alpine, npm ci + build color-react
Stage 2 (build-type):   node:20-alpine, npm ci + build type-react
Stage 3 (build-system): node:20-alpine, npm ci + build system-react
Stage 4 (build-shape):  node:20-alpine, npm ci + build shape-react
Stage 5 (runtime):      node:20-alpine, sharp, copies all four dists + static assets
                        Runs og-server.js on port 80
```

### Deploy (`deploy.sh`)

1. Checks Traefik network exists
2. Uploads static files via scp
3. Tars color-react + type-react source (excluding node_modules/dist/.git)
4. Builds Docker image on server
5. `docker compose up -d --build`

### Local Dev

```bash
cd color-react && npm run dev   # localhost:5173
cd type-react && npm run dev    # localhost:5174
```

### Testing

**Vitest** unit tests for all pure lib functions. Each app has its own `vitest.config.ts`.

```bash
cd color-react && npm test      # 112 tests — unified-hash, url-state, color-math, palette, shadows, code-export
cd type-react  && npm test      #  48 tests — url-state, scale, spacing, clamp, code-export
cd shape-react && npm test      #  15 tests — url-state
```

No component tests, no E2E — only pure functions. Snapshot tests cover code-export output stability. `npm run test:watch` for dev mode.

---

## Design Decisions

- **OKLCH color space**: Perceptually uniform, superior to HSL for palette generation. Binary search gamut clamping keeps all colors in sRGB.
- **sqrt(phi) type scale**: Original research — golden ratio (phi=1.618) square root (~1.272) scales the perceived area of letterforms. Validated by Renaissance typesetting data.
- **No backend**: All tools are client-side. Server only serves static files + injects OG tags.
- **URL-as-database**: Full configuration encoded in URL hash. No accounts, no persistence layer.
- **No copyright**: "Take what you need, make it yours" — intentionally open.
- **Fontshare proxy**: `/api/fonts` avoids CORS issues with the Fontshare API.
- **shadcn/ui compatibility**: Semantic tokens map directly to shadcn/ui CSS variables.
- **Multi-mode preview**: Color app shows Light, Dark, Light HC, Dark HC simultaneously.

## Naming & Legacy

Legacy references to "oklch-palette" remain in Docker labels, deploy paths (`/opt/oklch-palette`), and some config. The project identity is **standby.design**.

## Planned: Brand Identity Layer

Next major feature: A brand generator that maps brand descriptions (industry, tonality, energy, density) to complete design systems using the existing color + type engines. Intended to make the tools accessible to non-experts. Will live at `/` or `/brand`, with deep links into `/color` and `/type` for expert tweaking.
