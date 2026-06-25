import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type House = "minotaur" | "kraken" | "thunderbird" | "dragon";
export type Role = "spl" | "aspl" | "captain" | "vice-captain";

export interface Candidate {
  id: string;
  name: string;
  role: Role;
  house: House | null; // null for SPL/ASPL (common)
  photo?: string;
  symbol?: string;
}

export interface VoteRecord {
  id: string;
  voterHouse: House;
  selections: Partial<Record<Role, string>>; // role -> candidateId
  ts: number;
}

export const HOUSES: { id: House; name: string; color: string; glow: string; hex: string }[] = [
  { id: "minotaur", name: "Minotaur", color: "#fbbf24", glow: "rgba(251,191,36,0.6)", hex: "#fbbf24" },
  { id: "kraken", name: "Kraken", color: "#3b82f6", glow: "rgba(59,130,246,0.6)", hex: "#3b82f6" },
  { id: "thunderbird", name: "Thunderbird", color: "#22c55e", glow: "rgba(34,197,94,0.6)", hex: "#22c55e" },
  { id: "dragon", name: "Dragon", color: "#f97316", glow: "rgba(249,115,22,0.6)", hex: "#f97316" },
];

export const ROLE_LABEL: Record<Role, string> = {
  spl: "School Pupil Leader",
  aspl: "Assistant School Pupil Leader",
  captain: "Captain",
  "vice-captain": "Vice Captain",
};

const CANDIDATES_KEY = "election.candidates";
const VOTES_KEY = "election.votes";
const LOCK_KEY = "election.deviceLock"; // local-only house lock
const HOUSE_SYMBOLS_KEY = "election.houseSymbols";
const SCHOOL_LOGO_KEY = "election.schoolLogo";
const SCHOOL_LOGO_SETTING_KEY = "school_logo";

export const SCHOOL_NAME = "DAWN SHIKSHALAYA PUBLIC SCHOOL";
export const SCHOOL_SUBTITLE = "HOUSE ELECTION 2026";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(key: string, val: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(val));
  window.dispatchEvent(new CustomEvent("election:change", { detail: { key } }));
}

export const store = {
  getCandidates: (): Candidate[] => read<Candidate[]>(CANDIDATES_KEY, []),
  setCandidates: (list: Candidate[]) => write(CANDIDATES_KEY, list),
  addCandidate: (c: Omit<Candidate, "id">) => {
    const list = store.getCandidates();
    list.push({ ...c, id: crypto.randomUUID() });
    store.setCandidates(list);
  },
  updateCandidate: (id: string, patch: Partial<Candidate>) => {
    store.setCandidates(store.getCandidates().map((c) => (c.id === id ? { ...c, ...patch } : c)));
  },
  deleteCandidate: (id: string) => {
    store.setCandidates(store.getCandidates().filter((c) => c.id !== id));
  },
  getVotes: (): VoteRecord[] => read<VoteRecord[]>(VOTES_KEY, []),
  addVote: (v: Omit<VoteRecord, "id" | "ts">) => {
    const list = store.getVotes();
    list.push({ ...v, id: crypto.randomUUID(), ts: Date.now() });
    write(VOTES_KEY, list);
  },
  resetVotes: () => write(VOTES_KEY, []),
  getLock: (): House | null => read<House | null>(LOCK_KEY, null),
  setLock: (h: House | null) => write(LOCK_KEY, h),
  getHouseSymbols: (): Partial<Record<House, string>> =>
    read<Partial<Record<House, string>>>(HOUSE_SYMBOLS_KEY, {}),
  setHouseSymbol: (h: House, dataUrl: string | null) => {
    const cur = store.getHouseSymbols();
    if (dataUrl) cur[h] = dataUrl;
    else delete cur[h];
    write(HOUSE_SYMBOLS_KEY, cur);
  },
  getSchoolLogo: (): string | null => read<string | null>(SCHOOL_LOGO_KEY, null),
  setSchoolLogo: (dataUrl: string | null) => {
    // Optimistic local cache so UI updates instantly on the uploading device.
    write(SCHOOL_LOGO_KEY, dataUrl);
    // Persist globally so every device sees the same logo.
    void (async () => {
      try {
        if (dataUrl === null) {
          await supabase.from("app_settings").delete().eq("key", SCHOOL_LOGO_SETTING_KEY);
        } else {
          await supabase
            .from("app_settings")
            .upsert({ key: SCHOOL_LOGO_SETTING_KEY, value: dataUrl, updated_at: new Date().toISOString() });
        }
      } catch (e) {
        console.error("Failed to sync school logo to cloud", e);
      }
    })();
  },
  /**
   * Pull the school logo from the shared backend and refresh the local cache.
   * Called on app mount + on realtime change so every device stays in sync.
   */
  refreshSchoolLogo: async (): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", SCHOOL_LOGO_SETTING_KEY)
        .maybeSingle();
      if (error) throw error;
      const remote = (data?.value as string | undefined) ?? null;
      const local = read<string | null>(SCHOOL_LOGO_KEY, null);
      if (remote !== local) write(SCHOOL_LOGO_KEY, remote);
    } catch (e) {
      console.error("Failed to load school logo from cloud", e);
    }
  },
};

export function useStore<T>(selector: () => T): T {
  const [val, setVal] = useState<T>(selector);
  useEffect(() => {
    const update = () => setVal(selector());
    update();
    window.addEventListener("election:change", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("election:change", update);
      window.removeEventListener("storage", update);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return val;
}

export function seedIfEmpty() {
  if (store.getCandidates().length > 0) return;
  const seed: Omit<Candidate, "id">[] = [
    { name: "Aarav Mehta", role: "spl", house: null },
    { name: "Priya Sharma", role: "spl", house: null },
    { name: "Rohan Iyer", role: "aspl", house: null },
    { name: "Ananya Verma", role: "aspl", house: null },
    ...HOUSES.flatMap((h) => [
      { name: `${h.name} Cap A`, role: "captain" as Role, house: h.id },
      { name: `${h.name} Cap B`, role: "captain" as Role, house: h.id },
      { name: `${h.name} VC A`, role: "vice-captain" as Role, house: h.id },
      { name: `${h.name} VC B`, role: "vice-captain" as Role, house: h.id },
    ]),
  ];
  store.setCandidates(seed.map((c) => ({ ...c, id: crypto.randomUUID() })));
}