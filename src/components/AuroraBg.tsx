import { StarField } from "./LightRays";

export function AuroraBg() {
  return (
    <div className="aurora-bg">
      {/* corner house glows */}
      <div className="aurora-blob" style={{ top: "-10%", left: "-10%", width: 500, height: 500, background: "#fbbf24" }} />
      <div className="aurora-blob" style={{ top: "-10%", right: "-10%", width: 500, height: 500, background: "#3b82f6", animationDelay: "3s" }} />
      <div className="aurora-blob" style={{ bottom: "-10%", left: "-10%", width: 500, height: 500, background: "#22c55e", animationDelay: "6s" }} />
      <div className="aurora-blob" style={{ bottom: "-10%", right: "-10%", width: 500, height: 500, background: "#f97316", animationDelay: "9s" }} />
      <div className="aurora-blob" style={{ top: "30%", left: "40%", width: 400, height: 400, background: "#8b5cf6", opacity: 0.3, animationDelay: "12s" }} />
      <StarField count={50} />
    </div>
  );
}

/**
 * Calm, cinematic ambient particle field.
 * Mixes 4 layers: dim stars, soft bokeh, golden dust, blurred sparkles.
 * Everything drifts extremely slowly to keep the atmosphere peaceful.
 */
export function Particles({ count = 30, color = "white" }: { count?: number; color?: string }) {
  // Cap density so the screen never feels crowded
  const total = Math.min(count, 36);
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {Array.from({ length: total }).map((_, i) => {
        const layer = i % 4; // 0=star 1=bokeh 2=dust 3=blurred sparkle
        const left = (i * 53) % 100;
        const top = (i * 29) % 100;
        const delay = -((i * 4.7) % 60);
        // very slow drift — 60s to 140s
        const dur = 70 + ((i * 11) % 70);
        const driftDur = 18 + ((i * 5) % 22);
        const size =
          layer === 1 ? 10 + ((i * 3) % 14) // bokeh
          : layer === 3 ? 5 + ((i * 2) % 6)  // blurred sparkle
          : 1 + ((i * 2) % 3);               // star / dust

        let bg = color;
        let blur = 0;
        let opacity = 0.5;
        if (layer === 1) {
          bg = `radial-gradient(circle, ${color === "white" ? "rgba(253,224,71,0.55)" : color} 0%, transparent 65%)`;
          blur = 6; opacity = 0.35;
        } else if (layer === 2) {
          bg = "radial-gradient(circle, #fde68a, rgba(251,191,36,0.4) 55%, transparent 80%)";
          blur = 1; opacity = 0.6;
        } else if (layer === 3) {
          bg = `radial-gradient(circle, ${color === "white" ? "#ffffff" : color}, transparent 70%)`;
          blur = 3; opacity = 0.5;
        } else {
          bg = color === "white" ? "rgba(255,255,255,0.85)" : color;
          opacity = 0.45;
        }

        return (
          <span
            key={i}
            className="ambient-particle"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: size,
              height: size,
              background: bg,
              filter: blur ? `blur(${blur}px)` : undefined,
              opacity,
              animationDelay: `${delay}s, ${delay * 0.6}s`,
              animationDuration: `${dur}s, ${driftDur}s`,
              ["--drift-x" as any]: `${((i % 2 === 0 ? 1 : -1) * (12 + (i * 3) % 24))}px`,
            }}
          />
        );
      })}
    </div>
  );
}