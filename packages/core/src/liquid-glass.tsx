import { useId, type ReactNode, type CSSProperties } from 'react';
import { DISPLACEMENT_MAP } from './liquid-glass-map';

export interface LiquidGlassProps {
  children?: ReactNode;
  /** Displacement magnitude. 0 = flat, ~1 = subtle, 3+ = dramatic. */
  depth: number;
  /** Backdrop blur multiplier. 0 = none, 10 = strong. */
  blur: number;
  /** Chromatic aberration intensity. 0 = none, 3+ = prismatic. */
  dispersion: number;
  /** Border radius in px. */
  cornerRadius: number;
  /** Saturation boost percent, default 160. */
  saturation?: number;
  /** Backdrop is dark — subtler edge highlights to avoid harsh glowing lines. */
  onDark?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function LiquidGlass({
  children,
  depth,
  blur,
  dispersion,
  cornerRadius,
  saturation = 160,
  onDark = false,
  className,
  style,
}: LiquidGlassProps) {
  const rawId = useId();
  const filterId = `lg-${rawId.replace(/[:]/g, '_')}`;

  const displacementScale = depth * 80;
  const aberrationIntensity = dispersion * 5;
  const blurPx = Math.max(0.1, blur * 3);

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        borderRadius: `${cornerRadius}px`,
        overflow: 'hidden',
        ...style,
      }}
    >
      <svg aria-hidden width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }}>
        <defs>
          <filter
            id={filterId}
            x="-35%"
            y="-35%"
            width="170%"
            height="170%"
            colorInterpolationFilters="sRGB"
          >
            <feImage
              href={DISPLACEMENT_MAP}
              x="0"
              y="0"
              width="100%"
              height="100%"
              result="MAP"
              preserveAspectRatio="xMidYMid slice"
            />

            {/* Red channel — baseline displacement */}
            <feDisplacementMap
              in="SourceGraphic"
              in2="MAP"
              scale={-displacementScale}
              xChannelSelector="R"
              yChannelSelector="B"
              result="R_DISP"
            />
            <feColorMatrix
              in="R_DISP"
              type="matrix"
              values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="R_ONLY"
            />

            {/* Green channel — slightly different displacement */}
            <feDisplacementMap
              in="SourceGraphic"
              in2="MAP"
              scale={-displacementScale - aberrationIntensity * 2}
              xChannelSelector="R"
              yChannelSelector="B"
              result="G_DISP"
            />
            <feColorMatrix
              in="G_DISP"
              type="matrix"
              values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="G_ONLY"
            />

            {/* Blue channel — most displaced, drives prismatic fringe */}
            <feDisplacementMap
              in="SourceGraphic"
              in2="MAP"
              scale={-displacementScale - aberrationIntensity * 4}
              xChannelSelector="R"
              yChannelSelector="B"
              result="B_DISP"
            />
            <feColorMatrix
              in="B_DISP"
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
              result="B_ONLY"
            />

            <feBlend in="G_ONLY" in2="B_ONLY" mode="screen" result="GB" />
            <feBlend in="R_ONLY" in2="GB" mode="screen" />
          </filter>
        </defs>
      </svg>

      {/* Glass layer — distorts + blurs the backdrop behind the wrapper.
          Filter URL is chained INTO backdrop-filter (not standalone `filter:`),
          so it operates on the backdrop, not the layer's own box-shadow. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: `${cornerRadius}px`,
          backdropFilter: `url(#${filterId}) blur(${blurPx}px) saturate(${saturation}%)`,
          WebkitBackdropFilter: `url(#${filterId}) blur(${blurPx}px) saturate(${saturation}%)`,
          boxShadow: onDark
            ? 'inset 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 2px rgba(255,255,255,0.1), 0 1px 4px rgba(0,0,0,0.3)'
            : 'inset 0 0 0 1px rgba(255,255,255,0.22), inset 0 1px 2px rgba(255,255,255,0.3), 0 1px 4px rgba(0,0,0,0.08)',
          pointerEvents: 'none',
        }}
      />

      {/* Content — rendered crisp, on top of the glass layer */}
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
}
