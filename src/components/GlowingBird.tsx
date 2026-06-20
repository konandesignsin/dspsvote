export function GlowingBird({ color = "#fde68a", size = 56, path = 1, opacity = 0.9 }: { color?: string; size?: number; path?: 1 | 2 | 3; opacity?: number }) {
  return (
    <div className={`bird-wrap path-${path}`} style={{ width: size, height: size, left: "50%", top: "50%", opacity }}>
      <svg viewBox="0 0 80 60" width={size} height={size} fill="none">
        <defs>
          <radialGradient id="bg-body" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.3" />
          </radialGradient>
        </defs>
        {/* body */}
        <ellipse cx="40" cy="32" rx="10" ry="5" fill="url(#bg-body)" />
        {/* head */}
        <circle cx="52" cy="28" r="4" fill={color} />
        {/* beak */}
        <path d="M55 28 L62 27 L55 30 Z" fill="#f59e0b" />
        {/* tail */}
        <path d="M30 32 L20 28 L24 34 Z" fill={color} opacity="0.8" />
        {/* wings (flapping) */}
        <g className="bird-wing">
          <path d="M40 28 Q30 8 18 16 Q28 24 40 30 Z" fill={color} opacity="0.85" />
          <path d="M40 28 Q50 8 64 14 Q54 22 40 30 Z" fill={color} opacity="0.85" />
        </g>
      </svg>
    </div>
  );
}

export function Bokeh({ count = 18 }: { count?: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: count }).map((_, i) => {
        const size = 40 + ((i * 17) % 80);
        const left = (i * 23) % 100;
        const top = (i * 47) % 100;
        const dx = ((i * 11) % 60) - 30;
        const dy = ((i * 19) % 60) - 30;
        const dur = 8 + ((i * 1.7) % 8);
        const delay = (i * 0.4) % 5;
        const op = 0.25 + ((i * 0.07) % 0.4);
        return (
          <span
            key={i}
            className="bokeh"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: size,
              height: size,
              animationDuration: `${dur}s`,
              animationDelay: `${delay}s`,
              ["--bk-dx" as any]: `${dx}px`,
              ["--bk-dy" as any]: `${dy}px`,
              ["--bk-op" as any]: op,
            }}
          />
        );
      })}
    </div>
  );
}

export function GoldDust({ count = 30 }: { count?: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: count }).map((_, i) => {
        const left = (i * 53) % 100;
        const dx = ((i * 17) % 200) - 100;
        const dur = 4 + ((i * 1.3) % 6);
        const delay = (i * 0.27) % 6;
        return (
          <span
            key={i}
            className="gold-dust"
            style={{
              left: `${left}%`,
              bottom: "-10px",
              ["--dx" as any]: `${dx}px`,
              ["--dy" as any]: `-${300 + (i % 5) * 80}px`,
              animationDuration: `${dur}s`,
              animationDelay: `${delay}s`,
            }}
          />
        );
      })}
    </div>
  );
}