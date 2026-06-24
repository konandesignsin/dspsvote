import { School } from "lucide-react";
import { SCHOOL_NAME, SCHOOL_SUBTITLE, store, useStore } from "@/lib/election";

interface Props {
  size?: "sm" | "md" | "lg" | "hero";
  showName?: boolean;
  showSubtitle?: boolean;
  className?: string;
}

/**
 * Prestigious school identity block: glass-bordered logo + gradient school
 * name + subtitle. Use size="hero" on the home page and size="sm" inside
 * nav bars / success popups.
 */
export function SchoolBrand({
  size = "md",
  showName = true,
  showSubtitle = true,
  className = "",
}: Props) {
  const logo = useStore(() => store.getSchoolLogo());
  const dims =
    size === "hero" ? 156 : size === "lg" ? 112 : size === "md" ? 72 : 44;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <SchoolLogoMark url={logo} size={dims} />
      {showName && (
        <div
          className={`relative mt-${size === "hero" ? 8 : 4} ${
            size === "hero" ? "px-8 py-6 md:px-14 md:py-8" : "px-4 py-2"
          } glass-strong rounded-3xl overflow-hidden`}
          style={{
            boxShadow:
              size === "hero"
                ? "0 30px 80px -20px rgba(253,224,71,0.35), inset 0 1px 0 rgba(255,255,255,0.25)"
                : "inset 0 1px 0 rgba(255,255,255,0.15)",
          }}
        >
          <div
            className="absolute -inset-8 blur-3xl opacity-60 -z-10"
            style={{
              background:
                "radial-gradient(circle, rgba(253,224,71,0.35), transparent 70%)",
            }}
          />
          {/* shimmer sweep */}
          {size === "hero" && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div
                className="absolute inset-y-0 w-1/3"
                style={{
                  background:
                    "linear-gradient(110deg, transparent, rgba(255,255,255,0.18), transparent)",
                  animation: "shine-sweep 5s ease-in-out infinite",
                }}
              />
            </div>
          )}
          <h1
            className={`relative text-shine font-extrabold text-center leading-[1.05] tracking-[0.05em] ${
              size === "hero"
                ? "text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
                : size === "lg"
                  ? "text-3xl md:text-4xl"
                  : "text-xl"
            }`}
            style={{
              textShadow:
                "0 0 24px rgba(253,224,71,0.45), 0 0 60px rgba(255,255,255,0.25)",
            }}
          >
            {SCHOOL_NAME}
          </h1>
          {size === "hero" && (
            <div
              className="absolute inset-0 rounded-3xl pointer-events-none animate-breathe"
              style={{
                boxShadow: "inset 0 0 60px rgba(253,224,71,0.18)",
              }}
            />
          )}
        </div>
      )}
      {showSubtitle && size !== "sm" && (
        <div
          className="mt-5 glass rounded-full px-6 py-2.5 relative animate-fade-up"
          style={{ animationDelay: "0.4s" }}
        >
          <p
            className={`relative font-semibold tracking-[0.4em] text-white/85 ${
              size === "hero" ? "text-sm md:text-base" : "text-xs"
            }`}
          >
            {SCHOOL_SUBTITLE}
          </p>
          {/* house-colored gradient underline */}
          <div
            className="absolute left-6 right-6 -bottom-0.5 h-[2px] rounded-full"
            style={{
              background:
                "linear-gradient(90deg, #fbbf24, #3b82f6, #22c55e, #f97316)",
              boxShadow: "0 0 12px rgba(253,224,71,0.6)",
            }}
          />
        </div>
      )}
    </div>
  );
}

export function SchoolLogoMark({
  url,
  size = 64,
  className = "",
}: {
  url?: string | null;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={`relative rounded-full glass-strong flex items-center justify-center overflow-hidden animate-float-y ${className}`}
      style={{
        width: size,
        height: size,
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(253,224,71,0.10) 50%, rgba(255,255,255,0.04) 100%)",
        boxShadow:
          "0 0 40px rgba(253,224,71,0.35), 0 12px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.35)",
        border: "1px solid rgba(255,255,255,0.25)",
      }}
    >
      <div
        className="absolute -inset-3 rounded-full blur-2xl opacity-70 -z-10"
        style={{
          background:
            "radial-gradient(circle, rgba(253,224,71,0.55), transparent 70%)",
        }}
      />
      {url ? (
        <img
          src={url}
          alt="School logo"
          className="w-full h-full object-contain p-[12%]"
          style={{
            filter:
              "drop-shadow(0 4px 14px rgba(0,0,0,0.5)) drop-shadow(0 0 12px rgba(253,224,71,0.4))",
          }}
        />
      ) : (
        <School
          className="text-white/80"
          style={{ width: size * 0.45, height: size * 0.45 }}
        />
      )}
    </div>
  );
}