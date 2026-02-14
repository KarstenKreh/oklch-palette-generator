# OKLCH Tonal Palette Generator

A zero-dependency, browser-based tool that generates perceptually uniform tonal color palettes using the **OKLCH** color model.

Enter any hex color code and get two complete palettes instantly:
- **Brand** — full chroma, for accent colors, buttons, links
- **Slated** — 50% chroma, muted/gray variant for background and container surfaces

## Features

- **Pure browser-based** — no build step, no server, no dependencies. Just open `index.html`.
- **OKLCH color math** — all conversions (sRGB ↔ OKLab ↔ OKLCH) implemented from scratch in JavaScript
- **Perceptually uniform** — 500 is the true midpoint between white and black (L=0.50)
- **Smart chroma scaling** — automatically adapts to input saturation (vivid inputs → vivid palette, gray inputs → gray palette)
- **sRGB gamut clamping** — all colors are verified to be within the sRGB gamut via binary search
- **18 tonal steps** with purpose-built zones:

| Zone | Steps | L range | Purpose |
|------|-------|---------|---------|
| Light Surfaces | 25, 50, 75, 100 | 0.96–0.88 | Light mode containers |
| Core | 200–800 | 0.79–0.26 | Buttons, text, accents |
| Dark Surfaces | 825, 850, 875 | 0.24–0.20 | Dark mode containers |
| High Contrast | 900, 925, 950, 975 | 0.18–0.12 | `prefers-contrast: more` / AMOLED |

- **Click-to-copy** on any hex or OKLCH value
- **Surface demos** showing Light, Dark, and High Contrast container hierarchies
- **Copy-ready CSS** in both OKLCH and hex fallback format, with zone comments
- **Native color picker** synced with hex input

## Usage

1. Open `index.html` in any modern browser
2. Enter a hex color code (e.g. `335A7F`) or use the color picker
3. Click "Palette generieren" or press Enter
4. Copy individual values (click on them) or entire CSS blocks (Copy button)

## How It Works

1. The input hex color is converted to OKLCH to extract its **hue** (H) and **saturation level**
2. Step 500 is placed at **L=0.50** — the perceptual midpoint between black and white
3. Lightness is mapped linearly on the light side (0.98→0.50) and compressed on the dark side (0.50→0.10) to keep dark surfaces distinguishable
4. Chroma follows a **parabolic envelope** (peaks at L=0.5, tapers to zero at extremes), clamped to sRGB gamut
5. For gray/muted inputs, the chroma is scaled proportionally to the input's saturation — ensuring gray inputs produce gray palettes

## License

MIT
