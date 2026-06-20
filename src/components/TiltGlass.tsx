import { useRef, type CSSProperties, type ReactNode, type MouseEvent } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  intensity?: number;
  onClick?: () => void;
  as?: "div" | "button";
}

export function TiltGlass({ children, className = "", style, intensity = 10, onClick, as = "div" }: Props) {
  const ref = useRef<HTMLDivElement & HTMLButtonElement>(null);

  function onMove(e: MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--ry", `${(px - 0.5) * intensity}deg`);
    el.style.setProperty("--rx", `${-(py - 0.5) * intensity}deg`);
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
  }
  function onLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--rx", "0deg");
  }

  const Cmp: any = as;
  return (
    <Cmp
      ref={ref}
      onClick={onClick}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`tilt-glass relative ${className}`}
      style={style}
    >
      {children}
    </Cmp>
  );
}