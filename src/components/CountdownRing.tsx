import { useEffect, useState } from "react";

export function CountdownRing({ seconds, color = "#fde68a", onDone }: { seconds: number; color?: string; onDone?: () => void }) {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      const left = Math.max(0, seconds - elapsed);
      setRemaining(left);
      if (left <= 0) {
        clearInterval(id);
        onDone?.();
      }
    }, 50);
    return () => clearInterval(id);
  }, [seconds, onDone]);

  const pct = remaining / seconds;
  const C = 2 * Math.PI * 45;
  const offset = C * (1 - pct);

  return (
    <div className="relative w-24 h-24 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" stroke="rgba(15,23,42,0.12)" strokeWidth="4" fill="none" />
        <circle
          cx="50" cy="50" r="45"
          stroke={color}
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={offset}
          style={{ filter: `drop-shadow(0 0 8px ${color})`, transition: "stroke-dashoffset 0.05s linear" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-ink tabular-nums">
        {Math.ceil(remaining)}
      </div>
    </div>
  );
}