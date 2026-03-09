# standby.design

Multi-Tool-Hub unter **standby.design** — kleine Tools für Designer und Entwickler. Kein Framework, kein Build-Step, reines HTML/CSS/JS.

## Struktur

```
/
├── index.html        # Hub-Seite (standby.design)
├── color/
│   └── index.html    # OKLCH Palette Generator (standby.design/color)
├── Dockerfile
├── nginx.conf
├── docker-compose.yml
└── deploy.sh
```

## Deployment (Hetzner + Docker + nginx)

```bash
./deploy.sh
```

Setzt voraus: SSH-Key unter `C:/Local Data/Repositories/SSH Keys/hetzner_ed25519`.

## DNS (Namecheap)

A-Record für `standby.design` und `www.standby.design` → `46.225.131.97`

---

# OKLCH Tonal Palette Generator (`/color`)

Ein interaktiver, client-seitiger Palette-Generator im **OKLCH-Farbraum** — keine Dependencies, kein Build-Step.

## Features

- **Brand + Slated**: Generiert automatisch eine volle Palette (Brand) und eine gedämpfte Variante mit 50% Chroma (Slated)
- **18 Abstufungen**: Feine Gradierung für Light Surfaces (25–100), Core Palette (200–800), Dark Surfaces (825–875) und High Contrast (925–975)
- **Zwei Modi**:
  - **Balanced Midpoint** — 500 = perzeptueller Mittelwert (L=0.50), symmetrisch um den hellsten Punkt des Farbtons
  - **Exact Brand Match** — 500 = exakt die Eingabefarbe, Helligkeit + Chroma werden gleichmäßig darum herum skaliert
- **Click-to-Copy**: Einzelne Hex- und OKLCH-Werte per Klick kopieren
- **Code-Export**: Fertige CSS Custom Properties (OKLCH + Hex Fallback) zum Kopieren
- **Surface-Demo**: Live-Vorschau für Light Mode, Dark Mode und High Contrast Surfaces
- **Grau-sicher**: Neutrale Eingaben (z.B. `#757575`) erzeugen saubere Grau-Paletten ohne Farbstich

## Verwendung

1. `index.html` im Browser öffnen
2. Hex-Farbcode eingeben (mit oder ohne `#`)
3. Modus wählen (Balanced Midpoint / Exact Brand Match)
4. Palette generieren — fertig

## Zonenstruktur

| Steps     | Zone                  | Verwendung                           |
|-----------|-----------------------|--------------------------------------|
| 25–100    | Light Surfaces        | Hintergründe, Cards, Elevated (Light)|
| 200–800   | Core Palette          | Buttons, Links, Akzente, Text        |
| 825–875   | Dark Surfaces         | Hintergründe, Cards (Dark Mode)      |
| 900–975   | High Contrast         | Hintergründe (High Contrast Dark)    |

## Technologie

- Reines HTML + CSS + JavaScript (zero dependencies)
- OKLCH ↔ OKLab ↔ Linear sRGB ↔ sRGB Konvertierung
- Binäre Suche für sRGB-Gamut-Clamping
- Parabolische Chroma-Envelope für natürliche Sättigungsverteilung
