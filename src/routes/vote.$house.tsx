import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AuroraBg, Particles } from "@/components/AuroraBg";
import { TiltGlass } from "@/components/TiltGlass";
import { HouseLockBadge } from "@/components/HouseLockBadge";
import { GlowingBird, GoldDust } from "@/components/GlowingBird";
import { LightRays, StarField } from "@/components/LightRays";
import { CountdownRing } from "@/components/CountdownRing";
import { PremiumButton } from "@/components/PremiumButton";
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
import { Check, Sparkles, Home, Crown, Gem, Shield, Star } from "lucide-react";

export const Route = createFileRoute("/vote/$house")({
  head: () => ({
    meta: [{ title: "Cast Your Vote — House Elections" }],
  }),
  component: VotePage,
});

const ROLES_ORDER: { role: Role; theme: string; Icon: any }[] = [
  { role: "spl", theme: "SPL", Icon: Crown },
  { role: "aspl", theme: "ASPL", Icon: Gem },
  { role: "captain", theme: "Captain", Icon: Shield },
  { role: "vice-captain", theme: "Vice Captain", Icon: Star },
];

function VotePage() {
  const { house } = Route.useParams();
  const navigate = useNavigate();
  const houseInfo = HOUSES.find((h) => h.id === house) as (typeof HOUSES)[number] | undefined;

  const candidates = useStore(() => store.getCandidates());
  const [selections, setSelections] = useState<Partial<Record<Role, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => { seedIfEmpty(); }, []);

  if (!houseInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Unknown house. <Link to="/" className="underline ml-2">Go home</Link>
      </div>
    );
  }

  const houseColor = houseInfo.color;
  const houseGlow = houseInfo.glow;

  function candidatesFor(role: Role): Candidate[] {
    return candidates.filter((c) => {
      if (c.role !== role) return false;
      if (role === "spl" || role === "aspl") return true;
      return c.house === house;
    });
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

  function submit() {
    if (!allFilled) return;
    setSubmitting(true);
    store.addVote({ voterHouse: house as House, selections });
    setTimeout(() => {
      setSubmitted(true);
    }, 400);
  }

  function handleCountdownDone() {
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
        <header className="flex items-center justify-between mb-10 animate-fade-up">
          <Link to="/" className="glass rounded-full px-4 py-2 text-xs text-white/70 hover:text-white flex items-center gap-2 transition hover:scale-105">
            <Home className="w-3.5 h-3.5" /> Home
          </Link>
          <div className="text-center">
            <p className="text-xs uppercase tracking-widest text-white/40">Voting as</p>
            <h1 className="text-2xl md:text-3xl font-bold" style={{ color: houseColor }}>
              {houseInfo.name} House
            </h1>
          </div>
          <div className="w-20" />
        </header>

        {/* Sections */}
        <div className="space-y-16 pb-40">
          {ROLES_ORDER.map(({ role, theme, Icon }, idx) => {
            const list = candidatesFor(role);
            const accent = role === "spl" ? "#fbbf24" : role === "aspl" ? "#a78bfa" : houseColor;
            const glow = role === "spl" ? "rgba(251,191,36,0.5)" : role === "aspl" ? "rgba(167,139,250,0.5)" : houseGlow;
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
                  <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {list.map((c) => {
                      const selected = selectedId === c.id;
                      const dim = selectedId && !selected;
                      return (
                        <TiltGlass
                          key={c.id}
                          as="button"
                          onClick={() => select(role, c.id)}
                          intensity={12}
                          className={`group glass rounded-3xl p-6 text-center aspect-square flex flex-col items-center justify-center ${
                            selected ? "scale-[1.05] animate-pulse-glow" : ""
                          } ${dim ? "opacity-40 saturate-50" : ""}`}
                          style={{
                            ["--glow-color" as any]: glow,
                            ...(selected
                              ? {
                                  border: `2px solid ${accent}`,
                                  boxShadow: `0 0 60px ${glow}, inset 0 1px 0 rgba(255,255,255,0.25)`,
                                  background: `linear-gradient(135deg, ${accent}25, rgba(255,255,255,0.04))`,
                                }
                              : {}),
                          }}
                        >
                          {selected && (
                            <div
                              className="absolute -top-2 -right-2 w-9 h-9 rounded-full flex items-center justify-center z-10 animate-breathe"
                              style={{ background: accent, boxShadow: `0 0 24px ${glow}` }}
                            >
                              <Check className="w-5 h-5 text-black" strokeWidth={3} />
                            </div>
                          )}
                          {/* Circular profile */}
                          <div
                            className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center text-3xl font-bold mb-3 ring-2 transition-all duration-300 group-hover:scale-105"
                            style={{
                              background: `linear-gradient(135deg, ${accent}40, ${accent}10)`,
                              color: accent,
                              boxShadow: `0 0 30px ${glow}`,
                              ["--tw-ring-color" as any]: `${accent}80`,
                            }}
                          >
                            {c.photo ? (
                              <img src={c.photo} alt={c.name} className="w-full h-full object-cover" />
                            ) : (
                              c.name.slice(0, 1).toUpperCase()
                            )}
                          </div>
                          {/* Symbol */}
                          {c.symbol && (
                            <div
                              className="w-10 h-10 mb-2 flex items-center justify-center rounded-lg"
                              style={{ filter: `drop-shadow(0 0 8px ${glow})` }}
                            >
                              {c.symbol.startsWith("data:") || c.symbol.startsWith("http") ? (
                                <img src={c.symbol} alt="" className="w-full h-full object-contain" />
                              ) : (
                                <span className="text-2xl">{c.symbol}</span>
                              )}
                            </div>
                          )}
                          {/* Name */}
                          <p className="text-white font-semibold text-base truncate w-full px-2">{c.name}</p>
                          <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1 truncate w-full">
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
            onClick={submit}
            className="glass-strong rounded-full px-10 py-4 font-semibold text-white text-base disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 flex items-center gap-3"
            style={allFilled ? {
              boxShadow: `0 0 60px ${houseGlow}, inset 0 1px 0 rgba(255,255,255,0.2)`,
              background: `linear-gradient(135deg, ${houseColor}30, rgba(255,255,255,0.04))`,
            } : undefined}
          >
            <Sparkles className="w-4 h-4" />
            {submitting ? "Submitting..." : allFilled ? "Submit Vote" : "Select all candidates to vote"}
          </PremiumButton>
        </div>
      </div>

      {/* Success overlay */}
      {submitted && <SuccessOverlay color={houseColor} glow={houseGlow} onDone={handleCountdownDone} />}
    </div>
  );
}

function SuccessOverlay({ color, glow, onDone }: { color: string; glow: string; onDone: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-3xl" style={{ background: "rgba(5,4,21,0.85)" }}>
      {/* Magical environment */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0" style={{
          background: `radial-gradient(ellipse at center, ${color}33 0%, transparent 60%), radial-gradient(ellipse at 20% 30%, rgba(253,224,71,0.25), transparent 50%), radial-gradient(ellipse at 80% 70%, ${color}22, transparent 50%)`
        }} />
        <StarField count={120} />
        <LightRays color={`${color}88`} />
        <GoldDust count={40} />
        <Particles count={50} color={color} />
      </div>

      {/* Center popup */}
      <div className="relative animate-fade-up" style={{ animation: "fade-up 0.6s ease-out both, breathe 4s ease-in-out infinite 0.6s" }}>
        <div className="glass-strong rounded-[2.5rem] px-12 py-12 text-center relative overflow-visible max-w-md min-w-[340px]"
          style={{ boxShadow: `0 30px 100px ${glow}, 0 0 80px ${glow}, inset 0 1px 0 rgba(255,255,255,0.25)` }}
        >
          {/* outer glow halo */}
          <div className="absolute -inset-8 rounded-[3rem] blur-3xl opacity-50 -z-10" style={{ background: `radial-gradient(circle, ${color}, transparent 70%)` }} />

          {/* Flying bird */}
          <div className="absolute -inset-20 pointer-events-none overflow-visible">
            <div className="absolute top-1/2 left-1/2">
              <GlowingBird color={color} size={48} />
            </div>
          </div>

          <div
            className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 animate-pulse-glow relative"
            style={{ background: `linear-gradient(135deg, ${color}, #ffffff44)`, ["--glow-color" as any]: glow }}
          >
            <Check className="w-12 h-12 text-black" strokeWidth={3} />
            <span className="absolute inset-0 rounded-full animate-ping" style={{ background: color, opacity: 0.3 }} />
          </div>

          <h2 className="text-4xl font-extrabold mb-2 text-shine">Vote Submitted</h2>
          <p className="text-2xl font-semibold text-white mb-2">Successfully</p>
          <p className="text-white/60 mb-8">Thank you for participating</p>

          {/* Countdown */}
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-3">Preparing for next student</p>
          <CountdownRing seconds={5} color={color} onDone={onDone} />
        </div>
      </div>
    </div>
  );
}