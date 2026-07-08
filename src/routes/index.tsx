import { createFileRoute } from "@tanstack/react-router";
import { useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useLayoutEffect, useState } from "react";
import { HOUSES, store, seedIfEmpty, useStore, type House } from "@/lib/election";
import { AuroraBg, Particles } from "@/components/AuroraBg";
import { TiltGlass } from "@/components/TiltGlass";
import { PremiumButton } from "@/components/PremiumButton";
import { SchoolBrand } from "@/components/SchoolBrand";
import { Settings, Lock, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "House Elections — Choose Your House" },
      { name: "description", content: "Luxury futuristic house elections voting experience." },
      { property: "og:title", content: "House Elections" },
      { property: "og:description", content: "Vote for your school leaders." },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const [pendingHouse, setPendingHouse] = useState<House | null>(null);
  const houseSymbols = useStore(() => store.getHouseSymbols());
  // Synchronously detect a device lock before first paint to avoid a flash
  // of the home page when this computer is already locked to a house.
  const [redirecting, setRedirecting] = useState<House | null>(() => {
    if (typeof window === "undefined") return null;
    try { return store.getLock(); } catch { return null; }
  });

  useLayoutEffect(() => {
    seedIfEmpty();
    const l = store.getLock();
    if (l) {
      setRedirecting(l);
      navigate({ to: "/vote/$house", params: { house: l }, replace: true });
    }
  }, [navigate]);

  function chooseHouse(h: House) {
    setPendingHouse(h);
  }

  function confirm(useLock: boolean) {
    if (!pendingHouse) return;
    if (useLock) store.setLock(pendingHouse);
    navigate({ to: "/vote/$house", params: { house: pendingHouse }, replace: useLock });
  }

  // Hide the home page while we're bouncing to the locked house
  if (redirecting) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden">
        <AuroraBg />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <AuroraBg />
      <Particles count={40} />

      <div className="relative z-10 min-h-screen flex flex-col px-6 py-10">
        {/* Header */}
        <header className="flex items-center justify-between mb-12 animate-fade-up">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl glass flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-ink/80" />
            </div>
            <div>
              <h2 className="text-sm font-medium tracking-widest text-ink/60 uppercase">House Elections</h2>
              <p className="text-xs text-ink/40">2026 · Pick your house</p>
            </div>
          </div>
        </header>

        {/* School Identity */}
        <div
          className="mx-auto mb-16 animate-fade-up"
          style={{ animationDelay: "0.1s" }}
        >
          <SchoolBrand size="hero" />
          <p
            className="text-ink/55 text-center text-base md:text-lg mt-8 max-w-2xl mx-auto animate-fade-up"
            style={{ animationDelay: "0.55s" }}
          >
            Step into the arena. Choose your house and cast your vote for the
            leaders who will shape our school's next chapter.
          </p>
        </div>

        {/* House grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto w-full">
          {HOUSES.map((h, i) => (
            <TiltGlass
              key={h.id}
              as="button"
              intensity={14}
              onClick={() => chooseHouse(h.id)}
              className={`house-card-${h.id} group glass-card rounded-3xl p-8 text-left animate-fade-up cursor-pointer overflow-hidden`}
              style={{ animationDelay: `${0.2 + i * 0.1}s` }}
            >
              {/* glow halo */}
              <div
                className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10 blur-2xl"
                style={{ background: h.color }}
              />
              {/* shimmer */}
              <div className="absolute inset-0 opacity-30 group-hover:opacity-60 transition-opacity pointer-events-none"
                style={{ background: `radial-gradient(circle at 30% 20%, ${h.color}22, transparent 60%)` }} />

              <div className="relative">
                <div
                  className="w-24 h-24 rounded-2xl flex items-center justify-center mb-6 animate-float-y overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${h.color}40, ${h.color}10)`,
                    boxShadow: `0 0 50px ${h.glow}, inset 0 1px 0 rgba(255,255,255,0.2)`,
                  }}
                >
                  {houseSymbols[h.id] ? (
                    <img
                      src={houseSymbols[h.id]}
                      alt={h.name}
                      className="w-full h-full object-contain p-2"
                      style={{ filter: `drop-shadow(0 0 12px ${h.glow})` }}
                    />
                  ) : (
                    <span className="text-4xl">
                      {h.id === "minotaur" && "🐂"}
                      {h.id === "kraken" && "🐙"}
                      {h.id === "thunderbird" && "🦅"}
                      {h.id === "dragon" && "🐉"}
                    </span>
                  )}
                </div>
                <p className="text-xs uppercase tracking-widest text-ink/70 mb-2">House</p>
                <h3
                  className="text-3xl font-bold mb-2 text-legible"
                  style={{ color: h.color, textShadow: `0 0 20px ${h.glow}, 0 1px 2px rgba(0,0,0,0.6)` }}
                >
                  {h.name}
                </h3>
                <p className="text-ink/85 text-sm text-legible">
                  Enter and cast your vote for {h.name} leaders.
                </p>
                <div
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-ink rounded-full px-4 py-2 transition-all group-hover:scale-[1.03]"
                  style={{
                    background: `linear-gradient(135deg, ${h.color}55, ${h.color}22)`,
                    border: `1px solid ${h.color}aa`,
                    boxShadow: `0 8px 24px -8px ${h.glow}, inset 0 1px 0 rgba(255,255,255,0.25)`,
                    textShadow: "0 1px 2px rgba(0,0,0,0.55)",
                  }}
                >
                  Vote now <span className="transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>
            </TiltGlass>
          ))}
        </div>

        {/* Footer / admin link */}
        <footer className="mt-auto pt-16 flex justify-center">
          <Link to="/admin" className="glass rounded-full px-5 py-2.5 text-xs text-ink/60 hover:text-ink flex items-center gap-2 hover:scale-105 transition">
            <Settings className="w-3.5 h-3.5" /> Admin Panel
          </Link>
        </footer>
      </div>

      {/* Lock confirmation modal */}
      {pendingHouse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/25 backdrop-blur-md animate-fade-up">
          <div className="glass-strong rounded-3xl p-8 max-w-md w-full text-center relative overflow-hidden">
            <div
              className="absolute -top-20 -left-20 w-60 h-60 rounded-full blur-3xl opacity-40"
              style={{ background: HOUSES.find((x) => x.id === pendingHouse)!.color }}
            />
            <div className="relative">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl glass flex items-center justify-center">
                <Lock className="w-6 h-6 text-ink/80" />
              </div>
              <h3 className="text-2xl font-bold text-ink mb-2">Lock this device?</h3>
              <p className="text-ink/60 text-sm mb-6">
                Lock this computer to <span className="font-semibold" style={{ color: HOUSES.find((x) => x.id === pendingHouse)!.color }}>{HOUSES.find((x) => x.id === pendingHouse)!.name}</span> so the next students can vote here without re-selecting. (This setting is local to this device only.)
              </p>
              <div className="flex flex-col gap-3">
                <PremiumButton
                  onClick={() => confirm(true)}
                  className="glass rounded-2xl py-3 px-5 font-medium text-ink hover:scale-[1.02] transition flex items-center justify-center gap-2"
                  style={{ boxShadow: `0 0 30px ${HOUSES.find((x) => x.id === pendingHouse)!.glow}` }}
                >
                  <Lock className="w-4 h-4" /> Enable Lock
                </PremiumButton>
                <PremiumButton
                  onClick={() => confirm(false)}
                  className="rounded-2xl py-3 px-5 text-ink/70 hover:text-ink transition"
                >
                  Continue Without Lock
                </PremiumButton>
                <button onClick={() => setPendingHouse(null)} className="text-xs text-ink/40 hover:text-ink/60 mt-2">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* legacy stub kept to satisfy router tree */
function _Placeholder() {
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ backgroundColor: "#fcfbf8" }}
    >
      <img
        data-lovable-blank-page-placeholder="REMOVE_THIS"
        src="https://cdn.gpteng.co/blank-app-v1.svg"
        alt="Your app will live here!"
      />
    </div>
  );
}
