import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type House = "minotaur" | "kraken" | "thunderbird" | "dragon";
export type Role = "spl" | "aspl" | "sports-sec" | "cultural-sec" | "captain" | "vice-captain";

export interface Candidate {
  id: string;
  name: string;
  role: Role;
  house: House | null; // null for SPL/ASPL (common)
  photo?: string;
  symbol?: string;
  badge?: string;
}

export interface VoteRecord {
  id: string;
  voterHouse: House;
  selections: Partial<Record<Role, string>>; // role -> candidateId
  ts: number;
}

// House palette — balanced so all four read as equally "premium" in intensity.
// Hues preserved; only saturation/brightness fine-tuned for consistency.
export const HOUSES: { id: House; name: string; color: string; glow: string; hex: string }[] = [
  { id: "minotaur", name: "Minotaur", color: "#fcd34d", glow: "rgba(252,211,77,0.6)", hex: "#fcd34d" },
  { id: "kraken", name: "Kraken", color: "#60a5fa", glow: "rgba(96,165,250,0.6)", hex: "#60a5fa" },
  { id: "thunderbird", name: "Thunderbird", color: "#4ade80", glow: "rgba(74,222,128,0.6)", hex: "#4ade80" },
  { id: "dragon", name: "Dragon", color: "#fb923c", glow: "rgba(251,146,60,0.6)", hex: "#fb923c" },
];

export const ROLE_LABEL: Record<Role, string> = {
  spl: "School Pupil Leader",
  aspl: "Assistant School Pupil Leader",
  "sports-sec": "Sports Secretary",
  "cultural-sec": "Cultural Secretary",
  captain: "Captain",
  "vice-captain": "Vice Captain",
};

const CANDIDATES_KEY = "election.candidates";
const VOTES_KEY = "election.votes";
const LOCK_KEY = "election.deviceLock"; // local-only house lock
const HOUSE_SYMBOLS_KEY = "election.houseSymbols";
const SCHOOL_LOGO_KEY = "election.schoolLogo";
const SCHOOL_LOGO_SETTING_KEY = "school_logo";
const MIGRATED_KEY = "election.migratedToCloud";
const SITE_PASSWORD_KEY = "site_password";
const ADMIN_PASSWORD_KEY = "admin_password";
const ASPL_ORDER_SETTING_KEY = "aspl_order";
const DEFAULT_SITE_PASSWORD = "dawn2026";
const DEFAULT_ADMIN_PASSWORD = "dawn2026";

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

// ---------------------------------------------------------------------------
// Cloud-synced cache for candidates + votes
// ---------------------------------------------------------------------------

let candidatesCache: Candidate[] = [];
let votesCache: VoteRecord[] = [];
let asplOrderCache: string[] = [];
let cacheHydrated = false;

function emit() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("election:change", { detail: { key: "cloud" } }));
}

type CandidateRow = {
  id: string;
  name: string;
  role: string;
  house: string | null;
  photo: string | null;
  symbol: string | null;
  badge: string | null;
};
type VoteRow = {
  id: string;
  voter_house: string;
  selections: unknown;
  ts: number | string;
};

function rowToCandidate(r: CandidateRow): Candidate {
  return {
    id: r.id,
    name: r.name,
    role: r.role as Role,
    house: (r.house as House | null) ?? null,
    photo: r.photo ?? undefined,
    symbol: r.symbol ?? undefined,
    badge: r.badge ?? undefined,
  };
}
function rowToVote(r: VoteRow): VoteRecord {
  return {
    id: r.id,
    voterHouse: r.voter_house as House,
    selections: (r.selections as Partial<Record<Role, string>>) ?? {},
    ts: typeof r.ts === "string" ? Number(r.ts) : r.ts,
  };
}
function candidateToInsert(c: Candidate) {
  return {
    id: c.id,
    name: c.name,
    role: c.role,
    house: c.house,
    photo: c.photo ?? null,
    symbol: c.symbol ?? null,
    badge: c.badge ?? null,
  };
}

async function fetchCandidates(): Promise<Candidate[]> {
  const { data, error } = await (supabase.from("candidates" as any).select("*") as any);
  if (error) { console.error("fetchCandidates", error); return candidatesCache; }
  return (data as CandidateRow[]).map(rowToCandidate);
}
async function fetchVotes(): Promise<VoteRecord[]> {
  const { data, error } = await (supabase.from("votes" as any).select("*") as any);
  if (error) { console.error("fetchVotes", error); return votesCache; }
  return (data as VoteRow[]).map(rowToVote);
}

let realtimeSetup = false;
function setupRealtime() {
  if (realtimeSetup || typeof window === "undefined") return;
  realtimeSetup = true;
  supabase
    .channel("election_sync")
    .on("postgres_changes", { event: "*", schema: "public", table: "candidates" }, async () => {
      candidatesCache = await fetchCandidates();
      emit();
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "votes" }, async () => {
      votesCache = await fetchVotes();
      emit();
    })
    .subscribe();
}

export const store = {
  getCandidates: (): Candidate[] => candidatesCache,
  setCandidates: (_list: Candidate[]) => {
    // no-op kept for backwards compatibility (mutations should use add/update/delete)
  },
  addCandidate: (c: Omit<Candidate, "id">) => {
    const newCandidate: Candidate = { ...c, id: crypto.randomUUID() };
    candidatesCache = [...candidatesCache, newCandidate];
    emit();
    void (async () => {
      const { error } = await (supabase.from("candidates" as any).insert(candidateToInsert(newCandidate)) as any);
      if (error) {
        console.error("addCandidate", error);
        candidatesCache = await fetchCandidates();
        emit();
      }
    })();
  },
  updateCandidate: (id: string, patch: Partial<Candidate>) => {
    candidatesCache = candidatesCache.map((c) => (c.id === id ? { ...c, ...patch } : c));
    emit();
    const updated = candidatesCache.find((c) => c.id === id);
    if (!updated) return;
    void (async () => {
      const { error } = await (supabase
        .from("candidates" as any)
        .update(candidateToInsert(updated))
        .eq("id", id) as any);
      if (error) {
        console.error("updateCandidate", error);
        candidatesCache = await fetchCandidates();
        emit();
      }
    })();
  },
  deleteCandidate: (id: string) => {
    candidatesCache = candidatesCache.filter((c) => c.id !== id);
    emit();
    void (async () => {
      const { error } = await (supabase.from("candidates" as any).delete().eq("id", id) as any);
      if (error) {
        console.error("deleteCandidate", error);
        candidatesCache = await fetchCandidates();
        emit();
      }
    })();
  },
  getVotes: (): VoteRecord[] => votesCache,
  getAsplOrder: (): string[] => asplOrderCache,
  setAsplOrder: (ids: string[]) => {
    asplOrderCache = [...ids];
    emit();
    void (async () => {
      try {
        await upsertSetting(ASPL_ORDER_SETTING_KEY, JSON.stringify(ids));
      } catch (e) {
        console.error("setAsplOrder failed", e);
      }
    })();
  },
  refreshAsplOrder: async (): Promise<void> => {
    try {
      const raw = await fetchSetting(ASPL_ORDER_SETTING_KEY, "");
      if (!raw) { asplOrderCache = []; emit(); return; }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        asplOrderCache = parsed.filter((x) => typeof x === "string");
        emit();
      }
    } catch (e) {
      console.error("refreshAsplOrder failed", e);
    }
  },
  addVote: (v: Omit<VoteRecord, "id" | "ts">) => {
    const record: VoteRecord = { ...v, id: crypto.randomUUID(), ts: Date.now() };
    votesCache = [...votesCache, record];
    emit();
    void (async () => {
      const { error } = await (supabase.from("votes" as any).insert({
        id: record.id,
        voter_house: record.voterHouse,
        selections: record.selections,
        ts: record.ts,
      }) as any);
      if (error) {
        console.error("addVote", error);
        votesCache = await fetchVotes();
        emit();
      }
    })();
  },
  resetVotes: () => {
    votesCache = [];
    emit();
    void (async () => {
      const { error } = await (supabase.from("votes" as any).delete().neq("id", "00000000-0000-0000-0000-000000000000") as any);
      if (error) {
        console.error("resetVotes", error);
        votesCache = await fetchVotes();
        emit();
      }
    })();
  },
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
  /**
   * Password management — stored as plaintext in app_settings (matches the
   * app's existing kiosk-style, no-auth security model). Async by design so
   * every device reads the current value on demand.
   */
  getSitePassword: async (): Promise<string> => {
    return fetchSetting(SITE_PASSWORD_KEY, DEFAULT_SITE_PASSWORD);
  },
  getAdminPassword: async (): Promise<string> => {
    return fetchSetting(ADMIN_PASSWORD_KEY, DEFAULT_ADMIN_PASSWORD);
  },
  setSitePassword: async (next: string): Promise<void> => {
    await upsertSetting(SITE_PASSWORD_KEY, next);
  },
  setAdminPassword: async (next: string): Promise<void> => {
    await upsertSetting(ADMIN_PASSWORD_KEY, next);
  },
};

async function fetchSetting(key: string, fallback: string): Promise<string> {
  try {
    const { data, error } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", key)
      .maybeSingle();
    if (error) throw error;
    const v = (data?.value as string | undefined) ?? "";
    return v && v.length > 0 ? v : fallback;
  } catch (e) {
    console.error("fetchSetting failed", key, e);
    return fallback;
  }
}

async function upsertSetting(key: string, value: string): Promise<void> {
  const { error } = await supabase
    .from("app_settings")
    .upsert({ key, value, updated_at: new Date().toISOString() });
  if (error) throw error;
}

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

let initPromise: Promise<void> | null = null;

/**
 * Hydrates candidates + votes from Supabase, migrates any legacy localStorage
 * candidates on first run, and subscribes to realtime updates so every open
 * tab / device stays in sync. Idempotent — safe to call from multiple routes.
 */
export function seedIfEmpty(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (initPromise) return initPromise;
  initPromise = (async () => {
    // 1. Hydrate cache from cloud.
    const [cloudCandidates, cloudVotes] = await Promise.all([fetchCandidates(), fetchVotes()]);
    candidatesCache = cloudCandidates;
    votesCache = cloudVotes;
    cacheHydrated = true;
    emit();

    // Hydrate ASPL ordering from shared settings.
    await store.refreshAsplOrder();

    // 2. If cloud is empty, migrate local data or seed defaults (one-shot).
    if (candidatesCache.length === 0) {
      const alreadyMigrated = read<boolean>(MIGRATED_KEY, false);
      const localCandidates = read<Candidate[]>(CANDIDATES_KEY, []);
      if (!alreadyMigrated && localCandidates.length > 0) {
        const rows = localCandidates.map(candidateToInsert);
        const { error } = await (supabase.from("candidates" as any).insert(rows) as any);
        if (!error) {
          write(MIGRATED_KEY, true);
          candidatesCache = await fetchCandidates();
          emit();
        } else {
          console.error("Migration of local candidates failed", error);
        }
      } else if (!alreadyMigrated) {
        const defaults: Candidate[] = defaultSeed().map((c) => ({ ...c, id: crypto.randomUUID() }));
        const { error } = await (supabase.from("candidates" as any).insert(defaults.map(candidateToInsert)) as any);
        if (!error) {
          write(MIGRATED_KEY, true);
          candidatesCache = await fetchCandidates();
          emit();
        } else {
          console.error("Seeding default candidates failed", error);
        }
      }
    }

    // 3. Wire realtime subscription so cross-tab / cross-device updates flow in.
    setupRealtime();
  })();
  return initPromise;
}

// Silence unused warning; kept for callers wanting a hydration signal.
export function isElectionHydrated() {
  return cacheHydrated;
}

function defaultSeed(): Omit<Candidate, "id">[] {
  return [
    { name: "Aarav Mehta", role: "spl", house: null },
    { name: "Priya Sharma", role: "spl", house: null },
    { name: "Rohan Iyer", role: "aspl", house: null },
    { name: "Ananya Verma", role: "aspl", house: null },
    { name: "Kabir Nair", role: "sports-sec", house: null },
    { name: "Isha Kapoor", role: "sports-sec", house: null },
    { name: "Vivaan Rao", role: "cultural-sec", house: null },
    { name: "Meera Joshi", role: "cultural-sec", house: null },
    ...HOUSES.flatMap((h) => [
      { name: `${h.name} Cap A`, role: "captain" as Role, house: h.id },
      { name: `${h.name} Cap B`, role: "captain" as Role, house: h.id },
      { name: `${h.name} VC A`, role: "vice-captain" as Role, house: h.id },
      { name: `${h.name} VC B`, role: "vice-captain" as Role, house: h.id },
    ]),
  ];
}