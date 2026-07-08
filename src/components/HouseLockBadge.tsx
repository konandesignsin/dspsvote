import { useNavigate } from "@tanstack/react-router";
import { Lock, Unlock } from "lucide-react";
import { useState } from "react";
import { HOUSES, store, useStore } from "@/lib/election";

export function HouseLockBadge() {
  const lock = useStore(() => store.getLock());
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  if (!lock) return null;
  const info = HOUSES.find((h) => h.id === lock)!;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed top-5 right-5 z-40 glass-strong rounded-full pl-2 pr-4 py-2 flex items-center gap-2 animate-float-y animate-pulse-glow"
        style={{
          ["--glow-color" as any]: info.glow,
          border: `1px solid ${info.color}66`,
          boxShadow: `0 0 30px ${info.glow}`,
        }}
      >
        <span className="relative flex items-center justify-center w-7 h-7 rounded-full" style={{ background: info.color }}>
          <Lock className="w-3.5 h-3.5 text-black" strokeWidth={3} />
          <span className="absolute inset-0 rounded-full animate-ping" style={{ background: info.color, opacity: 0.4 }} />
        </span>
        <span className="text-xs font-bold tracking-widest uppercase" style={{ color: info.color }}>
          {info.name} Mode
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-xl" onClick={() => setOpen(false)}>
          <div className="glass-strong rounded-3xl p-8 max-w-sm w-full text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl glass flex items-center justify-center">
              <Unlock className="w-6 h-6" style={{ color: info.color }} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Unlock this device?</h3>
            <p className="text-white/60 text-sm mb-6">
              The lock to <span className="font-semibold" style={{ color: info.color }}>{info.name}</span> will be removed and students can pick any house here.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => { store.setLock(null); setOpen(false); navigate({ to: "/" }); }}
                className="btn-premium glass rounded-2xl py-3 px-5 font-medium text-white"
                style={{ boxShadow: `0 0 30px ${info.glow}` }}
              >
                Unlock Device
              </button>
              <button onClick={() => setOpen(false)} className="text-xs text-white/40 hover:text-white/60">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}