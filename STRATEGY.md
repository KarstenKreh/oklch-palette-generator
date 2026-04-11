# Standby Design — Strategieplan: Design Infrastructure for AI

> Prämisse: In der mittleren Zukunft werden nicht mehr hauptsächlich Menschen Apps bauen.
> Sie geben Präferenzen vor. LLMs setzen um — aber auch ein LLM braucht ein Werkzeug,
> um konsistentes, mathematisch fundiertes Design zu erzeugen.

---

## 1. These

Jedes LLM, das heute eine App baut, improvisiert beim Design. Es greift auf Trainings-Heuristiken zurück: HSL-Farben die nicht perceptually uniform sind, willkürliche Type-Scales, Spacing aus dem Bauch. Das funktioniert für Prototypen, aber nicht für Produkte.

Standby Design löst genau dieses Problem — nicht als UI für Menschen, sondern als **Computation Engine für Modelle**. Die Web-UI wird zum Playground und zur Validierung. Der eigentliche Wert liegt in der mathematischen Schicht darunter:

- **OKLCH Gamut Clamping**: Keine sRGB-Überläufe, keine verwaschenen Farben
- **√φ Typographic Scale**: Rationale Designheuristik im empirischen Wahrnehmungskorridor (1.20–1.50)
- **Fluid clamp()**: Korrektes responsive Sizing, nicht geraten
- **Multi-Mode Semantic Tokens**: Light/Dark/HC konsistent, shadcn/ui-kompatibel
- **WCAG Contrast**: Automatisch, nicht manuell geprüft

**Das Ziel: Standby wird der Design-Compiler, der aus Intent (Marke, Tonalität, Dichte) mathematisch korrekte, production-ready Tokens erzeugt.**

---

## 2. Ausgangslage

### Was existiert

| Asset | Status |
|-------|--------|
| Color Engine (palette.ts, color-math.ts, shadows.ts) | Production, 112 Tests |
| Type Engine (scale.ts, clamp.ts, spacing.ts) | Production, 59 Tests |
| Shape Engine (shadows, borders, radii, glass) | Production, 15 Tests |
| System Merger (color + type + shape → unified export) | Production |
| Export Formate (CSS, Tailwind v4, DTCG JSON, LLM Briefing) | Production |
| Web UI (4 React SPAs) | Production, deployed |
| LLM Briefing Export | Existiert in Color App |

### Was fehlt

| Gap | Bedeutung |
|-----|-----------|
| Shared Core Package | Logik ist in React-Apps eingebettet, nicht unabhängig nutzbar |
| MCP Server | Kein Model kann die Tools programmatisch aufrufen |
| API Layer | Kein HTTP-Zugang zur Computation |
| Intent-zu-Config Mapping | Kein Weg von "corporate fintech" zu konkreten Parametern |
| Verbreitung in Templates | Kein Starter-Template referenziert Standby |

---

## 3. Produktarchitektur

### 3.1 Shared Core — Die Extrahierung

Alles, was heute in `color-react/src/lib/`, `type-react/src/lib/` etc. lebt, wird zu einem eigenständigen TypeScript-Package. Kein DOM, kein React, kein Browser — reine Computation.

```
packages/
  @standby/core           ← palette, scale, spacing, shadows, clamp, color-math, shape
  @standby/export         ← CSS, Tailwind, DTCG JSON, LLM Briefing Generierung
  @standby/schema         ← JSON Schema / Zod-Definitionen für alle Inputs/Outputs
  @standby/mcp-server     ← MCP Tool-Definitionen, wrapped um core + export
  @standby/api            ← HTTP-Endpunkte (optional, für non-MCP Clients)

apps/
  color/                  ← React SPA, importiert @standby/core + @standby/export
  type/                   ← React SPA, importiert @standby/core + @standby/export
  shape/                  ← React SPA, importiert @standby/core + @standby/export
  system/                 ← React SPA, importiert @standby/core + @standby/export
  web/                    ← Landing Page
```

**Warum zuerst:** Solange die Logik in React-Apps lebt, kann sie nur im Browser laufen. Die Extrahierung ist die Voraussetzung für alles Weitere. Und sie ist machbar, weil die Funktionen bereits pure sind.

### 3.2 MCP Server — Der primäre Model-Zugang

Ein MCP Server, der folgende Tools exponiert:

```
standby/generate_palette
  Input:  { brandHex, mode?, chromaScale?, errorHex?, accents?[] }
  Output: { primitives: {...}, semantic: {...}, shadows: {...} }

standby/generate_type_scale
  Input:  { scaleMode, ratio?, baseSize?, fonts?, headingWeight? }
  Output: { levels: [...], spacing: [...], clampValues: [...] }

standby/generate_shape_tokens
  Input:  { shadowStyle?, borderRadius?, borderWidth? }
  Output: { shadows: {...}, radii: {...}, borders: {...} }

standby/generate_design_system
  Input:  { color: {...}, type: {...}, shape: {...} }
  Output: { merged tokens, ready for export }

standby/export_tokens
  Input:  { system, format: 'css' | 'tailwind' | 'dtcg' | 'llm-briefing' }
  Output: { code: string }

standby/suggest_from_intent
  Input:  { industry?, tonality?, energy?, density?, brandColor? }
  Output: { recommended config for all tools }
```

**Das letzte Tool ist der Schlüssel.** Es übersetzt natürlichsprachliche Design-Absicht in konkrete Parameter. Ein Model, das "seriöse Fintech-App, dunkel, hohe Informationsdichte" hört, bekommt damit die richtigen Inputs für alle anderen Tools.

### 3.3 Intent Mapping — Die Intelligenzschicht

Das `suggest_from_intent` Tool braucht eine Mapping-Logik:

| Dimension | Parameter-Auswirkung |
|-----------|---------------------|
| **Tonalität** (playful → serious) | chromaScale, Schriftklasse (Display vs. Sans), Ratio-Wahl |
| **Energie** (calm → dynamic) | Kontrastumfang, Scale-Ratio (niedrig=ruhig, hoch=dynamisch) |
| **Dichte** (spacious → compact) | spacingMultiplier, baseSize, Body Line-Height |
| **Branche** | Farbheuristiken (Finance=Blau/Grün, Health=Teal/Weiß, Creative=Hohe Chroma) |
| **Markenfarbe** | Wenn gegeben: direkt verwenden. Sonst: aus Branche/Tonalität ableiten |

Dies kann als deterministische Lookup-Tabelle starten und später durch ein Fine-tuned Model ergänzt werden. Aber: **deterministisch zuerst.** Das ist debuggbar, reproduzierbar, und braucht keine Inferenz-Kosten.

---

## 4. Distributionsstrategie

### 4.1 Ebene 1 — Direktinstallation (ab Launch)

Entwickler, die Standby kennen, installieren den MCP Server:

```bash
# Claude Code
claude mcp add standby-design npx @standby/mcp-server

# Cursor / Windsurf / andere MCP-fähige Editoren
# → .cursor/mcp.json, etc.
```

**Reichweite:** Gering, nur bestehende Nutzer und Early Adopters.
**Wert:** Proof of Concept, Feedback-Loop, erste Nutzungsdaten.

### 4.2 Ebene 2 — Marketplace Listings (parallel zu Launch)

Registrierung auf allen relevanten MCP-Verzeichnissen:

| Plattform | Status | Priorität |
|-----------|--------|-----------|
| Anthropic MCP Hub | Aktiv | Hoch — Claude ist der MCP-native Client |
| mcp.run | Aktiv | Hoch — größtes unabhängiges Verzeichnis |
| smithery.ai | Aktiv | Mittel |
| Cursor MCP Directory | Emerging | Hoch — größte IDE-Nutzerbasis |
| npm Registry | Stabil | Hoch — `npx @standby/mcp-server` muss funktionieren |

**SEO für Models:** Die Tool-Beschreibungen müssen so formuliert sein, dass ein Model, das nach "design system" oder "color palette" oder "typography scale" sucht, Standby findet. Das ist eine neue Form von SEO — nicht für Google, sondern für Tool-Discovery-Algorithmen.

### 4.3 Ebene 3 — Template Embedding (größter Hebel)

Populäre Starter-Templates und Frameworks liefern Projekt-Konfigurationen mit (CLAUDE.md, .cursorrules, etc.). Wenn Standby dort als Default referenziert wird, benutzt jedes Model es automatisch.

**Ziel-Templates und Frameworks:**

| Target | Warum |
|--------|-------|
| create-next-app / Next.js Starters | Größte React-Basis |
| Astro Themes | Wachsend, design-affine Community |
| shadcn/ui | Standby ist bereits shadcn-kompatibel — natürlicher Fit |
| Tailwind UI / Catalyst | Standby exportiert Tailwind v4 nativ |
| v0.dev (Vercel) | AI-native App-Builder, braucht genau solche Tools |
| Bolt / Lovable / Replit Agent | AI-first Plattformen, die Design improvisieren |

**Taktik:**
1. **Eigene Templates** bauen (Next.js + Standby, Astro + Standby) als Proof of Concept
2. **Open PRs** an populäre Templates: "Add design system generation via Standby MCP"
3. **Partnerschaften** mit shadcn/ui, Tailwind Labs — Standby als empfohlener Token-Generator
4. **Content**: "How to give your AI-built app a real design system" — Tutorial-Serie

### 4.4 Ebene 4 — Platform Integration (langfristig)

Direkte Integration in AI-Plattformen:

| Plattform | Integration |
|-----------|-------------|
| v0.dev | Standby als Backend für Farbwahl und Typografie |
| Bolt.new | MCP-Server vorinstalliert |
| Claude Projects | Als empfohlenes Tool für "build me an app" Workflows |
| Figma AI | Plugin, der Standby-Tokens in Figma-Variablen überführt |

---

## 5. Monetarisierung

### Grundsatz

Die Web-UI bleibt frei. Die Berechnung bleibt frei. Geld verdient wird an **Volumen, Convenience und Garantien**.

### Tiers

| Tier | Preis | Enthält |
|------|-------|---------|
| **Open** | Kostenlos | MCP Server lokal, npm Package, Web UI, alle Berechnungen |
| **Pro** | ~$19/mo | Hosted API (kein lokaler Server nötig), höhere Rate Limits, Priority Support |
| **Team** | ~$49/mo | Shared Design Systems (Team-weite Tokens), API Keys, Usage Dashboard |
| **Platform** | Custom | White-Label API, SLA, Custom Intent Mappings, dedizierte Instanz |

### Warum "Open Core" und nicht reines SaaS

- **Lokale Ausführung = Zero Latency.** Ein MCP Server, der lokal läuft, antwortet in Millisekunden. Das ist für AI-Coding-Workflows entscheidend — jede Tool-Antwort ist ein Roundtrip im Agenten-Loop.
- **Vertrauen.** Entwickler (und ihre Models) werden eher ein Tool adoptieren, das sie inspizieren und lokal laufen können.
- **Lock-In vermeiden.** Die Berechnung ist Open Source. Was bezahlt wird: Hosting, Teamfeatures, Garantien. Das ist ehrlich und nachhaltig.

### Zusätzliche Revenue-Kanäle

| Kanal | Beschreibung |
|-------|-------------|
| **Template Marketplace** | Kuratierte Standby-Konfigurationen: "SaaS Dashboard", "E-Commerce", "Documentation Site" — als Config-Presets, nicht als Code |
| **Intent Model Training** | Wenn genug Nutzungsdaten: Fine-tuned Model für Intent→Config, lizenziert an Plattformen |
| **Consulting** | "Wir bauen euer Design System als Standby-Config" für Enterprises |

---

## 6. Wettbewerbsposition

### Warum nicht einfach jemand anderes?

| Moat | Erklärung |
|------|-----------|
| **Mathematische Tiefe** | OKLCH Gamut Clamping, empirisch fundierte Skalierung, perceptual Uniformity — das ist nicht trivial nachzubauen und erfordert Domänenwissen |
| **Bestehende Validierung** | 175+ Tests, Production-deployed, echte Nutzer |
| **Vollständigkeit** | Color + Type + Shape + Spacing + Export in einem System. Konkurrenten haben meist nur einen Teil |
| **shadcn/ui Kompatibilität** | Der de-facto Standard für React UI. Standby spricht seine Sprache nativ |
| **First Mover** | Es gibt keinen etablierten "Design System MCP Server". Die Kategorie existiert noch nicht |

### Risiken

| Risiko | Mitigation |
|--------|-----------|
| Tailwind/shadcn baut eigenen Token-Generator | Standby ist tiefer (OKLCH, empirisch fundierte Skalierung, Multi-Mode). Und: als MCP-Tool komplementär, nicht konkurrierend |
| MCP setzt sich nicht durch | OpenAPI-Fallback ist trivial. Die Computation bleibt wertvoll unabhängig vom Protokoll |
| Models werden gut genug im Design | Unwahrscheinlich für mathematisch exaktes Design. Und selbst dann: ein Tool ist reproduzierbar, ein Model-Output nicht |
| Kein Netzwerkeffekt | Template-Embedding schafft Distribution ohne Netzwerkeffekt. Jede Installation ist eigenständig wertvoll |

---

## 7. Phasenplan

### Phase 0 — Foundation (4–6 Wochen)

**Ziel: Shared Core Package extrahieren, MCP Server lauffähig.**

- [ ] Monorepo-Struktur aufsetzen (pnpm workspaces oder Turborepo)
- [ ] `@standby/core` extrahieren: alle pure Functions aus color/type/shape/system
- [ ] `@standby/schema` definieren: Zod-Schemas für alle Tool-Inputs und Outputs
- [ ] `@standby/export` extrahieren: alle Code-Generatoren
- [ ] React-Apps auf Imports von `@standby/core` und `@standby/export` umstellen
- [ ] Bestehende Tests migrieren, sicherstellen dass alles grün ist
- [ ] MCP Server implementieren: 6 Tools (palette, type, shape, system, export, intent)
- [ ] `suggest_from_intent` als deterministische Lookup-Tabelle (v1)
- [ ] `npx @standby/mcp-server` funktioniert

### Phase 1 — Launch & Feedback (2–4 Wochen)

**Ziel: Erste externe Nutzer, Marketplace Listings, Feedback.**

- [ ] npm veröffentlichen: `@standby/core`, `@standby/mcp-server`
- [ ] MCP Hub / mcp.run / smithery.ai Listings
- [ ] Eigenes Next.js Starter Template mit CLAUDE.md die Standby referenziert
- [ ] Eigenes Astro Starter Template
- [ ] "How to" Tutorial-Content (Blog / Twitter / Dev.to)
- [ ] Telemetrie: welche Tools werden wie oft aufgerufen, welche Inputs sind häufig
- [ ] Feedback-Loop: Was fehlt Models? Welche Fehlermeldungen kommen?

### Phase 2 — Distribution (2–3 Monate)

**Ziel: Template-Embedding, Community-Wachstum, Pro Tier.**

- [ ] PRs an populäre Starter-Templates
- [ ] shadcn/ui Integration: "Generate your theme with Standby" Workflow
- [ ] Hosted API für Pro Tier (Cloudflare Workers oder ähnlich)
- [ ] Intent Mapping v2: mehr Branchen, Tonalitäten, empirische Defaults
- [ ] Figma-Plugin: Standby-Tokens → Figma Variables
- [ ] Partnergespräche: v0.dev, Bolt, Lovable

### Phase 3 — Platform (6+ Monate)

**Ziel: Standby als Default Design Infrastructure.**

- [ ] Platform Tier mit White-Label API
- [ ] Intent Model (fine-tuned auf Nutzungsdaten, falls genug vorhanden)
- [ ] Direkte Integration in AI-Plattformen
- [ ] Team-Features: Shared Configs, Brand Guidelines als Standby-Config
- [ ] Design System Versioning: "Update my tokens" Workflow

---

## 8. Erster konkreter Schritt

Die gesamte Strategie steht und fällt mit Phase 0. Und Phase 0 hat genau eine kritische Abhängigkeit:

**Die Extrahierung von `@standby/core`.**

Alles andere — MCP Server, API, Templates, Monetarisierung — baut darauf auf. Die gute Nachricht: Die Funktionen sind bereits pure, getestet, und haben klare Interfaces. Es ist ein Refactoring, kein Rewrite.

Vorschlag für den allerersten Move:
1. Monorepo aufsetzen
2. `color-react/src/lib/color-math.ts` als erstes Modul nach `packages/core/` verschieben
3. Tests migrieren
4. Color-App auf Import umstellen
5. Sicherstellen, dass alles baut und die Tests grün sind

Dann iterativ: `palette.ts`, `shadows.ts`, `scale.ts`, `clamp.ts`, `spacing.ts`, etc.
