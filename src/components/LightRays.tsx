export function LightRays({ color = "rgba(253,224,71,0.5)" }: { color?: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[-30, -15, 0, 15, 30, 45, -45].map((rot, i) => (
        <div
          key={i}
          className="light-ray animate-light-ray"
          style={{
            ["--ray-rot" as any]: `${rot}deg`,
            ["--ray-color" as any]: color,
            animationDelay: `${i * 0.7}s`,
            width: `${4 + (i % 3) * 3}px`,
          }}
        />
      ))}
    </div>
  );
}

export function StarField({ count = 60 }: { count?: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: count }).map((_, i) => {
        const left = (i * 41) % 100;
        const top = (i * 73) % 100;
        const size = 1 + ((i * 3) % 3);
        const delay = (i * 0.31) % 4;
        const dur = 3 + ((i * 0.7) % 4);
        return (
          <span
            key={i}
            className="absolute animate-twinkle rounded-full"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: size,
              height: size,
              background: "white",
              boxShadow: "0 0 6px rgba(255,255,255,0.9)",
              animationDelay: `${delay}s`,
              animationDuration: `${dur}s`,
            }}
          />
        );
      })}
    </div>
  );
}