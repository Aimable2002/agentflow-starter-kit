import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, SUPABASE_URL } from "@/integrations/supabase/client";

export type EaAccount = {
  id: string;
  user_id: string | null;
  mt5_login: number;
  broker_server: string | null;
  status: "active" | "inactive" | string;
  last_seen_at: string | null;
  last_equity: number | null;
  last_balance: number | null;
  last_margin_level: number | null;
  created_at: string;
};

export type EaTrade = {
  id: number;
  account_id: string;
  symbol: string;
  ticket: number;
  direction: "buy" | "sell" | string;
  lot: number;
  open_price: number | null;
  close_price: number | null;
  open_time: string | null;
  close_time: string | null;
  profit: number;
  commission: number;
  swap: number;
};

export type EquitySnapshot = {
  id: number;
  account_id: string;
  equity: number;
  balance: number;
  margin_level: number | null;
  recorded_at: string;
};

export type EaRelease = {
  id: string;
  version: string;
  file_path: string;
  release_notes: string | null;
  released_at: string;
};

// Placeholders the project owner must fill in before launch.
export const EA_BASE_URL_PLACEHOLDER = "[INSERT ACTUAL BASE URL]";
export const EA_ANON_KEY_PLACEHOLDER = "[INSERT ACTUAL ANON KEY]";
export const EA_SUPPORT_PLACEHOLDER = "[INSERT SUPPORT EMAIL/LINK]";

export const OFFLINE_MINUTES = 15;

async function currentUserId() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Not signed in");
  return data.user.id;
}

/** Only ever queries accounts owned by the signed-in user. */
export function useEaAccounts() {
  return useQuery({
    queryKey: ["ea", "accounts"],
    queryFn: async () => {
      const uid = await currentUserId();
      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as EaAccount[];
    },
  });
}

export function useEaTrades(accountIds: string[]) {
  return useQuery({
    queryKey: ["ea", "trades", accountIds],
    enabled: accountIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trades")
        .select(
          "id,account_id,symbol,ticket,direction,lot,open_price,close_price,open_time,close_time,profit,commission,swap",
        )
        .in("account_id", accountIds)
        .order("close_time", { ascending: true })
        .limit(10000);
      if (error) throw error;
      return (data ?? []).map((t) => ({
        ...t,
        profit: Number(t.profit),
        commission: Number(t.commission),
        swap: Number(t.swap),
        lot: Number(t.lot),
      })) as EaTrade[];
    },
  });
}

export function useEquitySnapshots(accountId: string | undefined, limit?: number) {
  return useQuery({
    queryKey: ["ea", "equity", accountId, limit],
    enabled: !!accountId,
    queryFn: async () => {
      let q = supabase
        .from("equity_snapshots")
        .select("id,account_id,equity,balance,margin_level,recorded_at")
        .eq("account_id", accountId!)
        .order("recorded_at", { ascending: false });
      q = q.limit(limit ?? 20000);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? [])
        .map((s) => ({ ...s, equity: Number(s.equity), balance: Number(s.balance) }))
        .reverse() as EquitySnapshot[];
    },
  });
}

export function useLatestRelease() {
  return useQuery({
    queryKey: ["ea", "release"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ea_releases")
        .select("*")
        .order("released_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as EaRelease | null;
    },
  });
}

export function releaseUrl(filePath: string) {
  return supabase.storage.from("ea-downloads").getPublicUrl(filePath).data.publicUrl;
}

export function useConnectAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (mt5Login: number) => {
      const uid = await currentUserId();
      const { error } = await supabase.from("accounts").insert({ user_id: uid, mt5_login: mt5Login });
      if (error) {
        if (error.code === "23505")
          throw new Error("That MT5 login is already connected to another account.");
        throw new Error(error.message);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ea", "accounts"] }),
  });
}

export const netOf = (t: EaTrade) => t.profit + t.commission + t.swap;

export function isOffline(a: EaAccount) {
  if (!a.last_seen_at) return true;
  return Date.now() - new Date(a.last_seen_at).getTime() > OFFLINE_MINUTES * 60_000;
}

export const money = (n: number | null | undefined) =>
  n == null || Number.isNaN(n)
    ? "—"
    : n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });

export function computeStats(trades: EaTrade[]) {
  const nets = trades.map(netOf);
  const wins = nets.filter((n) => n > 0);
  const losses = nets.filter((n) => n < 0);
  const gross = wins.reduce((a, b) => a + b, 0);
  const grossLoss = losses.reduce((a, b) => a + b, 0);
  const net = gross + grossLoss;
  return {
    net,
    gross,
    grossLoss,
    profitFactor: grossLoss === 0 ? null : gross / Math.abs(grossLoss),
    expectedPayoff: trades.length ? net / trades.length : null,
    total: trades.length,
    winRate: trades.length ? (wins.length / trades.length) * 100 : null,
    avgWin: wins.length ? gross / wins.length : null,
    avgLoss: losses.length ? grossLoss / losses.length : null,
    largestWin: wins.length ? Math.max(...wins) : null,
    largestLoss: losses.length ? Math.min(...losses) : null,
  };
}

export function computeStreaks(trades: EaTrade[]) {
  const sorted = [...trades].sort(
    (a, b) => new Date(a.close_time ?? 0).getTime() - new Date(b.close_time ?? 0).getTime(),
  );
  const winStreaks: { n: number; sum: number }[] = [];
  const lossStreaks: { n: number; sum: number }[] = [];
  let cur: { kind: "w" | "l"; n: number; sum: number } | null = null;
  const push = () => {
    if (!cur) return;
    (cur.kind === "w" ? winStreaks : lossStreaks).push({ n: cur.n, sum: cur.sum });
  };
  for (const t of sorted) {
    const v = netOf(t);
    if (v === 0) continue;
    const kind = v > 0 ? "w" : "l";
    if (cur && cur.kind === kind) {
      cur.n++;
      cur.sum += v;
    } else {
      push();
      cur = { kind, n: 1, sum: v };
    }
  }
  push();
  const maxBy = (arr: { n: number; sum: number }[]) =>
    arr.reduce<{ n: number; sum: number } | null>((m, s) => (!m || s.n > m.n ? s : m), null);
  const avg = (arr: { n: number }[]) => (arr.length ? arr.reduce((a, s) => a + s.n, 0) / arr.length : null);
  return {
    maxWin: maxBy(winStreaks),
    maxLoss: maxBy(lossStreaks),
    avgWin: avg(winStreaks),
    avgLoss: avg(lossStreaks),
  };
}

export function computeDrawdown(snaps: EquitySnapshot[]) {
  let peak = -Infinity;
  let maxDd = 0;
  let maxPct = 0;
  const series = snaps.map((s) => {
    peak = Math.max(peak, s.equity);
    const dd = peak - s.equity;
    const pct = peak > 0 ? (dd / peak) * 100 : 0;
    maxDd = Math.max(maxDd, dd);
    maxPct = Math.max(maxPct, pct);
    return { t: s.recorded_at, dd: -dd, pct: -pct };
  });
  return { series, maxDd, maxPct };
}

export const SUPABASE_PROJECT_URL = SUPABASE_URL;
