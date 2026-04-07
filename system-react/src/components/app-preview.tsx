import type { PaletteEntry } from '@/lib/palette';
import type { AccentPalette } from '@/lib/color-code-export';
import type { ComputedLevel } from '@/lib/scale';
import type { SpacingToken } from '@/lib/spacing';
import type { ShapeState } from '@/lib/shape-url-state';

interface PaletteResult {
  brand: PaletteEntry[];
  surface: PaletteEntry[];
  error: PaletteEntry[];
  neutral: PaletteEntry[];
  accentPalettes: AccentPalette[];
  effectiveBgHex: string;
}

interface AppPreviewProps {
  palette: PaletteResult | null;
  scale: ComputedLevel[] | null;
  spacing: SpacingToken[] | null;
  shape: Partial<ShapeState> | null;
  themeName: string;
  headingFont?: string;
  bodyFont?: string;
}

function p(pal: PaletteEntry[], step: number): string {
  return pal.find(e => e.step === step)?.hex || '#888';
}

function lvl(scale: ComputedLevel[], name: string) {
  return scale.find(l => l.level === name);
}

interface Tokens {
  bg: string; bgCard: string; bgElevated: string;
  fg: string; muted: string;
  primary: string; primaryFg: string;
  accent: string; destructive: string;
  border: string;
  radius: number; borderW: number;
  shadow: string;
  fs: (name: string) => string | undefined;
  lh: (name: string) => number | undefined;
  ls: (name: string) => string | undefined;
  sp: (name: string) => string;
  headingFf?: string; bodyFf?: string;
}

function buildTokens(
  palette: PaletteResult | null, scale: ComputedLevel[] | null,
  spacing: SpacingToken[] | null, shape: Partial<ShapeState> | null,
  dark: boolean, headingFont?: string, bodyFont?: string,
): Tokens {
  const brand = palette?.brand || [];
  const surface = palette?.surface || [];
  const neutral = palette?.neutral || [];
  const error = palette?.error || [];

  const radius = shape?.borderRadius ?? 8;
  const borderW = shape?.borderEnabled ? (shape?.borderWidth ?? 1) : 0;
  const shadowStr = shape?.shadowStrength ?? 1;
  const shadowBlur = shape?.shadowBlurScale ?? 1;
  const shadow = (shape?.shadowEnabled ?? true)
    ? `0 ${Math.round(2 * shadowStr)}px ${Math.round(8 * shadowBlur)}px rgba(0,0,0,${(dark ? 0.2 : 0.06) * shadowStr}), 0 ${Math.round(1 * shadowStr)}px ${Math.round(3 * shadowBlur)}px rgba(0,0,0,${(dark ? 0.15 : 0.04) * shadowStr})`
    : 'none';

  const accentColor = palette?.accentPalettes?.[0]
    ? p(palette.accentPalettes[0].palette, dark ? 400 : 500)
    : p(brand, dark ? 400 : 500);

  const l = (name: string) => scale ? lvl(scale, name) : undefined;

  return {
    bg: dark ? p(surface, 875) : p(surface, 50),
    bgCard: dark ? p(surface, 850) : p(surface, 75),
    bgElevated: dark ? p(surface, 825) : '#FFFFFF',
    fg: dark ? p(neutral, 50) : p(neutral, 975),
    muted: p(neutral, dark ? 400 : 500),
    primary: dark ? p(brand, 400) : p(brand, 600),
    primaryFg: dark ? p(neutral, 975) : '#FFFFFF',
    accent: accentColor,
    destructive: dark ? p(error, 400) : p(error, 600),
    border: dark ? p(neutral, 800) : p(neutral, 200),
    radius, borderW, shadow,
    fs: (name: string) => { const v = l(name); return v ? `${v.maxRem}rem` : undefined; },
    lh: (name: string) => l(name)?.lineHeight,
    ls: (name: string) => { const v = l(name); return v?.letterSpacing ? `${v.letterSpacing}em` : undefined; },
    sp: (name: string) => {
      const t = spacing?.find(s => s.name === name);
      return t ? `${t.rem}rem` : ({ '3xs': '0.25rem', '2xs': '0.375rem', xs: '0.5rem', sm: '0.75rem', md: '1rem', lg: '1.5rem' }[name] || '0.5rem');
    },
    headingFf: headingFont ? `'${headingFont}', sans-serif` : undefined,
    bodyFf: bodyFont ? `'${bodyFont}', sans-serif` : undefined,
  };
}

const contacts = [
  { name: 'Sarah Chen', msg: 'The new designs look amazing!', time: '2m', unread: 2, online: true },
  { name: 'Alex Rivera', msg: 'Can you review the PR?', time: '15m', unread: 0, online: true },
  { name: 'Jordan Lee', msg: 'Meeting at 3pm tomorrow', time: '1h', unread: 0, online: false },
  { name: 'Maya Patel', msg: 'Sent you the files', time: '3h', unread: 0, online: false },
];

const messages = [
  { sent: false, text: 'Hey! How\'s the design system coming along?', time: '10:22' },
  { sent: true, text: 'Really well! Just finished the token generator.', time: '10:24' },
  { sent: false, text: 'The new designs look amazing! Love the color palette.', time: '10:25' },
  { sent: true, text: 'Thanks! The fluid type scale makes such a difference.', time: '10:26' },
];

function MessengerScreen({ t, label }: { t: Tokens; label: string }) {
  const btnR = Math.max(3, t.radius - 4);
  const bubbleR = Math.max(4, t.radius);

  return (
    <div style={{ backgroundColor: t.bg, color: t.fg, fontFamily: t.bodyFf, borderRadius: `${t.radius + 4}px`, overflow: 'hidden', height: '340px', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ backgroundColor: t.bgCard, borderBottom: t.borderW ? `${t.borderW}px solid ${t.border}` : 'none', padding: '6px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: t.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.primaryFg, fontSize: '0.6rem', fontWeight: 600 }}>S</div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, lineHeight: 1.2 }}>Sarah Chen</div>
            <div style={{ fontSize: '0.55rem', color: t.accent }}>online</div>
          </div>
        </div>
        <div style={{ fontSize: '0.55rem', color: t.muted }}>{label}</div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflow: 'hidden', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.sent ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '78%',
              backgroundColor: m.sent ? t.primary : t.bgElevated,
              color: m.sent ? t.primaryFg : t.fg,
              borderRadius: `${bubbleR}px`,
              borderBottomRightRadius: m.sent ? '3px' : `${bubbleR}px`,
              borderBottomLeftRadius: m.sent ? `${bubbleR}px` : '3px',
              padding: '4px 8px',
              boxShadow: m.sent ? 'none' : t.shadow,
              border: !m.sent && t.borderW ? `${t.borderW}px solid ${t.border}` : 'none',
            }}>
              <div style={{ fontSize: '0.7rem', lineHeight: 1.35 }}>{m.text}</div>
              <div style={{ fontSize: '0.5rem', color: m.sent ? (t.primaryFg + 'aa') : t.muted, textAlign: 'right', marginTop: '1px' }}>{m.time}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Input bar */}
      <div style={{ backgroundColor: t.bgCard, borderTop: t.borderW ? `${t.borderW}px solid ${t.border}` : 'none', padding: '5px 10px', display: 'flex', gap: '4px', alignItems: 'center', flexShrink: 0 }}>
        <div style={{
          flex: 1, backgroundColor: t.bg, color: t.muted,
          border: t.borderW ? `${t.borderW}px solid ${t.border}` : 'none',
          borderRadius: `${btnR}px`,
          padding: '4px 8px',
          fontSize: '0.65rem',
        }}>
          Type a message...
        </div>
        <div style={{
          backgroundColor: t.primary, color: t.primaryFg,
          borderRadius: `${btnR}px`,
          padding: '4px 8px',
          fontSize: '0.65rem',
          fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
        }}>
          Send
        </div>
      </div>
    </div>
  );
}

export function AppPreview({ palette, scale, spacing, shape, themeName, headingFont, bodyFont }: AppPreviewProps) {
  const light = buildTokens(palette, scale, spacing, shape, false, headingFont, bodyFont);
  const dark = buildTokens(palette, scale, spacing, shape, true, headingFont, bodyFont);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <MessengerScreen t={light} label="Light" />
      <MessengerScreen t={dark} label="Dark" />
    </div>
  );
}
