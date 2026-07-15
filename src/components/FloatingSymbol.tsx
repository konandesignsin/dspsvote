import { useRef, type MouseEvent } from "react";

interface Props {
  src: string;
  accent: string;
  glow: string;
  size?: number;
}

/**
 * A transparent-PNG symbol that floats above the candidate hexagon.
 * - Continuous slow drift (float-y)
 * - Cursor-tracked 3D tilt on hover
 * - Slow ambient glow halo behind, tinted to the house accent
 * - Layered drop-shadows for depth
 */
export function FloatingSymbol({ src, accent, glow, size = 56 }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  function onMove(e: MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const ry = (px - 0.5) * 20; // max ~10deg
    const rx = -(py - 0.5) * 20;
    el.style.setProperty("--sy-rx", `${rx}deg`);
    el.style.setProperty("--sy-ry", `${ry}deg`);
  }
  function onLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--sy-rx", "0deg");
    el.style.setProperty("--sy-ry", "0deg");
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onTouchStart={onLeave}
      className="floating-symbol pointer-events-auto"
      style={{
        width: size,
        height: size,
        perspective: "500px",
      }}
    >
      {/* Ambient pulsing halo */}
      <div
        className="absolute inset-0 rounded-full animate-symbol-halo pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${accent}88 0%, ${accent}33 40%, transparent 70%)`,
          filter: `blur(10px)`,
        }}
      />
      {/* Drifting + tilting symbol */}
      <div
        className="relative w-full h-full animate-symbol-drift"
        style={{
          transform:
            "rotateX(var(--sy-rx,0deg)) rotateY(var(--sy-ry,0deg))",
          transformStyle: "preserve-3d",
          transition: "transform 200ms ease-out",
        }}
      >
        <img
          src={src}
          alt=""
          className="w-full h-full object-contain select-none"
          draggable={false}
          style={{
            filter: `drop-shadow(0 6px 8px rgba(0,0,0,0.55)) drop-shadow(0 2px 3px rgba(0,0,0,0.4)) drop-shadow(0 0 12px ${glow})`,
          }}
        />
      </div>
    </div>
  );
}