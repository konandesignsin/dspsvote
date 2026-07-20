import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { AuroraBg, Particles } from "@/components/AuroraBg";
import { TiltGlass } from "@/components/TiltGlass";
import { HouseLockBadge } from "@/components/HouseLockBadge";
import { GlowingBird, GoldDust, Bokeh } from "@/components/GlowingBird";
import { LightRays, StarField } from "@/components/LightRays";
import { PremiumButton } from "@/components/PremiumButton";
import { CountdownRing } from "@/components/CountdownRing";
import { SchoolLogoMark } from "@/components/SchoolBrand";
import { SCHOOL_NAME } from "@/lib/election";
import { FloatingSymbol } from "@/components/FloatingSymbol";
import {
  HOUSES,
  ROLE_LABEL,
  store,
  useStore,
  seedIfEmpty,
  type Candidate,
  type House,
  type Role,
} from "@/lib/election";
import { Check, Sparkles, Home, Crown, Gem, Shield, Star, Trophy, Music } from "lucide-react";

export const Route = createFileRoute("/vote/$house")({
  head: () => ({
    meta: [{ title: "Cast Your Vote — House Elections" }],
  }),
  component: VotePage,
});

const ROLES_ORDER: { role: Role; theme: string; Icon: any }[] = [
  { role: "spl", theme: "SPL", Icon: Crown },
  { role: "aspl", theme: "ASPL", Icon: Gem },
  { role: "sports-sec", theme: "Sports Secretary", Icon: Trophy },
  { role: "cultural-sec", theme: "Cultural Secretary", Icon: Music },
  { role: "captain", theme: "Captain", Icon: Shield },
  { role: "vice-captain", theme: "Vice Captain", Icon: Star },
];

function VotePage() {
  const { house } = Route.useParams();
  const navigate = useNavigate();
  const houseInfo = HOUSES.find((h) => h.id === house) as (typeof HOUSES)[number] | undefined;
  const schoolLogo = useStore(() => store.getSchoolLogo());

  const candidates = useStore(() => store.getCandidates());
  const [selections, setSelections] = useState<Partial<Record<Role, string>>>({});
  const [reviewing, setReviewing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => { seedIfEmpty(); }, []);

  // Strict device-lock enforcement: if this computer is locked to a
  // different house, bounce to the locked house. Lock is local-only.
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const lock = store.getLock();
    if (lock && lock !== house) {
      navigate({ to: "/vote/$house", params: { house: lock }, replace: true });
    }
  }, [house, navigate]);

  if (!houseInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Unknown house. <Link to="/" className="underline ml-2">Go home</Link>
      </div>
    );
  }

  const houseColor = houseInfo.color;
  const houseGlow = houseInfo.glow;

  const COMMON_ROLES: Role[] = ["spl", "aspl", "sports-sec", "cultural-sec"];

  function candidatesFor(role: Role): Candidate[] {
    const list = candidates.filter((c) => {
      if (c.role !== role) return false;
      if (COMMON_ROLES.includes(role)) return true;
      return c.house === house;
    });
    if (role === "aspl") {
      const order = store.getAsplOrder();
      if (order.length > 0) {
        const idx = (id: string) => {
          const i = order.indexOf(id);
          return i === -1 ? Number.MAX_SAFE_INTEGER : i;
        };
        return [...list].sort((a, b) => idx(a.id) - idx(b.id));
      }
    }
    return list;
  }

  function select(role: Role, id: string) {
    setSelections((s) => ({ ...s, [role]: id }));
  }

  const allFilled = useMemo(() => {
    return ROLES_ORDER.every(({ role }) => {
      const list = candidatesFor(role);
      return list.length === 0 || selections[role];
    });
  }, [selections, candidates, house]);

  function openReview() {
    if (!allFilled) return;
    setReviewing(true);
  }

  function confirmVote() {
    setSubmitting(true);
    store.addVote({ voterHouse: house as House, selections });
    setReviewing(false);
    setTimeout(() => {
      setSubmitted(true);
    }, 350);
  }

  function handleCountdownDone() {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const lock = store.getLock();
    if (lock) {
      setSubmitted(false);
      setSubmitting(false);
      setSelections({});
    } else {
      navigate({ to: "/" });
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <AuroraBg />
      <Particles count={30} />
      <HouseLockBadge />

      {/* House color halo */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[40vh] rounded-full blur-3xl opacity-30 pointer-events-none"
        style={{ background: houseColor }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-10 animate-fade-up gap-3">
          <Link to="/" className="glass rounded-full px-4 py-2 text-xs text-white/70 hover:text-white flex items-center gap-2 transition hover:scale-105">
            <Home className="w-3.5 h-3.5" /> Home
          </Link>
          <div className="flex flex-col items-center text-center">
            <SchoolLogoMark url={schoolLogo} size={88} />
            <h1
              className="mt-2 text-lg sm:text-xl md:text-2xl font-extrabold tracking-[0.04em] text-white"
              style={{
                textShadow: "0 0 24px rgba(253,224,71,0.45), 0 0 50px rgba(255,255,255,0.25)",
              }}
            >
              {SCHOOL_NAME}
            </h1>
            <p className="text-[10px] uppercase tracking-[0.35em] text-white/40 mt-1">Voting as</p>
            <h2 className="text-2xl md:text-3xl font-bold" style={{ color: houseColor }}>
              {houseInfo.name} House
            </h2>
          </div>
          <div className="w-20" />
        </header>

        {/* Sections */}
        <div className="space-y-16 pb-40">
          {ROLES_ORDER.map(({ role, theme, Icon }, idx) => {
            const list = candidatesFor(role);
            const accent =
              role === "spl" ? "#fbbf24"
              : role === "aspl" ? "#a78bfa"
              : role === "sports-sec" ? "#34d399"
              : role === "cultural-sec" ? "#f472b6"
              : houseColor;
            const glow =
              role === "spl" ? "rgba(251,191,36,0.5)"
              : role === "aspl" ? "rgba(167,139,250,0.5)"
              : role === "sports-sec" ? "rgba(52,211,153,0.5)"
              : role === "cultural-sec" ? "rgba(244,114,182,0.5)"
              : houseGlow;
            const selectedId = selections[role];
            return (
              <section
                key={role}
                className="relative glass-strong rounded-[2rem] p-6 md:p-10 animate-fade-up overflow-hidden"
                style={{
                  animationDelay: `${idx * 0.12}s`,
                  boxShadow: `0 30px 80px -20px ${glow}, inset 0 1px 0 rgba(255,255,255,0.12)`,
                  border: `1px solid ${accent}33`,
                }}
              >
                {/* Ambient glow */}
                <div
                  className="absolute -top-32 left-1/2 -translate-x-1/2 w-[120%] h-72 rounded-full blur-3xl opacity-30 pointer-events-none"
                  style={{ background: accent }}
                />
                <div
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{ background: `radial-gradient(ellipse at top, ${accent}33, transparent 60%)` }}
                />
                {/* Floating sparks */}
                <Particles count={8} color={accent} />

                {/* Grand heading */}
                <div className="relative text-center mb-10">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="h-px w-12 md:w-24" style={{ background: `linear-gradient(to right, transparent, ${accent})` }} />
                    <Icon className="w-5 h-5 md:w-6 md:h-6" style={{ color: accent, filter: `drop-shadow(0 0 10px ${glow})` }} />
                    <div className="h-px w-12 md:w-24" style={{ background: `linear-gradient(to left, transparent, ${accent})` }} />
                  </div>
                  <h2
                    className="text-3xl md:text-5xl font-extrabold tracking-tight animate-pulse-glow-text"
                    style={{
                      backgroundImage: `linear-gradient(135deg, #ffffff 0%, ${accent} 60%, #ffffff 100%)`,
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: "transparent",
                      textShadow: `0 0 40px ${glow}`,
                    }}
                  >
                    {ROLE_LABEL[role].toUpperCase()}
                  </h2>
                  <div className="flex items-center justify-center gap-1 mt-3">
                    <span className="text-xs uppercase tracking-[0.4em]" style={{ color: accent }}>
                      {theme}
                    </span>
                  </div>
                  <div
                    className="mx-auto mt-4 h-[2px] w-32 rounded-full"
                    style={{ background: `linear-gradient(to right, transparent, ${accent}, transparent)` }}
                  />
                </div>

                {list.length === 0 ? (
                  <div className="glass rounded-2xl p-8 text-center text-white/40 text-sm relative">
                    No candidates yet for {ROLE_LABEL[role]}{role === "captain" || role === "vice-captain" ? ` in ${houseInfo.name}` : ""}.
                  </div>
                ) : (
                  <div className="relative flex flex-wrap justify-center gap-10 md:gap-14 pt-24">
                    {list.map((c) => {
                      const selected = selectedId === c.id;
                      const dim = selectedId && !selected;
                      const hex = "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)";
                      return (
                        <TiltGlass
                          key={c.id}
                          as="button"
                          onClick={() => select(role, c.id)}
                          intensity={10}
                          className={`group relative flex-1 min-w-[260px] max-w-[320px] pt-40 pb-10 px-8 text-center flex flex-col items-center justify-end transition-all duration-500 ${
                            selected
                              ? "scale-[1.06] animate-pulse-glow z-10"
                              : dim
                                ? "scale-[0.97] opacity-45 saturate-50"
                                : "hover:-translate-y-1 hover:scale-[1.02]"
                          }`}
                          style={{
                            ["--glow-color" as any]: glow,
                            borderRadius: "32px",
                            background: selected
                              ? `linear-gradient(160deg, ${accent}30, rgba(20,18,45,0.55) 55%, rgba(10,8,28,0.4))`
                              : "linear-gradient(160deg, rgba(20,18,45,0.55), rgba(10,8,28,0.35))",
                            backdropFilter: "blur(28px) saturate(170%)",
                            border: selected
                              ? `1.5px solid ${accent}`
                              : `1px solid ${accent}33`,
                            boxShadow: selected
                              ? `0 0 90px ${glow}, 0 30px 70px -15px ${glow}, inset 0 1px 0 rgba(255,255,255,0.22)`
                              : `0 18px 55px -12px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.08)`,
                          }}
                        >
                          {selected && (
                            <div
                              className="absolute -top-3 -right-3 w-10 h-10 rounded-full flex items-center justify-center z-30 animate-breathe"
                              style={{ background: accent, boxShadow: `0 0 28px ${glow}` }}
                            >
                              <Check className="w-5 h-5 text-black" strokeWidth={3} />
                            </div>
                          )}

                          {/* Hexagonal avatar — floating above card */}
                          <div
                            className={`absolute left-1/2 -translate-x-1/2 -top-20 transition-all duration-500 ${
                              selected ? "scale-105" : "group-hover:scale-[1.04]"
                            }`}
                            style={{ width: 200, height: 200 }}
                          >
                            {/* Outer glow hex ring */}
                            <div
                              className="absolute inset-0"
                              style={{
                                clipPath: hex,
                                background: `linear-gradient(135deg, ${accent}, ${accent}55)`,
                                filter: `drop-shadow(0 0 30px ${glow}) drop-shadow(0 20px 40px rgba(0,0,0,0.6))`,
                              }}
                            />
                            {/* Inner photo */}
                            <div
                              className="absolute flex items-center justify-center font-bold text-6xl overflow-hidden"
                              style={{
                                inset: 4,
                                clipPath: hex,
                                background: `linear-gradient(135deg, ${accent}30, ${accent}05)`,
                                color: accent,
                              }}
                            >
                              {c.photo ? (
                                <img
                                  src={c.photo}
                                  alt={c.name}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                              ) : (
                                c.name.slice(0, 1).toUpperCase()
                              )}
                            </div>

                            {/* Small circular badge — sits at bottom-center of the hex.
                                Uses the dedicated badge image if provided, else falls back to the photo. */}
                            {(c.badge || c.photo) && (
                              <div
                                className="absolute left-1/2 -translate-x-1/2 rounded-full overflow-hidden z-20"
                                style={{
                                  bottom: -22,
                                  width: 70,
                                  height: 70,
                                  border: `2px solid ${accent}`,
                                  background: "rgba(10,8,28,0.6)",
                                  boxShadow: `0 0 18px ${glow}, 0 8px 18px rgba(0,0,0,0.55)`,
                                }}
                              >
                                <img src={c.badge || c.photo} alt="" className="w-full h-full object-cover" />
                              </div>
                            )}

                            {/* Floating symbol — top-left/northwest of the hex, transparent PNG */}
                            {c.symbol && (c.symbol.startsWith("data:") || c.symbol.startsWith("http")) && (
                              <div
                                className="absolute z-30"
                                style={{ left: -18, top: -16, width: 86, height: 86 }}
                              >
                                <FloatingSymbol src={c.symbol} accent={accent} glow={glow} size={86} />
                              </div>
                            )}
                          </div>

                          {/* Frosted divider */}
                          <div
                            className="w-2/3 h-px mb-3"
                            style={{
                              background: `linear-gradient(to right, transparent, ${accent}88, transparent)`,
                            }}
                          />

                          {/* Nameplate footer */}
                          <p className="text-white font-bold text-lg truncate w-full px-2 text-legible tracking-wide">
                            {c.name}
                          </p>
                          <p className="text-[10px] text-white/70 uppercase tracking-[0.3em] mt-1 truncate w-full">
                            {c.house ? HOUSES.find((h) => h.id === c.house)!.name : "Common"}
                          </p>
                        </TiltGlass>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {/* Submit bar */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30">
          <PremiumButton
            disabled={!allFilled || submitting}
            onClick={openReview}
            className="glass-strong rounded-full px-10 py-4 font-semibold text-white text-base disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 flex items-center gap-3"
            style={allFilled ? {
              boxShadow: `0 0 60px ${houseGlow}, 0 12px 40px -8px ${houseGlow}, inset 0 1px 0 rgba(255,255,255,0.3)`,
              background: `linear-gradient(135deg, ${houseColor}, ${houseColor}bb)`,
              border: `1px solid ${houseColor}`,
              color: "#0b0a1e",
              textShadow: "0 1px 0 rgba(255,255,255,0.35)",
            } : undefined}
          >
            <Sparkles className="w-4 h-4" />
            {submitting ? "Submitting..." : allFilled ? "Submit Vote" : "Select all candidates to vote"}
          </PremiumButton>
        </div>
      </div>

      {/* Review confirmation overlay */}
      {reviewing && !submitted && (
        <ReviewOverlay
          color={houseColor}
          glow={houseGlow}
          selections={selections}
          candidates={candidates}
          onEdit={() => setReviewing(false)}
          onConfirm={confirmVote}
        />
      )}

      {/* Success overlay */}
      {submitted && <SuccessOverlay color={houseColor} glow={houseGlow} onDone={handleCountdownDone} />}
    </div>
  );
}

function ReviewOverlay({
  color,
  glow,
  selections,
  candidates,
  onEdit,
  onConfirm,
}: {
  color: string;
  glow: string;
  selections: Partial<Record<Role, string>>;
  candidates: Candidate[];
  onEdit: () => void;
  onConfirm: () => void;
}) {
  const rows = ROLES_ORDER.map(({ role, Icon }) => {
    const id = selections[role];
    const cand = id ? candidates.find((c) => c.id === id) : undefined;
    const accent =
      role === "spl" ? "#fbbf24"
      : role === "aspl" ? "#a78bfa"
      : role === "sports-sec" ? "#34d399"
      : role === "cultural-sec" ? "#f472b6"
      : color;
    const accentGlow =
      role === "spl" ? "rgba(251,191,36,0.5)"
      : role === "aspl" ? "rgba(167,139,250,0.5)"
      : role === "sports-sec" ? "rgba(52,211,153,0.5)"
      : role === "cultural-sec" ? "rgba(244,114,182,0.5)"
      : glow;
    return { role, Icon, cand, accent, accentGlow };
  }).filter((r) => r.cand);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: "rgba(5,4,21,0.55)",
        backdropFilter: "blur(28px) saturate(150%)",
        animation: "fade-up 0.4s ease-out both",
      }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 animate-breathe"
          style={{
            background: `radial-gradient(ellipse at center, ${color}33 0%, transparent 60%), radial-gradient(ellipse at 20% 20%, rgba(253,224,71,0.22), transparent 55%), radial-gradient(ellipse at 80% 80%, ${color}22, transparent 55%)`,
          }}
        />
        <Particles count={28} color={color} />
      </div>

      <div className="relative animate-popup-in w-full max-w-xl">
        <div
          className="glass-strong rounded-[2.5rem] p-7 md:p-9 relative overflow-hidden animate-float-y"
          style={{
            boxShadow: `0 30px 100px ${glow}, 0 0 80px rgba(253,224,71,0.2), inset 0 1px 0 rgba(255,255,255,0.28)`,
            background: `linear-gradient(135deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.04) 50%, ${color}12 100%)`,
            border: "1px solid rgba(255,255,255,0.18)",
          }}
        >
          <div
            className="absolute -inset-10 rounded-[3.5rem] blur-3xl opacity-40 -z-10"
            style={{ background: `radial-gradient(circle, ${color}, transparent 70%)` }}
          />
          <div className="absolute inset-x-8 top-0 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(255,255,255,0.55), transparent)" }} />

          {/* Shimmer sweep */}
          <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none">
            <div
              className="absolute inset-y-0 w-1/3"
              style={{
                background: "linear-gradient(110deg, transparent, rgba(255,255,255,0.12), transparent)",
                animation: "shine-sweep 4s ease-in-out infinite",
              }}
            />
          </div>

          <div className="text-center mb-6 relative">
            <p className="text-[10px] uppercase tracking-[0.4em]" style={{ color }}>Confirm Ballot</p>
            <h2 className="text-3xl md:text-4xl font-extrabold mt-2 text-shine tracking-tight">Review Your Vote</h2>
            <p className="text-white/65 text-sm mt-2">Please confirm your selections before submitting.</p>
          </div>

          <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1 relative">
            {rows.map(({ role, Icon, cand, accent, accentGlow }) => (
              <div
                key={role}
                className="glass rounded-2xl p-3.5 flex items-center gap-4 transition-all"
                style={{
                  border: `1px solid ${accent}44`,
                  boxShadow: `0 8px 24px -10px ${accentGlow}, inset 0 1px 0 rgba(255,255,255,0.12)`,
                  background: `linear-gradient(135deg, ${accent}14, rgba(255,255,255,0.03))`,
                }}
              >
                <div
                  className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center font-bold text-lg shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${accent}40, ${accent}10)`,
                    color: accent,
                    boxShadow: `0 0 22px ${accentGlow}, inset 0 1px 0 rgba(255,255,255,0.25)`,
                  }}
                >
                  {cand!.photo ? (
                    <img src={cand!.photo} alt={cand!.name} className="w-full h-full object-cover" />
                  ) : (
                    cand!.name.slice(0, 1).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5" style={{ color: accent, filter: `drop-shadow(0 0 6px ${accentGlow})` }} />
                    <span className="text-[10px] uppercase tracking-[0.3em]" style={{ color: accent }}>
                      {ROLE_LABEL[role]}
                    </span>
                  </div>
                  <p className="text-white font-semibold text-base truncate mt-0.5">{cand!.name}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-7">
            <PremiumButton
              onClick={onEdit}
              className="flex-1 glass rounded-full px-6 py-3 font-semibold text-white/90 text-sm transition-all duration-300 hover:scale-[1.03]"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.04))",
                border: "1px solid rgba(255,255,255,0.25)",
                boxShadow: "0 10px 30px -10px rgba(255,255,255,0.18), inset 0 1px 0 rgba(255,255,255,0.25)",
              }}
            >
              Edit Vote
            </PremiumButton>
            <PremiumButton
              onClick={onConfirm}
              className="flex-1 glass-strong rounded-full px-6 py-3 font-bold text-white text-sm transition-all duration-300 hover:scale-[1.05] animate-pulse-glow flex items-center justify-center gap-2"
              style={{
                ["--glow-color" as any]: "rgba(251,191,36,0.55)",
                background: "linear-gradient(135deg, #fbbf24, #f59e0b 60%, #fde68a)",
                border: "1px solid rgba(253,224,71,0.6)",
                boxShadow: "0 0 50px rgba(251,191,36,0.55), inset 0 1px 0 rgba(255,255,255,0.45)",
                color: "#1a1206",
              }}
            >
              <Sparkles className="w-4 h-4" /> Confirm Vote
            </PremiumButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function SuccessOverlay({ color, glow, onDone }: { color: string; glow: string; onDone: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: "rgba(5,4,21,0.6)",
        backdropFilter: "blur(28px) saturate(150%)",
        animation: "fade-up 0.5s ease-out both",
      }}
    >
      {/* Magical environment */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 animate-breathe"
          style={{
            background: `radial-gradient(ellipse at center, ${color}40 0%, transparent 55%), radial-gradient(ellipse at 15% 25%, rgba(253,224,71,0.28), transparent 50%), radial-gradient(ellipse at 85% 75%, ${color}33, transparent 50%), radial-gradient(ellipse at 60% 90%, rgba(167,139,250,0.22), transparent 50%)`,
          }}
        />
        <StarField count={140} />
        <Bokeh count={22} />
        <LightRays color={`${color}99`} />
        <GoldDust count={55} />
        <Particles count={50} color={color} />

        {/* Aurora waves */}
        <div className="absolute inset-0 opacity-50">
          <div className="aurora-blob" style={{ top: "10%", left: "10%", width: 600, height: 600, background: color }} />
          <div className="aurora-blob" style={{ bottom: "10%", right: "10%", width: 600, height: 600, background: "#fde68a", animationDelay: "4s" }} />
          <div className="aurora-blob" style={{ top: "40%", left: "50%", width: 500, height: 500, background: "#a78bfa", opacity: 0.4, animationDelay: "8s" }} />
        </div>

        {/* Three flying birds around popup */}
        <div className="absolute top-1/2 left-1/2 pointer-events-none">
          <GlowingBird color="#fde68a" size={42} path={1} opacity={0.85} />
          <GlowingBird color={color} size={36} path={2} opacity={0.75} />
          <GlowingBird color="#ffffff" size={30} path={3} opacity={0.6} />
        </div>
      </div>

      {/* Glow burst from center */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full animate-glow-burst pointer-events-none"
        style={{ background: `radial-gradient(circle, ${color}, transparent 70%)` }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full animate-glow-burst pointer-events-none"
        style={{ background: `radial-gradient(circle, #fde68a, transparent 70%)`, animationDelay: "0.3s" }}
      />

      {/* Center popup */}
      <div className="relative animate-popup-in">
        <div
          className="glass-strong rounded-[2.5rem] px-12 py-12 text-center relative overflow-visible max-w-md min-w-[360px] animate-float-y"
          style={{
            boxShadow: `0 30px 120px ${glow}, 0 0 100px ${glow}, 0 0 200px rgba(253,224,71,0.25), inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(255,255,255,0.05)`,
            background: `linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 50%, ${color}15 100%)`,
          }}
        >
          {/* multi-layer glow halo */}
          <div className="absolute -inset-12 rounded-[3.5rem] blur-3xl opacity-60 -z-10" style={{ background: `radial-gradient(circle, ${color}, transparent 70%)` }} />
          <div className="absolute -inset-6 rounded-[3rem] blur-2xl opacity-40 -z-10" style={{ background: `radial-gradient(circle, #fde68a, transparent 70%)` }} />

          {/* Top reflective highlight */}
          <div className="absolute inset-x-8 top-0 h-px" style={{ background: `linear-gradient(to right, transparent, rgba(255,255,255,0.6), transparent)` }} />

          {/* Shimmer sweep */}
          <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none">
            <div
              className="absolute inset-y-0 w-1/3"
              style={{
                background: "linear-gradient(110deg, transparent, rgba(255,255,255,0.15), transparent)",
                animation: "shine-sweep 3.5s ease-in-out infinite",
              }}
            />
          </div>

          {/* School identity header */}
          <div className="mb-5 relative">
            <p className="text-[10px] uppercase tracking-[0.45em] text-white/55 mb-2">Official Election</p>
            <h1
              className="font-extrabold tracking-[0.04em] leading-[1.05] text-2xl sm:text-3xl md:text-4xl"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #ffffff 0%, #fde68a 45%, #ffffff 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                textShadow: "0 0 24px rgba(253,224,71,0.55), 0 0 50px rgba(255,255,255,0.25)",
                filter: "drop-shadow(0 4px 18px rgba(253,224,71,0.35))",
              }}
            >
              {SCHOOL_NAME}
            </h1>
            <div
              className="mx-auto mt-3 h-[2px] w-40 rounded-full"
              style={{
                background:
                  "linear-gradient(to right, transparent, rgba(253,224,71,0.85), transparent)",
                boxShadow: "0 0 14px rgba(253,224,71,0.6)",
              }}
            />
          </div>

          <div
            className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 relative animate-pulse-glow"
            style={{
              background: `linear-gradient(135deg, ${color}, #fde68a)`,
              ["--glow-color" as any]: glow,
              boxShadow: `0 0 50px ${glow}, inset 0 2px 8px rgba(255,255,255,0.4)`,
            }}
          >
            <Check className="w-12 h-12 text-black relative z-10" strokeWidth={3} />
            <span className="absolute inset-0 rounded-full animate-ping" style={{ background: color, opacity: 0.4 }} />
            <span className="absolute -inset-2 rounded-full animate-ping" style={{ background: "#fde68a", opacity: 0.2, animationDelay: "0.5s" }} />
          </div>

          <h2 className="text-4xl md:text-5xl font-extrabold mb-1 text-shine tracking-tight">
            Vote Submitted
          </h2>
          <p className="text-2xl font-bold text-shine mb-3">Successfully</p>
          <p className="text-white/70 mb-8 text-base">Thank you for participating</p>

          {/* 3-second countdown for next student */}
          <div
            className="mt-8 mx-auto max-w-[240px] glass rounded-[2rem] px-6 py-5 text-center animate-breathe"
            style={{
              border: "1px solid rgba(253,224,71,0.25)",
              boxShadow: "0 0 40px rgba(253,224,71,0.15), inset 0 1px 0 rgba(255,255,255,0.18)",
              background: "linear-gradient(135deg, rgba(253,224,71,0.10), rgba(255,255,255,0.04))",
            }}
          >
            <p className="text-[10px] uppercase tracking-[0.35em] text-white/60 mb-3">Preparing for Next Student</p>
            <div className="flex items-center justify-center">
              <CountdownRing seconds={3} color="#fde68a" onDone={onDone} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}