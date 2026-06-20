import { useRef, type ButtonHTMLAttributes, type ReactNode, type MouseEvent } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function PremiumButton({ children, className = "", onClick, ...rest }: Props) {
  const ref = useRef<HTMLButtonElement>(null);

  function handle(e: MouseEvent<HTMLButtonElement>) {
    const el = ref.current;
    if (el) {
      const r = el.getBoundingClientRect();
      const span = document.createElement("span");
      span.className = "ripple";
      span.style.left = `${e.clientX - r.left - 10}px`;
      span.style.top = `${e.clientY - r.top - 10}px`;
      el.appendChild(span);
      setTimeout(() => span.remove(), 700);
    }
    onClick?.(e);
  }

  return (
    <button ref={ref} onClick={handle} className={`btn-premium ${className}`} {...rest}>
      {children}
    </button>
  );
}