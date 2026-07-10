import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AuroraBg, Particles } from "@/components/AuroraBg";
import {
  HOUSES,
  ROLE_LABEL,
  store,
  useStore,
  type Candidate,
  type House,
  type Role,
} from "@/lib/election";
import { Pencil, Trash2, Plus, Download, RotateCcw, Home, X, Lock, Unlock, Trash } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import { ImageUpload } from "@/components/ImageUpload";
import { SchoolLogoMark } from "@/components/SchoolBrand";
import { SCHOOL_NAME } from "@/lib/election";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — House Elections" }] }),
  component: AdminPage,
});

function AdminPage() {
  const candidates = useStore(() => store.getCandidates());
  const votes = useStore(() => store.getVotes());
  const [activeTab, setActiveTab] = useState<"dashboard" | "candidates" | "houses" | "branding" | "results" | "device">("dashboard");

  const totals = useMemo(() => {
    const byHouse: Record<string, number> = {};
    HOUSES.forEach((h) => (byHouse[h.id] = 0));
    votes.forEach((v) => { byHouse[v.voterHouse] = (byHouse[v.voterHouse] || 0) + 1; });

    const byCandidate: Record<string, number> = {};
    votes.forEach((v) => {
      Object.values(v.selections).forEach((cid) => {
        if (cid) byCandidate[cid] = (byCandidate[cid] || 0) + 1;
      });
    });

    return { byHouse, byCandidate, total: votes.length };
  }, [votes]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <AuroraBg />
      <Particles count={20} />
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <header className="flex items-center justify-between mb-8 animate-fade-up">
          <div>
            <p className="text-xs uppercase tracking-widest text-white/40">Election Control</p>
            <h1 className="text-3xl font-bold text-gradient-luxury">Admin Panel</h1>
          </div>
          <Link to="/" className="glass rounded-full px-4 py-2 text-xs text-white/70 hover:text-white flex items-center gap-2 transition hover:scale-105">
            <Home className="w-3.5 h-3.5" /> Home
          </Link>
        </header>

        <nav className="glass rounded-full p-1.5 inline-flex flex-wrap gap-1 mb-8">
          {(["dashboard", "candidates", "houses", "branding", "results", "device"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === t ? "bg-white/15 text-white" : "text-white/50 hover:text-white"
              }`}
            >
              {t === "houses" ? "House Management" : t === "device" ? "Device Settings" : t === "branding" ? "School Branding" : t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </nav>

        {activeTab === "dashboard" && <Dashboard candidates={candidates} totals={totals} />}
        {activeTab === "candidates" && <CandidatesTab candidates={candidates} />}
        {activeTab === "houses" && <HousesTab />}
        {activeTab === "branding" && <BrandingTab />}
        {activeTab === "results" && <ResultsTab candidates={candidates} totals={totals} />}
        {activeTab === "device" && <DeviceTab />}
      </div>
    </div>
  );
}

function Dashboard({ candidates, totals }: { candidates: Candidate[]; totals: { byHouse: Record<string, number>; total: number } }) {
  const data = HOUSES.map((h) => ({ name: h.name, votes: totals.byHouse[h.id] || 0, color: h.color }));
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-fade-up">
      <Stat label="Total Votes" value={totals.total} accent="#a78bfa" />
      <Stat label="Candidates" value={candidates.length} accent="#fbbf24" />
      <Stat label="Houses" value={HOUSES.length} accent="#22c55e" />

      <div className="md:col-span-2 glass rounded-3xl p-6">
        <h3 className="text-white font-semibold mb-4">Votes by House</h3>
        <div className="h-72">
          <ResponsiveContainer>
            <BarChart data={data}>
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip contentStyle={{ background: "rgba(20,20,40,0.9)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 12, color: "white" }} />
              <Bar dataKey="votes" radius={[12, 12, 0, 0]}>
                {data.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass rounded-3xl p-6">
        <h3 className="text-white font-semibold mb-4">House Share</h3>
        <div className="h-72">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={data} dataKey="votes" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90}>
                {data.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Legend wrapperStyle={{ color: "white", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function BrandingTab() {
  const logo = useStore(() => store.getSchoolLogo());
  return (
    <div className="animate-fade-up max-w-3xl">
      <div className="glass rounded-3xl p-6 mb-6">
        <h3 className="text-white font-semibold text-lg mb-1">School Branding</h3>
        <p className="text-white/50 text-sm">
          Upload the official school logo. It is saved to the shared cloud and
          appears automatically on every device — home page, voting headers,
          and results.
        </p>
      </div>
      <div
        className="glass-strong rounded-3xl p-8 relative overflow-hidden"
        style={{
          boxShadow:
            "0 30px 80px -20px rgba(253,224,71,0.30), inset 0 1px 0 rgba(255,255,255,0.15)",
        }}
      >
        <div
          className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-40 pointer-events-none"
          style={{ background: "#fde68a" }}
        />
        <div className="relative grid sm:grid-cols-[auto,1fr] gap-8 items-center">
          <SchoolLogoMark url={logo} size={140} />
          <div className="space-y-5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 mb-1">School</p>
              <p className="text-2xl font-bold text-shine">{SCHOOL_NAME}</p>
            </div>
            <ImageUpload
              value={logo || undefined}
              onChange={(v) => store.setSchoolLogo(v)}
              label="Upload school logo"
              shape="circle"
              accept="image/png,image/svg+xml,image/webp,image/jpeg"
              maxSize={1024}
              preserveTransparency
            />
            <p className="text-xs text-white/40 leading-relaxed">
              Use a square PNG with a transparent background for best results.
              Synced globally — every device updates automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="glass rounded-3xl p-6 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-30" style={{ background: accent }} />
      <p className="text-xs uppercase tracking-widest text-white/40 mb-1">{label}</p>
      <p className="text-5xl font-bold text-white">{value}</p>
    </div>
  );
}

function CandidatesTab({ candidates }: { candidates: Candidate[] }) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");
  const [houseFilter, setHouseFilter] = useState<House | "all" | "none">("all");
  const [editing, setEditing] = useState<Candidate | null>(null);
  const [adding, setAdding] = useState(false);

  const filtered = candidates.filter((c) => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (roleFilter !== "all" && c.role !== roleFilter) return false;
    if (houseFilter === "none" && c.house !== null) return false;
    if (houseFilter !== "all" && houseFilter !== "none" && c.house !== houseFilter) return false;
    return true;
  });

  return (
    <div className="animate-fade-up">
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          placeholder="Search candidates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="glass-input rounded-full px-5 py-2.5 text-sm flex-1 min-w-[200px]"
        />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as any)} className="glass-input rounded-full px-4 py-2.5 text-sm">
          <option value="all">All Roles</option>
          {Object.entries(ROLE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={houseFilter} onChange={(e) => setHouseFilter(e.target.value as any)} className="glass-input rounded-full px-4 py-2.5 text-sm">
          <option value="all">All Houses</option>
          <option value="none">Common (SPL/ASPL)</option>
          {HOUSES.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
        </select>
        <button onClick={() => setAdding(true)} className="glass rounded-full px-5 py-2.5 text-sm text-white flex items-center gap-2 hover:scale-105 transition" style={{ boxShadow: "0 0 30px rgba(167,139,250,0.4)" }}>
          <Plus className="w-4 h-4" /> Add Candidate
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => {
          const houseInfo = c.house ? HOUSES.find((h) => h.id === c.house) : null;
          const accent = houseInfo?.color || "#a78bfa";
          return (
            <div key={c.id} className="glass rounded-2xl p-5 flex items-center gap-4 hover:-translate-y-1 transition">
              <div
                className="w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center text-xl font-bold flex-shrink-0"
                style={{ background: `${accent}30`, color: accent }}
              >
                {c.photo ? <img src={c.photo} alt="" className="w-full h-full object-cover" /> : c.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate">{c.name}</p>
                <p className="text-xs text-white/50">{ROLE_LABEL[c.role]}{houseInfo ? ` · ${houseInfo.name}` : " · Common"}</p>
              </div>
              {c.symbol && (
                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-white/5 flex items-center justify-center">
                  {c.symbol.startsWith("data:") || c.symbol.startsWith("http")
                    ? <img src={c.symbol} alt="" className="w-full h-full object-contain" />
                    : <span className="text-2xl">{c.symbol}</span>}
                </div>
              )}
              <div className="flex gap-1">
                <button onClick={() => setEditing(c)} className="glass w-9 h-9 rounded-full flex items-center justify-center text-white/70 hover:text-white">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => confirm("Delete candidate?") && store.deleteCandidate(c.id)} className="glass w-9 h-9 rounded-full flex items-center justify-center text-red-300 hover:text-red-200">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full glass rounded-2xl p-10 text-center text-white/40">No candidates match.</div>
        )}
      </div>

      {(adding || editing) && (
        <CandidateForm
          initial={editing}
          onClose={() => { setAdding(false); setEditing(null); }}
        />
      )}
    </div>
  );
}

function CandidateForm({ initial, onClose }: { initial: Candidate | null; onClose: () => void }) {
  const [name, setName] = useState(initial?.name || "");
  const [role, setRole] = useState<Role>(initial?.role || "spl");
  const [house, setHouse] = useState<House | "">(initial?.house || "");
  const [photo, setPhoto] = useState(initial?.photo || "");
  const [symbol, setSymbol] = useState(initial?.symbol || "");

  const requiresHouse = role === "captain" || role === "vice-captain";

  function save() {
    if (!name.trim()) return;
    const data = {
      name: name.trim(),
      role,
      house: requiresHouse ? (house as House) || null : null,
      photo: photo || undefined,
      symbol: symbol || undefined,
    };
    if (requiresHouse && !data.house) return;
    if (initial) store.updateCandidate(initial.id, data);
    else store.addCandidate(data);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
      <div className="glass-strong rounded-3xl p-8 max-w-md w-full relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white"><X className="w-5 h-5" /></button>
        <h3 className="text-2xl font-bold text-white mb-6">{initial ? "Edit" : "Add"} Candidate</h3>
        <div className="space-y-4">
          <Field label="Name"><input value={name} onChange={(e) => setName(e.target.value)} className="glass-input rounded-xl px-4 py-2.5 w-full text-sm" /></Field>
          <Field label="Role">
            <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="glass-input rounded-xl px-4 py-2.5 w-full text-sm">
              {Object.entries(ROLE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </Field>
          {requiresHouse && (
            <Field label="House">
              <select value={house} onChange={(e) => setHouse(e.target.value as House)} className="glass-input rounded-xl px-4 py-2.5 w-full text-sm">
                <option value="">Select house...</option>
                {HOUSES.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </Field>
          )}
          <Field label="Upload Candidate Photo">
            <ImageUpload
              value={photo}
              onChange={(v) => setPhoto(v || "")}
              label="Upload photo"
              shape="circle"
              maxSize={512}
            />
          </Field>
          <Field label="Upload Symbol Image (PNG with transparent background)">
            <ImageUpload
              value={symbol && (symbol.startsWith("data:") || symbol.startsWith("http")) ? symbol : ""}
              onChange={(v) => setSymbol(v || "")}
              label="Upload symbol"
              shape="square"
              accept="image/png,image/svg+xml,image/webp"
              maxSize={400}
              preserveTransparency
            />
          </Field>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={save} className="glass-strong flex-1 rounded-xl py-3 text-white font-medium hover:scale-[1.02] transition" style={{ boxShadow: "0 0 30px rgba(167,139,250,0.4)" }}>Save</button>
          <button onClick={onClose} className="rounded-xl px-5 text-white/60 hover:text-white">Cancel</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-widest text-white/50 mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}

function ResultsTab({ candidates, totals }: { candidates: Candidate[]; totals: { byCandidate: Record<string, number>; byHouse: Record<string, number>; total: number } }) {
  function exportCSV() {
    const rows = [["Name", "Role", "House", "Votes"]];
    candidates.forEach((c) => {
      rows.push([c.name, ROLE_LABEL[c.role], c.house ? HOUSES.find((h) => h.id === c.house)!.name : "Common", String(totals.byCandidate[c.id] || 0)]);
    });
    const csv = rows.map((r) => r.map((x) => `"${x}"`).join(",")).join("\n");
    download("election-results.csv", "text/csv", csv);
  }
  function exportJSON() {
    download("election-results.json", "application/json", JSON.stringify({ candidates, votes: store.getVotes(), summary: totals }, null, 2));
  }
  function exportPDF() {
    const html = `<html><head><title>Election Results</title><style>body{font-family:sans-serif;padding:40px}h1{color:#333}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{padding:10px;border:1px solid #ccc;text-align:left}th{background:#f0f0f0}</style></head><body><h1>Election Results</h1><p>Total Votes: ${totals.total}</p><table><tr><th>Name</th><th>Role</th><th>House</th><th>Votes</th></tr>${candidates.map((c) => `<tr><td>${c.name}</td><td>${ROLE_LABEL[c.role]}</td><td>${c.house ? HOUSES.find((h) => h.id === c.house)!.name : "Common"}</td><td>${totals.byCandidate[c.id] || 0}</td></tr>`).join("")}</table><script>window.print()</script></body></html>`;
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); }
  }
  function download(filename: string, type: string, content: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  function reset() {
    if (confirm("Are you sure? This will erase all vote data.")) store.resetVotes();
  }

  const commonGrouped = (["spl", "aspl"] as Role[]).map((role) => ({
    role,
    items: candidates
      .filter((c) => c.role === role)
      .map((c) => ({ ...c, votes: totals.byCandidate[c.id] || 0 }))
      .sort((a, b) => b.votes - a.votes),
  }));

  const houseGrouped = HOUSES.map((h) => {
    const roles = (["captain", "vice-captain"] as Role[]).map((role) => {
      const items = candidates
        .filter((c) => c.role === role && c.house === h.id)
        .map((c) => ({ ...c, votes: totals.byCandidate[c.id] || 0 }))
        .sort((a, b) => b.votes - a.votes);
      return { role, items, leader: items[0] };
    });
    return { house: h, roles };
  });

  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex flex-wrap gap-3">
        <button onClick={exportCSV} className="glass rounded-full px-5 py-2.5 text-sm text-white flex items-center gap-2 hover:scale-105 transition"><Download className="w-4 h-4" /> Export CSV</button>
        <button onClick={exportJSON} className="glass rounded-full px-5 py-2.5 text-sm text-white flex items-center gap-2 hover:scale-105 transition"><Download className="w-4 h-4" /> Export JSON</button>
        <button onClick={exportPDF} className="glass rounded-full px-5 py-2.5 text-sm text-white flex items-center gap-2 hover:scale-105 transition"><Download className="w-4 h-4" /> Export PDF</button>
        <button onClick={reset} className="glass rounded-full px-5 py-2.5 text-sm text-red-200 flex items-center gap-2 hover:scale-105 transition ml-auto" style={{ boxShadow: "0 0 30px rgba(248,113,113,0.3)" }}>
          <RotateCcw className="w-4 h-4" /> Reset Election
        </button>
      </div>

      {/* House-wise sections with leading candidate highlighted */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {houseGrouped.map(({ house: h, roles }) => (
          <div
            key={h.id}
            className="glass rounded-3xl p-6 relative overflow-hidden"
            style={{ boxShadow: `0 0 40px ${h.color}25, inset 0 0 0 1px ${h.color}30` }}
          >
            <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl opacity-30" style={{ background: h.color }} />
            <div className="relative">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-white/50">House</p>
                  <h3 className="text-2xl font-bold" style={{ color: h.color, textShadow: `0 0 20px ${h.glow}` }}>{h.name}</h3>
                </div>
                <span className="text-xs px-3 py-1 rounded-full" style={{ background: `${h.color}20`, color: h.color, border: `1px solid ${h.color}55` }}>
                  {roles.reduce((s, r) => s + r.items.reduce((a, b) => a + b.votes, 0), 0)} votes
                </span>
              </div>

              {roles.map(({ role, items, leader }) => {
                const totalRoleVotes = items.reduce((a, b) => a + b.votes, 0);
                return (
                  <div key={role} className="mb-5 last:mb-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs uppercase tracking-widest text-white/60">{ROLE_LABEL[role]}</p>
                      {leader && leader.votes > 0 && (
                        <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: `${h.color}30`, color: h.color, border: `1px solid ${h.color}60` }}>
                          Leading
                        </span>
                      )}
                    </div>
                    {leader ? (
                      <div
                        className="rounded-2xl px-4 py-3 mb-2 flex items-center gap-3"
                        style={{
                          background: `linear-gradient(135deg, ${h.color}25, ${h.color}08)`,
                          border: `1px solid ${h.color}55`,
                          boxShadow: `0 0 24px ${h.color}30`,
                        }}
                      >
                        {leader.photo ? (
                          <img src={leader.photo} alt={leader.name} className="w-12 h-12 rounded-full object-cover" style={{ border: `2px solid ${h.color}` }} />
                        ) : (
                          <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white/80" style={{ background: `${h.color}30`, border: `2px solid ${h.color}` }}>
                            {leader.name.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold truncate">{leader.name}</p>
                          <p className="text-xs text-white/60">{leader.votes} vote{leader.votes === 1 ? "" : "s"} {totalRoleVotes > 0 && `• ${Math.round((leader.votes / totalRoleVotes) * 100)}%`}</p>
                        </div>
                        <span className="text-2xl font-bold tabular-nums" style={{ color: h.color }}>{leader.votes}</span>
                      </div>
                    ) : (
                      <p className="text-white/40 text-sm py-2">No candidates.</p>
                    )}
                    {items.slice(1).map((c) => {
                      const pct = totalRoleVotes > 0 ? (c.votes / totalRoleVotes) * 100 : 0;
                      return (
                        <div key={c.id} className="relative rounded-xl px-3 py-2 overflow-hidden mt-1" style={{ background: "rgba(255,255,255,0.03)" }}>
                          <div className="absolute inset-y-0 left-0" style={{ width: `${pct}%`, background: `linear-gradient(to right, ${h.color}20, transparent)` }} />
                          <div className="relative flex items-center justify-between">
                            <span className="text-white/80 text-sm truncate">{c.name}</span>
                            <span className="text-white/90 text-sm font-medium tabular-nums">{c.votes}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Common school-wide roles */}
      {commonGrouped.map(({ role, items }) => (
        <div key={role} className="glass rounded-3xl p-6">
          <h3 className="text-white font-semibold mb-4">{ROLE_LABEL[role]}</h3>
          <div className="space-y-2">
            {items.length === 0 && <p className="text-white/40 text-sm">No candidates.</p>}
            {items.map((c, i) => {
              const max = Math.max(...items.map((x) => x.votes), 1);
              const pct = (c.votes / max) * 100;
              const accent = c.house ? HOUSES.find((h) => h.id === c.house)!.color : role === "spl" ? "#fbbf24" : "#a78bfa";
              return (
                <div key={c.id} className="relative glass rounded-xl px-4 py-3 overflow-hidden">
                  <div className="absolute inset-y-0 left-0 transition-all" style={{ width: `${pct}%`, background: `linear-gradient(to right, ${accent}30, transparent)` }} />
                  <div className="relative flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-white/40 text-xs w-5">{i + 1}</span>
                      <span className="text-white font-medium">{c.name}</span>
                      {c.house && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${accent}20`, color: accent }}>{HOUSES.find((h) => h.id === c.house)!.name}</span>}
                    </div>
                    <span className="text-white font-bold tabular-nums">{c.votes}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
function HousesTab() {
  const symbols = useStore(() => store.getHouseSymbols());
  return (
    <div className="animate-fade-up">
      <div className="glass rounded-3xl p-6 mb-6">
        <h3 className="text-white font-semibold text-lg mb-1">House Symbol Management</h3>
        <p className="text-white/50 text-sm">Upload a symbol/logo for each house. They appear on the home page house cards with a soft glow.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {HOUSES.map((h) => {
          const current = symbols[h.id];
          return (
            <div key={h.id} className="glass rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-30" style={{ background: h.color }} />
              <div className="relative">
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${h.color}40, ${h.color}10)`,
                      boxShadow: `0 0 24px ${h.glow}`,
                    }}
                  >
                    {current ? (
                      <img src={current} alt={h.name} className="w-full h-full object-contain p-1" />
                    ) : (
                      <span className="text-2xl">
                        {h.id === "minotaur" && "🐂"}
                        {h.id === "kraken" && "🐙"}
                        {h.id === "thunderbird" && "🦅"}
                        {h.id === "dragon" && "🐉"}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-white/40">House</p>
                    <h4 className="text-xl font-bold" style={{ color: h.color }}>{h.name}</h4>
                  </div>
                </div>
                <ImageUpload
                  value={current}
                  onChange={(v) => store.setHouseSymbol(h.id, v)}
                  label="Upload symbol"
                  shape="square"
                  accept="image/png,image/svg+xml,image/webp"
                  maxSize={400}
                  preserveTransparency
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DeviceTab() {
  const lock = useStore(() => store.getLock());
  const navigate = useNavigate();
  const info = lock ? HOUSES.find((h) => h.id === lock)! : null;

  return (
    <div className="animate-fade-up max-w-2xl">
      <div
        className="glass-strong rounded-3xl p-8 relative overflow-hidden"
        style={{
          boxShadow: info
            ? `0 30px 80px -20px ${info.glow}, inset 0 1px 0 rgba(255,255,255,0.12)`
            : `0 30px 80px -20px rgba(167,139,250,0.3), inset 0 1px 0 rgba(255,255,255,0.12)`,
          border: info ? `1px solid ${info.color}33` : "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div
          className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-40 pointer-events-none"
          style={{ background: info?.color ?? "#a78bfa" }}
        />

        <p className="text-xs uppercase tracking-[0.4em] text-white/40 mb-2">Device Settings</p>
        <h2 className="text-3xl font-bold text-white mb-6">House Lock</h2>

        <div className="glass rounded-2xl p-6 mb-6 flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background: info ? `linear-gradient(135deg, ${info.color}40, ${info.color}10)` : "rgba(255,255,255,0.05)",
              boxShadow: info ? `0 0 30px ${info.glow}` : undefined,
            }}
          >
            {info ? <Lock className="w-6 h-6" style={{ color: info.color }} /> : <Unlock className="w-6 h-6 text-white/40" />}
          </div>
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-widest text-white/40">Current Status</p>
            {info ? (
              <p className="text-xl font-bold" style={{ color: info.color }}>
                Locked · {info.name} House
              </p>
            ) : (
              <p className="text-xl font-bold text-white/70">Unlocked</p>
            )}
          </div>
        </div>

        <p className="text-xs text-white/40 mb-5 leading-relaxed">
          These actions only affect <span className="text-white/70 font-semibold">this device</span>. Locks are stored
          locally in this browser and never synchronized with other computers.
        </p>

        <div className="grid sm:grid-cols-2 gap-3">
          {HOUSES.map((h) => (
            <button
              key={h.id}
              onClick={() => { store.setLock(h.id); }}
              className="glass rounded-2xl px-4 py-3 text-sm font-medium text-white flex items-center gap-3 hover:scale-[1.02] transition"
              style={{
                border: lock === h.id ? `1px solid ${h.color}` : `1px solid ${h.color}22`,
                boxShadow: lock === h.id ? `0 0 30px ${h.glow}` : undefined,
              }}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: h.color, boxShadow: `0 0 10px ${h.glow}` }} />
              Lock to {h.name}
              {lock === h.id && <Lock className="w-3.5 h-3.5 ml-auto" style={{ color: h.color }} />}
            </button>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => { store.setLock(null); }}
            disabled={!lock}
            className="glass rounded-2xl px-5 py-3 text-sm font-medium text-white flex items-center gap-2 hover:scale-[1.02] transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Unlock className="w-4 h-4" /> Unlock Device
          </button>
          <button
            onClick={() => {
              if (!confirm("Clear all local lock data on this device?")) return;
              store.setLock(null);
              try { localStorage.removeItem("election.deviceLock"); } catch {}
            }}
            className="glass rounded-2xl px-5 py-3 text-sm font-medium text-red-300 flex items-center gap-2 hover:scale-[1.02] transition"
            style={{ border: "1px solid rgba(248,113,113,0.25)" }}
          >
            <Trash className="w-4 h-4" /> Clear Lock Data
          </button>
          {lock && (
            <button
              onClick={() => navigate({ to: "/vote/$house", params: { house: lock } })}
              className="glass rounded-2xl px-5 py-3 text-sm font-medium text-white flex items-center gap-2 hover:scale-[1.02] transition ml-auto"
              style={info ? { boxShadow: `0 0 30px ${info.glow}` } : undefined}
            >
              Go to {info?.name} Voting →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
