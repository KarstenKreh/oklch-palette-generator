interface PhoneMockupProps {
  width?: number;
  screenBg?: string;
  statusBarColor?: string;
  statusBarTime?: string;
  children: React.ReactNode;
}

export function PhoneMockup({
  width = 300,
  screenBg = '#000',
  statusBarColor = '#fff',
  statusBarTime = '9:41',
  children,
}: PhoneMockupProps) {
  const scale = width / 280;
  const s = (v: number) => Math.round(v * scale);

  const frameWidth = s(8);
  const outerRadius = s(44);
  const innerRadius = s(36);
  const height = Math.round(width * (149.6 / 71.5));

  const btnWidth = s(3);
  const muteSwitchTop = s(85);
  const muteSwitchHeight = s(22);
  const volUpTop = s(128);
  const volBtnHeight = s(48);
  const volDownTop = s(184);
  const powerBtnTop = s(152);
  const powerBtnHeight = s(72);
  const btnRadius = s(2);

  const islandWidth = s(79);
  const islandHeight = s(24);
  const islandRadius = s(12);
  const islandTop = s(7);

  const screenInnerWidth = width - 2 * frameWidth;
  const ptScale = screenInnerWidth / 402;
  const pt = (v: number) => Math.round(v * ptScale);
  const islandCenterY = islandTop + islandHeight / 2;
  const statusBarFontSize = Math.max(pt(17), 8);
  const statusBarPadX = pt(24);
  const statusBarTopPad = Math.round(islandCenterY - statusBarFontSize / 2);
  const statusBarIconH = pt(12);
  const statusBarBatteryH = pt(13);
  const statusBarIconGap = pt(7);

  const safeAreaTop = s(39);
  const safeAreaBottom = s(22);
  const homeIndicatorWidth = s(88);
  const homeIndicatorHeight = s(4);
  const homeIndicatorBottom = s(6);

  const btnStyle = (top: number, h: number, side: 'left' | 'right'): React.CSSProperties => ({
    position: 'absolute',
    width: btnWidth,
    height: h,
    top,
    ...(side === 'left' ? { left: -btnWidth } : { right: -btnWidth }),
    borderRadius: side === 'left' ? `${btnRadius}px 0 0 ${btnRadius}px` : `0 ${btnRadius}px ${btnRadius}px 0`,
    background: 'linear-gradient(to bottom, #2a2a2e 0%, #18181b 50%, #09090b 100%)',
    boxShadow: side === 'left' ? `inset ${s(1)}px 0 ${s(1)}px rgba(255,255,255,0.08)` : `inset -${s(1)}px 0 ${s(1)}px rgba(255,255,255,0.06)`,
  });

  return (
    <div
      className="relative inline-block"
      style={{
        width,
        filter: `drop-shadow(0 ${s(20)}px ${s(30)}px rgba(0,0,0,0.3)) drop-shadow(0 ${s(6)}px ${s(12)}px rgba(0,0,0,0.15))`,
      }}
    >
      {/* Frame */}
      <div
        className="relative"
        style={{
          width,
          height,
          borderRadius: outerRadius,
          padding: frameWidth,
          background: `radial-gradient(ellipse at top right, rgba(255,255,255,0.06) 0%, transparent 50%), linear-gradient(170deg, #1c1c1f 0%, #111113 30%, #08080a 100%)`,
          boxShadow: `inset 0 ${s(1)}px ${s(2)}px rgba(255,255,255,0.12), inset 0 -${s(1)}px ${s(3)}px rgba(0,0,0,0.95), inset ${s(1)}px 0 ${s(1)}px rgba(255,255,255,0.07), inset -${s(1)}px 0 ${s(1)}px rgba(0,0,0,0.8)`,
        }}
      >
        {/* Hardware buttons */}
        <div style={btnStyle(muteSwitchTop, muteSwitchHeight, 'left')} />
        <div style={btnStyle(volUpTop, volBtnHeight, 'left')} />
        <div style={btnStyle(volDownTop, volBtnHeight, 'left')} />
        <div style={btnStyle(powerBtnTop, powerBtnHeight, 'right')} />

        {/* Screen */}
        <div
          className="relative h-full w-full overflow-hidden"
          style={{ borderRadius: innerRadius, background: screenBg }}
        >
          {/* Dynamic Island */}
          <div
            className="absolute left-1/2 z-30 -translate-x-1/2"
            style={{
              width: islandWidth,
              height: islandHeight,
              borderRadius: islandRadius,
              top: islandTop,
              background: '#050505',
              boxShadow: `inset 0 0 ${s(1)}px rgba(255,255,255,0.04)`,
            }}
          >
            <div
              className="absolute top-1/2 -translate-y-1/2 rounded-full"
              style={{
                right: s(7),
                width: s(10),
                height: s(10),
                background: 'radial-gradient(circle at 35% 35%, #2e2e38 0%, #14141a 60%, #0a0a0e 100%)',
                border: `${Math.max(s(0.5), 0.5)}px solid rgba(255,255,255,0.08)`,
              }}
            >
              <div
                className="absolute rounded-full"
                style={{
                  top: '20%', left: '20%',
                  width: s(2.5), height: s(2.5),
                  background: '#80c4ff',
                  opacity: 0.6,
                  boxShadow: `0 0 ${s(2)}px rgba(128,196,255,0.8)`,
                }}
              />
            </div>
          </div>

          {/* Status bar */}
          <div
            className="absolute inset-x-0 z-20 flex items-start justify-between pointer-events-none"
            style={{
              top: 0,
              height: safeAreaTop,
              padding: `${statusBarTopPad}px ${statusBarPadX}px 0`,
              fontSize: statusBarFontSize,
              color: statusBarColor,
            }}
          >
            <span className="font-semibold leading-none" style={{ letterSpacing: -pt(0.3) }}>
              {statusBarTime}
            </span>
            <div className="flex items-center" style={{ gap: statusBarIconGap, height: statusBarBatteryH }}>
              <svg viewBox="0 0 20 13" fill="currentColor" style={{ height: statusBarIconH, width: 'auto' }}>
                <path fillRule="evenodd" clipRule="evenodd" d="M19.2 1.146C19.2.513 18.722 0 18.133 0h-1.066C16.478 0 16 .513 16 1.146v9.934c0 .633.478 1.146 1.067 1.146h1.066c.59 0 1.067-.513 1.067-1.146V1.146zm-7.434 1.3h1.067c.589 0 1.066.525 1.066 1.173v7.434c0 .648-.477 1.173-1.066 1.173h-1.067c-.589 0-1.067-.525-1.067-1.173V3.62c0-.649.478-1.174 1.067-1.174zM7.434 5.094H6.367C5.778 5.094 5.3 5.627 5.3 6.283v4.755c0 .656.478 1.188 1.067 1.188h1.067c.589 0 1.066-.532 1.066-1.188V6.283c0-.656-.477-1.189-1.066-1.189zM2.133 7.54H1.067C.478 7.54 0 8.064 0 8.711v2.343c0 .648.478 1.172 1.067 1.172h1.066C2.723 12.226 3.2 11.702 3.2 11.055V8.71c0-.647-.477-1.172-1.067-1.172z" />
              </svg>
              <svg viewBox="0 0 18 13" fill="currentColor" style={{ height: statusBarIconH, width: 'auto' }}>
                <path fillRule="evenodd" clipRule="evenodd" d="M8.571 2.466c2.487 0 4.88.922 6.682 2.576.136.128.353.126.487-.003l1.297-1.264a.388.388 0 00-.003-.487C12.303-1.094 4.839-1.094.108 3.281a.388.388 0 00-.108.494l1.298 1.264c.134.13.35.131.487.004a10.077 10.077 0 016.786-2.577zm0 4.22a7.57 7.57 0 013.669 1.436c.136.131.35.128.483-.007l1.287-1.32a.42.42 0 00-.01-.46c-3.064-2.891-7.809-2.891-10.873 0a.42.42 0 00-.01.458l1.287 1.32c.133.135.347.138.483.007A7.57 7.57 0 018.568 6.687zm2.524 2.793a.472.472 0 01-.103.28L8.813 12.216a.326.326 0 01-.483 0l-2.177-2.456a.472.472 0 01.113-.556 4.788 4.788 0 014.826 0 .472.472 0 01.113.276z" />
              </svg>
              <svg viewBox="0 0 28 13" fill="currentColor" style={{ height: statusBarBatteryH, width: 'auto', marginLeft: pt(1) }}>
                <rect opacity="0.35" x="0.5" y="0.5" width="24" height="12" rx="3.8" stroke="currentColor" fill="none" />
                <path opacity="0.4" d="M26 4.781v4.075a2.503 2.503 0 000-4.075" />
                <rect x="2" y="2" width="21" height="9" rx="2.5" />
              </svg>
            </div>
          </div>

          {/* Content area */}
          <div
            className="absolute inset-x-0 overflow-hidden"
            style={{
              top: safeAreaTop,
              bottom: safeAreaBottom,
            }}
          >
            <div className="h-full w-full overflow-auto" style={{ scrollbarWidth: 'none' }}>
              {children}
            </div>
          </div>

          {/* Glass reflection */}
          <div
            className="pointer-events-none absolute inset-0 z-40"
            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 35%, transparent 50%)' }}
          />

          {/* Screen edge shadow */}
          <div
            className="pointer-events-none absolute inset-0 z-50"
            style={{
              borderRadius: innerRadius,
              boxShadow: `inset 0 ${s(2)}px ${s(3)}px rgba(0,0,0,0.35), inset 0 0 ${s(1)}px rgba(0,0,0,0.5)`,
            }}
          />

          {/* Home indicator */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex items-end justify-center"
            style={{ height: safeAreaBottom, paddingBottom: homeIndicatorBottom }}
          >
            <div
              className="rounded-full"
              style={{
                width: homeIndicatorWidth,
                height: homeIndicatorHeight,
                background: statusBarColor,
                opacity: 0.85,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
