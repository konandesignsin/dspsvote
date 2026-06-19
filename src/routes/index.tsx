import { createFileRoute } from "@tanstack/react-router";
import { useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { HOUSES, store, seedIfEmpty, type House } from "@/lib/election";
import { AuroraBg, Particles } from "@/components/AuroraBg";
import { Settings, Lock, Unlock, Sparkles } from "lucide-react";

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
  const [lock, setLock] = useState<House | null>(null);

  useEffect(() => {
    seedIfEmpty();
    const l = store.getLock();
    setLock(l);
    if (l) {
      // redirect immediately if locked
      navigate({ to: "/vote/$house", params: { house: l } });
    }
  }, [navigate]);

  function chooseHouse(h: House) {
    setPendingHouse(h);
  }

  function confirm(useLock: boolean) {
    if (!pendingHouse) return;
    if (useLock) store.setLock(pendingHouse);
    navigate({ to: "/vote/$house", params: { house: pendingHouse } });
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
              <Sparkles className="w-5 h-5 text-white/80" />
            </div>
            <div>
              <h2 className="text-sm font-medium tracking-widest text-white/60 uppercase">House Elections</h2>
              <p className="text-xs text-white/40">2026 · Pick your house</p>
            </div>
          </div>
          {lock && (
            <button
              onClick={() => { store.setLock(null); setLock(null); }}
              className="glass rounded-full px-4 py-2 text-xs text-white/80 flex items-center gap-2 hover:scale-105 transition"
            >
              <Unlock className="w-3.5 h-3.5" /> Unlock device
            </button>
          )}
        </header>

        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gradient-luxury mb-6">
            Choose Your House
          </h1>
          <p className="text-white/60 text-lg">
            Step into the arena. Cast your vote for the leaders who will shape our school's next chapter.
          </p>
        </div>

        {/* House grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto w-full">
          {HOUSES.map((h, i) => (
            <button
              key={h.id}
              onClick={() => chooseHouse(h.id)}
              className={`house-card-${h.id} group relative glass rounded-3xl p-8 text-left transition-all duration-500 hover:-translate-y-3 hover:scale-[1.02] animate-fade-up cursor-pointer overflow-hidden`}
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
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 animate-float-y"
                  style={{
                    background: `linear-gradient(135deg, ${h.color}40, ${h.color}10)`,
                    boxShadow: `0 0 40px ${h.glow}, inset 0 1px 0 rgba(255,255,255,0.2)`,
                  }}
                >
                  <span className="text-4xl">
                    {h.id === "minotaur" && "🐂"}
                    {h.id === "kraken" && "🐙"}
                    {h.id === "thunderbird" && "🦅"}
                    {h.id === "dragon" && "🐉"}
                  </span>
                </div>
                <p className="text-xs uppercase tracking-widest text-white/40 mb-2">House</p>
                <h3 className="text-3xl font-bold mb-2" style={{ color: h.color }}>{h.name}</h3>
                <p className="text-white/50 text-sm">
                  Enter and cast your vote for {h.name} leaders.
                </p>
                <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-white/80 group-hover:text-white">
                  Vote now <span className="transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer / admin link */}
        <footer className="mt-auto pt-16 flex justify-center">
          <Link to="/admin" className="glass rounded-full px-5 py-2.5 text-xs text-white/60 hover:text-white flex items-center gap-2 hover:scale-105 transition">
            <Settings className="w-3.5 h-3.5" /> Admin Panel
          </Link>
        </footer>
      </div>

      {/* Lock confirmation modal */}
      {pendingHouse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-fade-up">
          <div className="glass-strong rounded-3xl p-8 max-w-md w-full text-center relative overflow-hidden">
            <div
              className="absolute -top-20 -left-20 w-60 h-60 rounded-full blur-3xl opacity-40"
              style={{ background: HOUSES.find((x) => x.id === pendingHouse)!.color }}
            />
            <div className="relative">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl glass flex items-center justify-center">
                <Lock className="w-6 h-6 text-white/80" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Lock this device?</h3>
              <p className="text-white/60 text-sm mb-6">
                Lock this computer to <span className="font-semibold" style={{ color: HOUSES.find((x) => x.id === pendingHouse)!.color }}>{HOUSES.find((x) => x.id === pendingHouse)!.name}</span> so the next students can vote here without re-selecting. (This setting is local to this device only.)
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => confirm(true)}
                  className="glass rounded-2xl py-3 px-5 font-medium text-white hover:scale-[1.02] transition flex items-center justify-center gap-2"
                  style={{ boxShadow: `0 0 30px ${HOUSES.find((x) => x.id === pendingHouse)!.glow}` }}
                >
                  <Lock className="w-4 h-4" /> Enable Lock
                </button>
                <button
                  onClick={() => confirm(false)}
                  className="rounded-2xl py-3 px-5 text-white/70 hover:text-white transition"
                >
                  Continue Without Lock
                </button>
                <button onClick={() => setPendingHouse(null)} className="text-xs text-white/40 hover:text-white/60 mt-2">Cancel</button>
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
