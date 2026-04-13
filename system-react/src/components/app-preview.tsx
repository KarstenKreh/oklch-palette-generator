import { useState } from 'react';
import { ChevronLeft, ChevronRight, Phone, MoreHorizontal, Plus, ArrowUp, Search, SquarePen, MessageCircle, Users, Settings, CheckCheck, Bell, Moon, Shield, HelpCircle, LogOut, Camera, Trash2, ListFilter } from 'lucide-react';
import type { PaletteEntry } from '@core/palette';
import type { AccentPalette } from '@/lib/color-code-export';
import type { ComputedLevel } from '@core/scale';
import type { SpacingToken } from '@core/spacing';
import type { ShapeUrlState as ShapeState } from '@core/url-state/shape';
import { PhoneMockup } from '@/components/phone-mockup';
import { contrastRatio } from '@core/color-math';
import { generateShadows, generateNeumorphicInset, type ShadowConfig, type ShadowType } from '@core/shadows';
import { LiquidGlass } from '@core/liquid-glass';
import type { FgContrastMode } from '@core/url-state/color';

interface PaletteResult {
  brand: PaletteEntry[];
  surface: PaletteEntry[];
  error: PaletteEntry[];
  neutral: PaletteEntry[];
  accentPalettes: AccentPalette[];
  effectiveBgHex: string;
  brandSwatchOverride: { hex: string; L: number } | null;
  errorSwatchOverride: { hex: string; L: number } | null;
}

interface AppPreviewProps {
  palette: PaletteResult | null;
  scale: ComputedLevel[] | null;
  spacing: SpacingToken[] | null;
  shape: Partial<ShapeState> | null;
  themeName: string;
  headingFont?: string;
  bodyFont?: string;
  headingWeight?: number;
  screenIdx?: number;
  fgContrastMode?: FgContrastMode;
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
  accent: string; accentVis: string;
  destructive: string; destructiveFg: string;
  success: string; successVis: string;
  warning: string; warningVis: string;
  primarySecondary: string; successSecondary: string;
  accentSecondary: string; destructiveSecondary: string;
  border: string;
  radius: number; borderW: number;
  shadow: string;
  shadowSm: string;
  shadowInset: string;
  isNeomorph: boolean;
  isGlass: boolean;
  isDark: boolean;
  glassDepth: number;
  glassBlur: number;
  glassDispersion: number;
  fs: (name: string) => string | undefined;
  lh: (name: string) => number | undefined;
  ls: (name: string) => string | undefined;
  sp: (name: string) => string;
  headingFf?: string; bodyFf?: string;
  headingFw: number;
}

function pickFg(bgHex: string, lightHex: string, darkHex: string, fgMode: FgContrastMode): string {
  const lightCR = contrastRatio(lightHex, bgHex);
  const darkCR = contrastRatio(darkHex, bgHex);
  if (fgMode === 'preferDark') return darkCR >= 4.5 ? darkHex : lightHex;
  if (fgMode === 'preferLight') return lightCR >= 4.5 ? lightHex : darkHex;
  return lightCR >= darkCR ? lightHex : darkHex;
}

function buildTokens(
  palette: PaletteResult | null, scale: ComputedLevel[] | null,
  spacing: SpacingToken[] | null, shape: Partial<ShapeState> | null,
  dark: boolean, headingFont?: string, bodyFont?: string, headingWeight?: number,
  fgContrastMode: FgContrastMode = 'best',
): Tokens {
  const brand = palette?.brand || [];
  const surface = palette?.surface || [];
  const neutral = palette?.neutral || [];
  const error = palette?.error || [];

  const radius = shape?.borderRadius ?? 8;
  const borderW = (shape?.borderEnabled ?? true) ? (shape?.borderWidth ?? 1) : 0;
  const isNeomorph = shape?.shapeStyle === 'neomorph';
  const isGlass = shape?.shapeStyle === 'glass';

  // Surface base (overall app bg) — neomorph & paper both compute this the same;
  // neomorph re-uses it for card/elevated to achieve the monochromatic effect below.
  const baseBg = dark ? p(surface, 875) : p(surface, 50);

  // Shadow engine — route neomorph → 'neumorphic', paper → user's shadowType (default 'normal').
  // Glass stays without shadow in this preview (user is actively iterating the real Glass elsewhere).
  const resolvedShadowType: ShadowType = isNeomorph ? 'neumorphic' : (shape?.shadowType ?? 'normal');
  const shadowConfig: ShadowConfig = {
    type: resolvedShadowType,
    strength: shape?.shadowStrength ?? 1,
    blurScale: shape?.shadowBlurScale ?? 1,
    scale: shape?.shadowScale ?? 1.272,
    colorMode: shape?.shadowColorMode ?? 'auto',
    customColor: shape?.shadowCustomColor ?? '#000000',
  };
  const shadowsEnabled = (shape?.shadowEnabled ?? true) && !isGlass;
  const shadowSet = shadowsEnabled ? generateShadows(baseBg, dark, shadowConfig) : [];
  const insetSet = shadowsEnabled && isNeomorph ? generateNeumorphicInset(baseBg, dark, shadowConfig) : [];
  const pickShadow = (name: string) => shadowSet.find(s => s.name === name)?.shadow ?? 'none';
  const pickInset = (name: string) => insetSet.find(s => s.name === name)?.shadow ?? 'none';
  const shadow = pickShadow('md');
  const shadowSm = pickShadow('sm');
  const shadowInset = pickInset('sm');

  const findAccent = (name: string) =>
    palette?.accentPalettes?.find(a => a.cssName === name);

  /** Resolve an accent's semantic color, respecting pin (for buttons, text) */
  const resolveAccent = (ap: AccentPalette | undefined, fallbackPal: PaletteEntry[]) => {
    if (!ap) return dark ? p(fallbackPal, 400) : p(fallbackPal, 600);
    if (ap.pin) return ap.hex;
    return dark ? p(ap.palette, 400) : p(ap.palette, 600);
  };

  /** Resolve an accent's palette step — always visible on bg (for bars, dots, decorative) */
  const resolveAccentVisible = (ap: AccentPalette | undefined, fallbackPal: PaletteEntry[]) => {
    const pal = ap?.palette || fallbackPal;
    return dark ? p(pal, 400) : p(pal, 600);
  };

  const firstAccent = palette?.accentPalettes?.[0];
  const successPal = findAccent('success');
  const warningPal = findAccent('warning');

  const l = (name: string) => scale ? lvl(scale, name) : undefined;

  // Neomorph collapses bg/card/elevated to the same surface — dual shadows carry depth.
  const bgCardHex = isNeomorph ? baseBg : (dark ? p(surface, 825) : p(surface, 25));
  const bgElevatedHex = isNeomorph ? baseBg : (dark ? p(surface, 800) : p(surface, 25));

  return {
    bg: baseBg,
    bgCard: bgCardHex,
    bgElevated: bgElevatedHex,
    fg: dark ? p(surface, 25) : p(surface, 975),
    muted: dark ? p(surface, 300) : p(surface, 700),
    primary: palette?.brandSwatchOverride ? palette.brandSwatchOverride.hex : (dark ? p(brand, 400) : p(brand, 600)),
    primaryFg: (() => {
      const primaryHex = palette?.brandSwatchOverride ? palette.brandSwatchOverride.hex : (dark ? p(brand, 400) : p(brand, 600));
      return pickFg(primaryHex, p(surface, dark ? 975 : 50), p(surface, dark ? 50 : 975), fgContrastMode);
    })(),
    accent: resolveAccent(firstAccent, brand),
    accentVis: resolveAccentVisible(firstAccent, brand),
    destructive: palette?.errorSwatchOverride ? palette.errorSwatchOverride.hex : (dark ? p(error, 400) : p(error, 600)),
    destructiveFg: (() => {
      const destHex = palette?.errorSwatchOverride ? palette.errorSwatchOverride.hex : (dark ? p(error, 400) : p(error, 600));
      return pickFg(destHex, p(surface, dark ? 975 : 50), p(surface, dark ? 50 : 975), fgContrastMode);
    })(),
    success: resolveAccent(successPal, brand),
    successVis: resolveAccentVisible(successPal, brand),
    warning: resolveAccent(warningPal, brand),
    warningVis: resolveAccentVisible(warningPal, brand),
    primarySecondary: dark ? p(brand, 800) : p(brand, 200),
    successSecondary: successPal ? p(successPal.palette, dark ? 800 : 200) : (dark ? p(brand, 800) : p(brand, 200)),
    accentSecondary: palette?.accentPalettes?.[0] ? p(palette.accentPalettes[0].palette, dark ? 800 : 200) : (dark ? p(brand, 800) : p(brand, 200)),
    destructiveSecondary: dark ? p(error, 800) : p(error, 200),
    border: dark ? p(surface, 700) : p(surface, 200),
    radius, borderW, shadow, shadowSm, shadowInset, isNeomorph,
    isGlass,
    isDark: dark,
    glassDepth: shape?.glassDepth ?? 0.2,
    glassBlur: shape?.glassBlur ?? 2,
    glassDispersion: shape?.glassDispersion ?? 0.5,
    fs: (name: string) => { const v = l(name); return v ? `${v.maxRem}rem` : undefined; },
    lh: (name: string) => l(name)?.lineHeight,
    ls: (name: string) => { const v = l(name); return v?.letterSpacing ? `${v.letterSpacing}em` : undefined; },
    sp: (name: string) => {
      const tok = spacing?.find(s => s.name === name);
      return tok ? `${tok.rem}rem` : ({ '3xs': '0.25rem', '2xs': '0.375rem', xs: '0.5rem', sm: '0.75rem', md: '1rem', lg: '1.5rem' }[name] || '0.5rem');
    },
    headingFf: headingFont ? `'${headingFont}', sans-serif` : undefined,
    bodyFf: bodyFont ? `'${bodyFont}', sans-serif` : undefined,
    headingFw: headingWeight ?? 700,
  };
}

/* ─── Card helper ─── */
function Card({ t, children, style }: { t: Tokens; children: React.ReactNode; style?: React.CSSProperties }) {
  if (t.isGlass) {
    return (
      <div style={{
        position: 'relative',
        backgroundColor: t.bgCard,
        borderRadius: t.radius,
        border: t.borderW ? `${t.borderW}px solid ${t.border}` : 'none',
        overflow: 'hidden',
        ...style,
      }}>
        <LiquidGlass depth={t.glassDepth} blur={t.glassBlur} dispersion={t.glassDispersion} cornerRadius={t.radius} onDark={t.isDark}>
          <div style={{ padding: '8px 10px' }}>{children}</div>
        </LiquidGlass>
      </div>
    );
  }
  return (
    <div style={{
      backgroundColor: t.bgCard,
      borderRadius: t.radius,
      boxShadow: t.shadow,
      border: t.borderW ? `${t.borderW}px solid ${t.border}` : 'none',
      padding: '8px 10px',
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ─── Dashboard Screen ─── */
const barData = [
  { label: 'Mon', pct: 85 },
  { label: 'Tue', pct: 62 },
  { label: 'Wed', pct: 94 },
  { label: 'Thu', pct: 45 },
];

const activities = [
  { name: 'Sarah Chen', action: 'Completed task', time: '2m', status: 'success' as const, initials: 'SC' },
  { name: 'Alex Rivera', action: 'Left a comment', time: '15m', status: 'warning' as const, initials: 'AR' },
  { name: 'Jordan Lee', action: 'Reported issue', time: '1h', status: 'error' as const, initials: 'JL' },
];


function DashboardScreen({ t }: { t: Tokens }) {
  const hFf = t.headingFf || t.bodyFf || 'sans-serif';
  const bFf = t.bodyFf || 'sans-serif';
  const avatarColors = [t.primarySecondary, t.accentSecondary, t.destructiveSecondary];
  const statusMap = {
    success: { label: 'Done', color: t.success },
    warning: { label: 'Review', color: t.warning },
    error: { label: 'Bug', color: t.destructive },
  };

  return (
    <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '10px', fontFamily: bFf }}>

      {/* Widget 1: Greeting */}
      <div>
        <div style={{ fontSize: t.fs('body-s') || '0.8rem', lineHeight: t.lh('body-s') || 1.4, color: t.muted }}>
          Good morning
        </div>
        <div style={{ fontSize: t.fs('h3') || '1.3rem', lineHeight: t.lh('h3') || 1.2, letterSpacing: t.ls('h3'), fontFamily: hFf, fontWeight: t.headingFw, color: t.fg }}>
          Dashboard
        </div>
      </div>

      {/* Widget 2: Stat Cards */}
      <div style={{ display: 'flex', gap: '10px' }}>
        {([
          { label: 'Revenue', value: '$12.4k', change: '+12%', color: t.success, secondaryBg: t.successSecondary },
          { label: 'Users', value: '3,842', change: '+8%', color: t.accent, secondaryBg: t.accentSecondary },
          { label: 'Errors', value: '23', change: '+3', color: t.destructive, secondaryBg: t.destructiveSecondary },
        ]).map((stat) => {
          const statContent = (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.5rem', color: t.muted }}>{stat.label}</span>
                <span style={{
                  fontSize: '0.4rem', fontWeight: 600,
                  padding: '1px 4px', borderRadius: Math.max(2, t.radius - 4),
                  backgroundColor: stat.secondaryBg, color: pickFg(stat.secondaryBg, stat.color, t.fg, 'best'),
                }}>{stat.change}</span>
              </div>
              <div style={{ fontSize: t.fs('h5') || '0.95rem', fontWeight: t.headingFw, fontFamily: hFf, letterSpacing: t.ls('h5'), color: t.fg }}>{stat.value}</div>
            </>
          );
          if (t.isGlass) {
            return (
              <div key={stat.label} style={{
                flex: 1, position: 'relative',
                backgroundColor: t.bgCard,
                borderRadius: t.radius,
                border: t.borderW ? `${t.borderW}px solid ${t.border}` : 'none',
                overflow: 'hidden',
              }}>
                <LiquidGlass depth={t.glassDepth} blur={t.glassBlur} dispersion={t.glassDispersion} cornerRadius={t.radius} onDark={t.isDark}>
                  <div style={{ padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {statContent}
                  </div>
                </LiquidGlass>
              </div>
            );
          }
          return (
            <div key={stat.label} style={{
              flex: 1,
              backgroundColor: t.bgCard,
              borderRadius: t.radius,
              boxShadow: t.shadow,
              border: t.borderW ? `${t.borderW}px solid ${t.border}` : 'none',
              padding: '6px 8px',
              display: 'flex', flexDirection: 'column', gap: '2px',
            }}>
              {statContent}
            </div>
          );
        })}
      </div>

      {/* Widget 3: Bar Chart */}
      <Card t={t}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <div style={{ fontSize: t.fs('body-s') || '0.8rem', fontWeight: 600, fontFamily: hFf, color: t.fg }}>Weekly Activity</div>
          <div style={{ fontSize: t.fs('caption') || '0.65rem', color: t.muted }}>This week</div>
        </div>
        {(() => {
          // Use all available colors: primary, accent, success, warning, destructive
          // Cycle through them; they gracefully fallback to primary tones if not configured
          const barColors = [t.primary, t.accentVis, t.successVis, t.warningVis];
          return barData.map((bar, i) => (
            <div key={bar.label} style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '3px' }}>
              <div style={{ fontSize: '0.55rem', color: t.muted, width: '24px', textAlign: 'right', flexShrink: 0 }}>{bar.label}</div>
              <div style={{ flex: 1, height: '6px', backgroundColor: t.bg, borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${bar.pct}%`, height: '100%', backgroundColor: barColors[i % barColors.length], borderRadius: '3px' }} />
              </div>
              <div style={{ fontSize: '0.5rem', color: t.muted, width: '20px', flexShrink: 0 }}>{bar.pct}%</div>
            </div>
          ));
        })()}
      </Card>

      {/* Widget 4: Activity List */}
      <Card t={t}>
        <div style={{ fontSize: t.fs('body-s') || '0.8rem', fontWeight: 600, fontFamily: hFf, color: t.fg, marginBottom: '6px' }}>
          Recent Activity
        </div>
        {activities.map((act, i) => (
          <div key={act.name} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '4px 0',
            borderBottom: i < activities.length - 1 ? `${t.borderW || 1}px solid ${t.border}` : 'none',
          }}>
            <div style={{
              width: '26px', height: '26px', borderRadius: '50%',
              backgroundColor: avatarColors[i % avatarColors.length],
              color: pickFg(avatarColors[i % avatarColors.length], [t.primary, t.accent, t.destructive][i % 3], t.fg, 'best'),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.5rem', fontWeight: 600, flexShrink: 0,
            }}>{act.initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: t.fs('caption') || '0.65rem', fontWeight: 600, color: t.fg, lineHeight: 1.3 }}>{act.name}</div>
              <div style={{ fontSize: '0.55rem', color: t.muted, lineHeight: 1.3 }}>{act.action}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px', flexShrink: 0 }}>
              <div style={{ fontSize: '0.5rem', color: t.muted }}>{act.time}</div>
              <div style={{
                fontSize: '0.45rem', fontWeight: 600,
                padding: '1px 5px', borderRadius: Math.max(2, t.radius - 4),
                color: statusMap[act.status].color,
                backgroundColor: statusMap[act.status].color + '20',
              }}>{statusMap[act.status].label}</div>
            </div>
          </div>
        ))}
      </Card>

      {/* Widget 5: Quick Actions */}
      <div style={{ display: 'flex', gap: '6px' }}>
        <button style={{
          flex: 1, padding: '4px 8px',
          borderRadius: Math.max(3, t.radius - 2), border: 'none',
          backgroundColor: t.primary, color: t.primaryFg,
          fontSize: t.fs('caption') || '0.65rem', fontWeight: 600, fontFamily: bFf, cursor: 'pointer',
        }}>Create</button>
        <button style={{
          flex: 1, padding: '4px 8px',
          borderRadius: Math.max(3, t.radius - 2),
          border: `${t.borderW || 1}px solid ${t.border}`,
          backgroundColor: 'transparent', color: t.fg,
          fontSize: t.fs('caption') || '0.65rem', fontWeight: 600, fontFamily: bFf, cursor: 'pointer',
        }}>Export</button>
        <button style={{
          flex: 1, padding: '4px 8px',
          borderRadius: Math.max(3, t.radius - 2), border: 'none',
          backgroundColor: t.destructive, color: t.destructiveFg,
          fontSize: t.fs('caption') || '0.65rem', fontWeight: 600, fontFamily: bFf, cursor: 'pointer',
        }}>Delete</button>
      </div>
    </div>
  );
}

/* ─── Messenger Screen (Telegram/Signal style) ─── */
const chatContacts = [
  { name: 'Sarah Chen', msg: 'The new designs look amazing!', time: '10:25', unread: 2, online: true, initials: 'SC' },
  { name: 'Alex Rivera', msg: 'Can you review the PR?', time: '09:45', unread: 0, online: true, initials: 'AR' },
  { name: 'Team Design', msg: 'Maya: Sent the files', time: 'Yesterday', unread: 5, online: false, initials: 'TD' },
  { name: 'Jordan Lee', msg: 'Meeting at 3pm tomorrow', time: 'Yesterday', unread: 0, online: false, initials: 'JL' },
  { name: 'Maya Patel', msg: 'Sounds good!', time: 'Mon', unread: 0, online: false, initials: 'MP' },
  { name: 'Bot Updates', msg: 'Deploy v2.4.1 successful', time: 'Mon', unread: 0, online: false, initials: 'BU' },
  { name: 'Lisa Wang', msg: 'See you at the standup', time: 'Sun', unread: 0, online: false, initials: 'LW' },
  { name: 'David Kim', msg: 'Thanks for the feedback!', time: 'Sat', unread: 0, online: false, initials: 'DK' },
];

const chatMessages = [
  { sent: false, text: 'Hey! How\'s the design system coming along?', time: '10:22' },
  { sent: true, text: 'Really well! Just finished the token generator.', time: '10:24', read: true },
  { sent: false, text: 'The new designs look amazing! Love the color palette', time: '10:25' },
  { sent: true, text: 'Thanks! The fluid type scale makes such a difference.', time: '10:26', read: true },
  { sent: false, text: 'Can you share the link?', time: '10:27' },
  { sent: true, text: 'Sure! standby.design/system', time: '10:28', read: false },
];

function MessengerScreen({ t }: { t: Tokens }) {
  const [view, setView] = useState<'list' | 'chat'>('list');
  const btnR = Math.max(3, t.radius - 4);
  const bubbleR = Math.max(4, t.radius);
  const hFf = t.headingFf || t.bodyFf || 'sans-serif';
  const bFf = t.bodyFf || 'sans-serif';
  const avatarBgs = [t.primarySecondary, t.accentSecondary, t.successSecondary, t.destructiveSecondary, t.primarySecondary, t.accentSecondary, t.successSecondary, t.destructiveSecondary];
  const avatarFgs = [t.primary, t.accent, t.success, t.destructive, t.primary, t.accent, t.success, t.destructive];
  const fsCaption = t.fs('caption') || '0.65rem';
  const fsBody = t.fs('body-s') || '0.75rem';
  const iconSize = 12;

  if (view === 'chat') {
    return (
      <div style={{ backgroundColor: t.bg, color: t.fg, fontFamily: bFf, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Chat header */}
        <div style={{ backgroundColor: t.bgCard, borderBottom: t.borderW ? `${t.borderW}px solid ${t.border}` : 'none', padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <ChevronLeft size={14} color={t.primary} style={{ cursor: 'pointer', flexShrink: 0 }} onClick={() => setView('list')} />
          <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: t.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.primaryFg, fontSize: '0.5rem', fontWeight: 600, flexShrink: 0 }}>SC</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: fsCaption, fontWeight: 600, lineHeight: 1.2 }}>Sarah Chen</div>
            <div style={{ fontSize: '0.5rem', color: t.success }}>online</div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Phone size={iconSize} color={t.muted} />
            <MoreHorizontal size={iconSize} color={t.muted} />
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflow: 'hidden', padding: '6px 10px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div style={{ textAlign: 'center', fontSize: '0.5rem', color: t.muted, padding: '2px 0' }}>Today</div>
          {chatMessages.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.sent ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '78%',
                backgroundColor: m.sent ? t.primarySecondary : t.bgCard,
                color: t.fg,
                borderRadius: bubbleR,
                borderBottomRightRadius: m.sent ? 3 : bubbleR,
                borderBottomLeftRadius: m.sent ? bubbleR : 3,
                padding: '4px 8px',
                boxShadow: m.sent ? 'none' : t.shadow,
                border: !m.sent && t.borderW ? `${t.borderW}px solid ${t.border}` : 'none',
              }}>
                <div style={{ fontSize: fsCaption, lineHeight: 1.4 }}>{m.text}</div>
                <div style={{ fontSize: '0.5rem', color: t.muted, textAlign: 'right', marginTop: '1px', display: 'flex', justifyContent: 'flex-end', gap: '2px', alignItems: 'center' }}>
                  {m.time}
                  {m.sent && <CheckCheck size={8} color={m.read ? t.primary : t.muted} />}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input bar */}
        <div style={{ backgroundColor: t.bgCard, borderTop: t.borderW ? `${t.borderW}px solid ${t.border}` : 'none', padding: '4px 10px', display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
          <Plus size={14} color={t.muted} style={{ cursor: 'pointer', flexShrink: 0 }} />
          {t.isGlass ? (
            <div style={{ flex: 1, position: 'relative', backgroundColor: t.bg, borderRadius: `${btnR}px`, border: t.borderW ? `${t.borderW}px solid ${t.border}` : 'none', overflow: 'hidden' }}>
              <LiquidGlass depth={t.glassDepth * 0.3} blur={t.glassBlur} dispersion={t.glassDispersion * 0.3} cornerRadius={btnR} onDark={t.isDark}>
                <div style={{ padding: '4px 8px', fontSize: fsCaption, color: t.muted }}>Message...</div>
              </LiquidGlass>
            </div>
          ) : (
            <div style={{ flex: 1, backgroundColor: t.bg, color: t.muted, border: t.borderW ? `${t.borderW}px solid ${t.border}` : 'none', borderRadius: `${btnR}px`, padding: '4px 8px', fontSize: fsCaption, boxShadow: t.isNeomorph ? t.shadowInset : undefined }}>
              Message...
            </div>
          )}
          <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: t.primary, color: t.primaryFg, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <ArrowUp size={12} />
          </div>
        </div>
      </div>
    );
  }

  // Contact list view
  return (
    <div style={{ backgroundColor: t.bg, color: t.fg, fontFamily: bFf, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '6px 10px 4px', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <ListFilter size={14} color={t.primary} style={{ cursor: 'pointer' }} />
          <span style={{ fontSize: fsBody, fontWeight: t.headingFw, fontFamily: hFf }}>Messages</span>
          <SquarePen size={14} color={t.primary} style={{ cursor: 'pointer' }} />
        </div>
        {/* Search bar */}
        {t.isGlass ? (
          <div style={{ position: 'relative', backgroundColor: t.bgCard, borderRadius: `${btnR}px`, border: t.borderW ? `${t.borderW}px solid ${t.border}` : 'none', overflow: 'hidden' }}>
            <LiquidGlass depth={t.glassDepth * 0.3} blur={t.glassBlur} dispersion={t.glassDispersion * 0.3} cornerRadius={btnR} onDark={t.isDark}>
              <div style={{ padding: '4px 8px', fontSize: fsCaption, color: t.muted, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Search size={10} /> Search
              </div>
            </LiquidGlass>
          </div>
        ) : (
          <div style={{
            backgroundColor: t.bgCard, borderRadius: `${btnR}px`,
            border: t.borderW ? `${t.borderW}px solid ${t.border}` : 'none',
            padding: '4px 8px', fontSize: fsCaption, color: t.muted,
            display: 'flex', alignItems: 'center', gap: '4px',
            boxShadow: t.isNeomorph ? t.shadowInset : undefined,
          }}>
            <Search size={10} /> Search
          </div>
        )}
      </div>

      {/* Contact list */}
      <div style={{ flex: 1, overflow: 'auto', scrollbarWidth: 'none' as const }}>
        {chatContacts.map((c, i) => (
          <div
            key={c.name}
            onClick={() => i === 0 ? setView('chat') : undefined}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '5px 10px',
              borderBottom: `${t.borderW || 1}px solid ${t.border}`,
              cursor: i === 0 ? 'pointer' : undefined,
            }}
          >
            {/* Avatar with online dot */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                backgroundColor: avatarBgs[i % avatarBgs.length],
                color: avatarFgs[i % avatarFgs.length],
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.45rem', fontWeight: 600,
              }}>{c.initials}</div>
              {c.online && (
                <div style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: '7px', height: '7px', borderRadius: '50%',
                  backgroundColor: t.success,
                  border: `1.5px solid ${t.bg}`,
                }} />
              )}
            </div>

            {/* Name + message */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: fsCaption, fontWeight: 600, color: t.fg }}>{c.name}</span>
                <span style={{ fontSize: '0.5rem', color: c.unread ? t.primary : t.muted, flexShrink: 0 }}>{c.time}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.55rem', color: t.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.msg}</span>
                {c.unread > 0 && (
                  <span style={{
                    minWidth: '14px', height: '14px', borderRadius: '7px',
                    backgroundColor: t.primary, color: t.primaryFg,
                    fontSize: '0.4rem', fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0 3px', flexShrink: 0, marginLeft: '4px',
                  }}>{c.unread}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom tab bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-around',
        backgroundColor: t.bgCard,
        borderTop: t.borderW ? `${t.borderW}px solid ${t.border}` : 'none',
        padding: '4px 0 2px', flexShrink: 0,
      }}>
        {([
          { icon: MessageCircle, label: 'Chats', active: true, badge: 7 },
          { icon: Phone, label: 'Calls', active: false },
          { icon: Users, label: 'Contacts', active: false },
          { icon: Settings, label: 'Settings', active: false },
        ] as const).map((tab) => {
          const Icon = tab.icon;
          return (
            <div key={tab.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px', position: 'relative' }}>
              <div style={{ position: 'relative' }}>
                <Icon size={14} color={tab.active ? t.primary : t.muted} />
                {tab.badge && (
                  <span style={{
                    position: 'absolute', top: '-3px', right: '-6px',
                    minWidth: '10px', height: '10px', borderRadius: '5px',
                    backgroundColor: t.destructive, color: t.destructiveFg,
                    fontSize: '0.35rem', fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0 2px',
                  }}>{tab.badge}</span>
                )}
              </div>
              <span style={{ fontSize: '0.4rem', color: tab.active ? t.primary : t.muted }}>{tab.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Profile Screen ─── */
function ProfileScreen({ t }: { t: Tokens }) {
  const hFf = t.headingFf || t.bodyFf || 'sans-serif';
  const bFf = t.bodyFf || 'sans-serif';
  const fsCaption = t.fs('caption') || '0.65rem';
  const fsBody = t.fs('body-s') || '0.75rem';
  const iconSize = 12;
  const btnR = Math.max(3, t.radius - 2);

  const settingsGroups = [
    {
      items: [
        { icon: Bell, label: 'Notifications', value: 'On', color: t.primary, bg: t.primarySecondary },
        { icon: Moon, label: 'Appearance', value: 'System', color: t.accent, bg: t.accentSecondary },
        { icon: Shield, label: 'Privacy', value: '', color: t.success, bg: t.successSecondary },
      ],
    },
    {
      items: [
        { icon: HelpCircle, label: 'Help & Support', value: '', color: t.muted, bg: t.border },
        { icon: LogOut, label: 'Log Out', value: '', color: t.warning, bg: t.destructiveSecondary },
      ],
    },
  ];

  return (
    <div style={{ fontFamily: bFf, height: '100%', overflow: 'auto', scrollbarWidth: 'none' as const, backgroundColor: t.bg, color: t.fg }}>
      {/* Profile header card */}
      <div style={{
        backgroundColor: t.bgCard, padding: '12px 10px 10px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
        borderBottom: t.borderW ? `${t.borderW}px solid ${t.border}` : 'none',
      }}>
        {/* Avatar with camera badge */}
        <div style={{ position: 'relative' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '50%',
            backgroundColor: t.primarySecondary, color: t.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.9rem', fontWeight: 700,
          }}>JD</div>
          <div style={{
            position: 'absolute', bottom: -1, right: -1,
            width: '16px', height: '16px', borderRadius: '50%',
            backgroundColor: t.primary, color: t.primaryFg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `1.5px solid ${t.bgCard}`,
          }}>
            <Camera size={8} />
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: fsBody, fontWeight: t.headingFw, fontFamily: hFf }}>Jane Doe</div>
          <div style={{ fontSize: '0.5rem', color: t.muted }}>jane@example.com</div>
        </div>
        {/* Stats row */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
          {([
            { label: 'Posts', value: '128' },
            { label: 'Following', value: '847' },
            { label: 'Followers', value: '2.1k' },
          ]).map((s) => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: fsCaption, fontWeight: 700, color: t.fg }}>{s.value}</div>
              <div style={{ fontSize: '0.45rem', color: t.muted }}>{s.label}</div>
            </div>
          ))}
        </div>
        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '6px', width: '100%', marginTop: '6px' }}>
          <button style={{
            flex: 1, padding: '4px 0', borderRadius: btnR, border: 'none',
            backgroundColor: t.primary, color: t.primaryFg,
            fontSize: '0.55rem', fontWeight: 600, fontFamily: bFf, cursor: 'pointer',
          }}>Edit Profile</button>
          <button style={{
            flex: 1, padding: '4px 0', borderRadius: btnR,
            border: `${t.borderW || 1}px solid ${t.border}`,
            backgroundColor: 'transparent', color: t.fg,
            fontSize: '0.55rem', fontWeight: 600, fontFamily: bFf, cursor: 'pointer',
          }}>Share</button>
        </div>
      </div>

      {/* Settings groups */}
      <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {settingsGroups.map((group, gi) => (
          <Card t={t} key={gi}>
            {group.items.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={item.label} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '5px 0',
                  borderBottom: i < group.items.length - 1 ? `${t.borderW || 1}px solid ${t.border}` : 'none',
                }}>
                  <div style={{
                    width: '20px', height: '20px', borderRadius: Math.max(3, t.radius - 4),
                    backgroundColor: item.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Icon size={10} color={item.color} />
                  </div>
                  <span style={{ flex: 1, fontSize: fsCaption, color: t.fg }}>{item.label}</span>
                  <span style={{ fontSize: '0.5rem', color: t.muted }}>{item.value}</span>
                  <ChevronRight size={10} color={t.muted} />
                </div>
              );
            })}
          </Card>
        ))}

        {/* Danger zone */}
        <button style={{
          width: '100%', padding: '6px 0', borderRadius: btnR, border: 'none',
          backgroundColor: t.destructiveSecondary, color: t.destructive,
          fontSize: fsCaption, fontWeight: 600, fontFamily: bFf, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
        }}>
          <Trash2 size={10} /> Delete Account
        </button>
      </div>
    </div>
  );
}

/* ─── Phone Content Wrapper ─── */
function PhoneContent({ t, screenIdx }: { t: Tokens; screenIdx: number }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: t.bg, color: t.fg }}>
      <div style={{ flex: 1, overflow: 'auto', scrollbarWidth: 'none' as const }}>
        {screenIdx === 0 && <DashboardScreen t={t} />}
        {screenIdx === 1 && <MessengerScreen t={t} />}
        {screenIdx === 2 && <ProfileScreen t={t} />}
      </div>
    </div>
  );
}

/* ─── Main Export ─── */
export function AppPreview({ palette, scale, spacing, shape, themeName, headingFont, bodyFont, headingWeight, screenIdx = 0, fgContrastMode = 'best' }: AppPreviewProps) {
  const light = buildTokens(palette, scale, spacing, shape, false, headingFont, bodyFont, headingWeight, fgContrastMode);
  const dark = buildTokens(palette, scale, spacing, shape, true, headingFont, bodyFont, headingWeight, fgContrastMode);

  return (
    <>
      <style>{`
        .phone-pair { transform-origin: bottom center; }
        @media (max-width: 700px) { .phone-pair { transform: scale(0.7); margin-top: -170px; } }
        @media (min-width: 701px) and (max-width: 900px) { .phone-pair { transform: scale(0.8); margin-top: -110px; } }
        @media (min-width: 901px) and (max-width: 1100px) { .phone-pair { transform: scale(0.9); margin-top: -55px; } }
      `}</style>
      <div className="flex justify-center items-end py-6 overflow-hidden">
        <div className="phone-pair flex items-end">
          <div className="relative z-10 -mr-10">
            <PhoneMockup width={300} screenBg={light.bg} statusBarColor={light.fg}>
              <PhoneContent t={light} screenIdx={screenIdx} />
            </PhoneMockup>
          </div>
          <div className="relative z-0" style={{ transform: 'scale(0.92)' }}>
            <PhoneMockup width={300} screenBg={dark.bg} statusBarColor={dark.fg}>
              <PhoneContent t={dark} screenIdx={screenIdx} />
            </PhoneMockup>
          </div>
        </div>
      </div>
    </>
  );
}
