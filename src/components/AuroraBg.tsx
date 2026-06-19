export function AuroraBg() {
  return (
    <div className="aurora-bg">
      {/* corner house glows */}
      <div className="aurora-blob" style={{ top: "-10%", left: "-10%", width: 500, height: 500, background: "#fbbf24" }} />
      <div className="aurora-blob" style={{ top: "-10%", right: "-10%", width: 500, height: 500, background: "#3b82f6", animationDelay: "3s" }} />
      <div className="aurora-blob" style={{ bottom: "-10%", left: "-10%", width: 500, height: 500, background: "#22c55e", animationDelay: "6s" }} />
      <div className="aurora-blob" style={{ bottom: "-10%", right: "-10%", width: 500, height: 500, background: "#f97316", animationDelay: "9s" }} />
      <div className="aurora-blob" style={{ top: "30%", left: "40%", width: 400, height: 400, background: "#8b5cf6", opacity: 0.3, animationDelay: "12s" }} />
    </div>
  );
}

export function Particles({ count = 30, color = "white" }: { count?: number; color?: string }) {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => {
        const left = (i * 37) % 100;
        const delay = (i * 1.3) % 15;
        const dur = 10 + ((i * 7) % 15);
        const size = 2 + ((i * 3) % 4);
        return (
          <span
            key={i}
            className="particle"
            style={{
              left: `${left}%`,
              width: size,
              height: size,
              background: color,
              animationDelay: `${delay}s`,
              animationDuration: `${dur}s`,
            }}
          />
        );
      })}
    </div>
  );
}