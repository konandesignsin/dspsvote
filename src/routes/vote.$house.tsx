import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AuroraBg, Particles } from "@/components/AuroraBg";
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
import { Check, Unlock, Sparkles, Home } from "lucide-react";

export const Route = createFileRoute("/vote/$house")({
  head: () => ({
    meta: [{ title: "Cast Your Vote — House Elections" }],
  }),
  component: VotePage,
});

const ROLES_ORDER: { role: Role; theme: string; accent: string; glow: string }[] = [
  { role: "spl", theme: "SPL", accent: "#fbbf24", glow: "rgba(251,191,36,0.5)" },
  { role: "aspl", theme: "ASPL", accent: "#a78bfa", glow: "rgba(167,139,250,0.5)" },
  { role: "captain", theme: "Captain", accent: "", glow: "" },
  { role: "vice-captain", theme: "Vice Captain", accent: "", glow: "" },
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
    setTimeout(() => {
      const lock = store.getLock();
      if (lock) {
        // refresh to house
        setSubmitted(false);
        setSubmitting(false);
        setSelections({});
        navigate({ to: "/vote/$house", params: { house: lock } });
      } else {
        navigate({ to: "/" });
      }
    }, 4000);
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <AuroraBg />
      <Particles count={30} />

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
          <button
            onClick={() => { store.setLock(null); navigate({ to: "/" }); }}
            className="glass rounded-full px-4 py-2 text-xs text-white/70 hover:text-white flex items-center gap-2 transition hover:scale-105"
          >
            <Unlock className="w-3.5 h-3.5" /> Unlock
          </button>
        </header>

        {/* Sections */}
        <div className="space-y-12 pb-32">
          {ROLES_ORDER.map(({ role, theme }, idx) => {
            const list = candidatesFor(role);
            const accent = role === "spl" ? "#fbbf24" : role === "aspl" ? "#a78bfa" : houseColor;
            const glow = role === "spl" ? "rgba(251,191,36,0.5)" : role === "aspl" ? "rgba(167,139,250,0.5)" : houseGlow;
            return (
              <section key={role} className="animate-fade-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${accent}66, transparent)` }} />
                  <h2 className="text-sm uppercase tracking-[0.3em] font-semibold" style={{ color: accent }}>
                    {theme} · {ROLE_LABEL[role]}
                  </h2>
                  <div className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${accent}66, transparent)` }} />
                </div>

                {list.length === 0 ? (
                  <div className="glass rounded-2xl p-8 text-center text-white/40 text-sm">
                    No candidates yet for {ROLE_LABEL[role]}{role === "captain" || role === "vice-captain" ? ` in ${houseInfo.name}` : ""}.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {list.map((c) => {
                      const selected = selections[role] === c.id;
                      return (
                        <button
                          key={c.id}
                          onClick={() => select(role, c.id)}
                          className={`group relative glass rounded-2xl p-5 text-left transition-all duration-300 hover:-translate-y-1 ${
                            selected ? "scale-[1.03]" : ""
                          }`}
                          style={selected ? {
                            border: `1px solid ${accent}`,
                            boxShadow: `0 0 50px ${glow}, inset 0 1px 0 rgba(255,255,255,0.2)`,
                          } : undefined}
                        >
                          {selected && (
                            <div
                              className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center animate-pulse-glow z-10"
                              style={{ background: accent, ["--glow-color" as any]: glow }}
                            >
                              <Check className="w-4 h-4 text-black" strokeWidth={3} />
                            </div>
                          )}
                          <div className="flex items-center gap-4">
                            <div
                              className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold flex-shrink-0"
                              style={{
                                background: `linear-gradient(135deg, ${accent}40, ${accent}10)`,
                                color: accent,
                                boxShadow: selected ? `0 0 25px ${glow}` : "none",
                              }}
                            >
                              {c.photo ? (
                                <img src={c.photo} alt={c.name} className="w-full h-full object-cover rounded-xl" />
                              ) : (
                                c.name.slice(0, 1).toUpperCase()
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-semibold truncate">{c.name}</p>
                              <p className="text-xs text-white/50 uppercase tracking-wider">
                                {ROLE_LABEL[c.role]}{c.house ? ` · ${HOUSES.find((h) => h.id === c.house)!.name}` : ""}
                              </p>
                              {c.symbol && (
                                <div className="mt-1 inline-block text-2xl">{c.symbol}</div>
                              )}
                            </div>
                          </div>
                        </button>
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
          <button
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
          </button>
        </div>
      </div>

      {/* Success overlay */}
      {submitted && <SuccessOverlay color={houseColor} glow={houseGlow} />}
    </div>
  );
}

function SuccessOverlay({ color, glow }: { color: string; glow: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xl">
      <Particles count={60} color={color} />
      <div className="glass-strong rounded-3xl px-12 py-10 text-center relative overflow-visible animate-fade-up max-w-md">
        <div
          className="absolute inset-0 rounded-3xl blur-3xl opacity-40 -z-10"
          style={{ background: color }}
        />
        {/* flying bird */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 animate-fly-bird text-2xl" style={{ filter: `drop-shadow(0 0 12px ${color})` }}>
            🕊️
          </div>
        </div>
        <div
          className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 animate-pulse-glow"
          style={{ background: color, ["--glow-color" as any]: glow }}
        >
          <Check className="w-10 h-10 text-black" strokeWidth={3} />
        </div>
        <h2 className="text-3xl font-bold text-gradient-luxury mb-2">Vote Submitted</h2>
        <p className="text-white/60">Thank you for shaping the future.</p>
      </div>
    </div>
  );
}