import type { PaletteEntry } from '@/lib/palette';

interface PanelSvgProps {
  idx: number;
  panelType: 'light' | 'dark' | 'light-hc' | 'dark-hc';
  brand: Record<number, PaletteEntry>;
}

function getHex(map: Record<number, PaletteEntry>, step: number): string {
  return map[step]?.hex ?? '#888';
}

function getSvgColors(panelType: PanelSvgProps['panelType'], v: Record<number, PaletteEntry>) {
  switch (panelType) {
    case 'light':
      return {
        bg: getHex(v, 200), srf1: getHex(v, 75), srf2: getHex(v, 300),
        srf3: getHex(v, 200), srfLine: getHex(v, 400), bristle: '#fdfcfb',
        brand1: getHex(v, 300), brand2: getHex(v, 400), brand3: getHex(v, 500), brand4: getHex(v, 600),
      };
    case 'dark':
      return {
        bg: getHex(v, 700), srf1: getHex(v, 500), srf2: getHex(v, 600),
        srf3: getHex(v, 500), srfLine: getHex(v, 400), bristle: '#fdfcfb',
        brand1: getHex(v, 300), brand2: getHex(v, 400), brand3: getHex(v, 500), brand4: getHex(v, 600),
      };
    case 'light-hc':
      return {
        bg: getHex(v, 200), srf1: getHex(v, 75), srf2: getHex(v, 300),
        srf3: getHex(v, 200), srfLine: getHex(v, 400), bristle: '#fdfcfb',
        brand1: getHex(v, 400), brand2: getHex(v, 500), brand3: getHex(v, 600), brand4: getHex(v, 700),
      };
    case 'dark-hc':
      return {
        bg: getHex(v, 700), srf1: getHex(v, 500), srf2: getHex(v, 600),
        srf3: getHex(v, 500), srfLine: getHex(v, 400), bristle: '#fdfcfb',
        brand1: getHex(v, 200), brand2: getHex(v, 300), brand3: getHex(v, 400), brand4: getHex(v, 500),
      };
  }
}

const animCss = `
  .anim-palette { animation: float-palette 5s ease-in-out 1 forwards; transform-origin: 100px 120px; }
  .anim-brush { animation: swipe-brush 4s cubic-bezier(0.4,0,0.2,1) 1 forwards; transform-origin: 0 0; }
  .anim-splash { animation: splash-pop 4s ease-in-out 1 forwards; transform-origin: 135px 120px; }
  @keyframes float-palette { 0%{transform:translateY(0) rotate(0)} 100%{transform:translateY(-4px) rotate(2deg)} }
  @keyframes swipe-brush {
    0%{transform:translate(145px,80px) rotate(-30deg) scale(1)}
    25%{transform:translate(140px,95px) rotate(-45deg) scale(1)}
    40%{transform:translate(135px,120px) rotate(-60deg) scale(1.15,0.85)}
    55%{transform:translate(95px,115px) rotate(-75deg) scale(1)}
    75%{transform:translate(115px,85px) rotate(-15deg) scale(1)}
    100%{transform:translate(145px,80px) rotate(-30deg) scale(1)}
  }
  @keyframes splash-pop {
    0%,36%,55%,100%{transform:scale(0);opacity:0}
    40%{transform:scale(1);opacity:1}
    48%{transform:scale(1.6);opacity:0}
  }
`;

export function PanelSvg({ idx, panelType, brand }: PanelSvgProps) {
  const c = getSvgColors(panelType, brand);
  const fid = `svg-ps-${idx}`;

  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-[140px] block my-1">
      <style>{animCss}</style>
      <defs>
        <filter id={fid} x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="2" dy="5" stdDeviation="4" floodColor="rgba(0,0,0,0.18)" floodOpacity="1" />
        </filter>
      </defs>
      <circle cx="100" cy="100" r="75" fill={c.bg} />
      <g className="anim-palette">
        <path d="M 60 135 C 50 95, 100 90, 130 100 C 150 105, 155 140, 135 155 C 110 170, 70 175, 60 135 Z" fill={c.srf2} filter={`url(#${fid})`} />
        <path d="M 60 130 C 50 90, 100 85, 130 95 C 150 100, 155 135, 135 150 C 110 165, 70 170, 60 130 Z" fill={c.srf1} />
        <circle cx="75" cy="137" r="9" fill={c.srf2} />
        <circle cx="75" cy="135" r="9" fill={c.bg} />
        <ellipse cx="78" cy="115" rx="8" ry="5" fill={c.brand1} transform="rotate(-15 78 115)" />
        <ellipse cx="98" cy="103" rx="8" ry="5.5" fill={c.brand2} transform="rotate(-5 98 103)" />
        <ellipse cx="118" cy="104" rx="9" ry="6" fill={c.brand3} transform="rotate(10 118 104)" />
        <ellipse cx="135" cy="120" rx="10" ry="6.5" fill={c.brand4} transform="rotate(30 135 120)" />
      </g>
      <circle className="anim-splash" cx="135" cy="120" r="10" fill="none" stroke={c.brand4} strokeWidth="2" />
      <circle className="anim-splash" cx="135" cy="120" r="14" fill="none" stroke={c.brand2} strokeWidth="1.5" style={{ animationDelay: '0.1s' }} />
      <g className="anim-brush">
        <path d="M -4 -35 Q -8 -60 -3 -80 Q 0 -85 3 -80 Q 8 -60 4 -35 Z" fill={c.srf3} />
        <path d="M 0 -35 Q -2 -60 0 -83 Q 6 -60 4 -35 Z" fill={c.srf2} opacity="0.4" />
        <rect x="-5" y="-35" width="10" height="12" rx="1" fill={c.srf2} />
        <line x1="-5" y1="-31" x2="5" y2="-31" stroke={c.srfLine} strokeWidth="1" />
        <line x1="-5" y1="-27" x2="5" y2="-27" stroke={c.srfLine} strokeWidth="1" />
        <path d="M -5 -23 C -10 -10 -5 -2 0 0 C 4 -2 8 -12 5 -23 Z" fill={c.bristle} />
        <path d="M -3.5 -12 C -5 -5 -2 -1 0 0 C 2 -1 5 -5 3.5 -12 Q 0 -9 -3.5 -12 Z" fill={c.brand4} />
      </g>
    </svg>
  );
}
