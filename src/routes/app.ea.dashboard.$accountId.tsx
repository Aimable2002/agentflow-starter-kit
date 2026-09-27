import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowUpDown } from "lucide-react";
import { PageHeader } from "@/components/app/app-shell";
import { Panel } from "@/components/pink/primitives";
import { EaStatusBadge, LastSeen, Stat } from "@/components/ea/ea-ui";
import {
  computeDrawdown,
  computeStats,
  computeStreaks,
  money,
  netOf,
  useEaAccounts,
  useEaTrades,
  useEquitySnapshots,
  type EaTrade,
} from "@/lib/ea";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/ea/dashboard/$accountId")({
  head: () => ({
    meta: [
      { title: "Account performance | DirectionalTrendEA" },
      { name: "description", content: "Equity curve, drawdown, trade log and streaks for one MT5 account." },
      { property: "og:title", content: "DirectionalTrendEA account performance" },
      { property: "og:description", content: "Detailed performance for a single MT5 account." },
    ],
  }),
  component: AccountDetail,
});

const tooltipStyle = {
  background: "var(--color-ink2, #111)",
  border: "1px solid var(--color-line)",
  borderRadius: 6,
  fontSize: 12,
};
const RANGES = { "7d": 7, "30d": 30, "90d": 90, All: null } as const;
type Range = keyof typeof RANGES;
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function AccountDetail() {
  const { accountId } = Route.useParams();
  const { data: accounts = [], isLoading } = useEaAccounts();
  // Only query data for an account we've confirmed belongs to this user.
  const account = accounts.find((a) => a.id === accountId);
  const { data: trades = [] } = useEaTrades(account ? [account.id] : []);
  const { data: allSnaps = [] } = useEquitySnapshots(account?.id);
  const [range, setRange] = useState<Range>("All");

  const snaps = useMemo(() => {
    const days = RANGES[range];
    if (!days) return allSnaps;
    const from = Date.now() - days * 86_400_000;
    return allSnaps.filter((s) => new Date(s.recorded_at).getTime() >= from);
  }, [allSnaps, range]);

  const stats = useMemo(() => computeStats(trades), [trades]);
  const streaks = useMemo(() => computeStreaks(trades), [trades]);
  const dd = useMemo(() => computeDrawdown(snaps), [snaps]);

  if (isLoading) return <p className="p-8 text-sm text-mute">Loading…</p>;
  if (!account)
    return (
      <div className="p-8">
        <Panel>
          <p className="text-sm text-fog">Account not found.</p>
          <Link to="/app/ea/dashboard" className="mt-2 inline-block text-sm text-pink underline">
            Back to dashboard
          </Link>
        </Panel>
      </div>
    );

  const n = (v: number | null, f = money) => (v == null ? "—" : f(v));
  const tone = (v: number | null) => (v == null ? undefined : v >= 0 ? "pos" : "neg");
  const chartData = snaps.map((s) => ({ ...s, t: new Date(s.recorded_at).getTime() }));

  return (
    <div>
      <PageHeader
        title={`MT5 ${account.mt5_login}`}
        copy={account.broker_server ?? undefined}
        actions={
          <>
            <EaStatusBadge status={account.status} />
            <LastSeen account={account} />
          </>
        }
      />
      <div className="space-y-6 px-4 py-6 lg:px-8">
        {!account.last_seen_at && (
          <Panel accent>
            <p className="font-display text-base">Setup incomplete</p>
            <p className="mt-1 text-sm text-fog">
              This account has never checked in. Make sure the EA is attached with the right inputs.{" "}
              <Link to="/ea/directional-trend-ea" hash="connect" className="text-pink underline">
                Setup guide
              </Link>{" "}
              ·{" "}
              <Link to="/app/ea/connect-account" className="text-pink underline">
                Connect account
              </Link>
            </p>
          </Panel>
        )}

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
          <Stat label="Net profit" value={money(stats.net)} tone={tone(stats.net)} />
          <Stat label="Gross profit" value={money(stats.gross)} tone="pos" />
          <Stat label="Gross loss" value={money(stats.grossLoss)} tone="neg" />
          <Stat label="Profit factor" value={n(stats.profitFactor, (v) => v.toFixed(2))} />
          <Stat label="Expected payoff" value={n(stats.expectedPayoff)} tone={tone(stats.expectedPayoff)} />
          <Stat label="Total trades" value={String(stats.total)} />
          <Stat label="Win rate" value={n(stats.winRate, (v) => `${v.toFixed(1)}%`)} />
          <Stat label="Avg win" value={n(stats.avgWin)} tone="pos" />
          <Stat label="Avg loss" value={n(stats.avgLoss)} tone="neg" />
          <Stat label="Largest win" value={n(stats.largestWin)} tone="pos" />
          <Stat label="Largest loss" value={n(stats.largestLoss)} tone="neg" />
          <Stat label="Equity now" value={money(account.last_equity)} />
        </div>

        <Panel>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-base font-semibold">Equity curve</h2>
            <div className="ml-auto flex rounded-md border border-line bg-ink2 p-0.5">
              {(Object.keys(RANGES) as Range[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={cn(
                    "rounded px-2.5 py-1 font-mono text-[11px]",
                    range === r ? "bg-panel text-white" : "text-mute hover:text-white",
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 h-64">
            {chartData.length > 1 ? (
              <ResponsiveContainer>
                <LineChart data={chartData}>
                  <CartesianGrid stroke="var(--color-line)" strokeDasharray="3 3" />
                  <XAxis dataKey="t" type="number" domain={["dataMin", "dataMax"]} scale="time" tickFormatter={(v) => format(v, "MMM d")} stroke="var(--color-mute)" fontSize={11} />
                  <YAxis domain={["auto", "auto"]} stroke="var(--color-mute)" fontSize={11} width={70} />
                  <Tooltip contentStyle={tooltipStyle} labelFormatter={(v) => format(Number(v), "PPp")} formatter={(v: number) => money(v)} />
                  <Line type="monotone" dataKey="equity" name="Equity" stroke="var(--color-pink)" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="balance" name="Balance" stroke="var(--color-mint)" dot={false} strokeWidth={1.5} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Empty text="Not enough equity snapshots in this range." />
            )}
          </div>
        </Panel>

        <Panel>
          <h2 className="font-display text-base font-semibold">Drawdown</h2>
          <div className="mt-3 flex gap-6">
            <div>
              <p className="font-mono text-[10px] uppercase text-mute">Max drawdown $</p>
              <p className="text-lg text-pink">{money(dd.maxDd)}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase text-mute">Max drawdown %</p>
              <p className="text-lg text-pink">{dd.maxPct.toFixed(2)}%</p>
            </div>
          </div>
          <div className="mt-4 h-48">
            {dd.series.length > 1 ? (
              <ResponsiveContainer>
                <AreaChart data={dd.series.map((d) => ({ ...d, t: new Date(d.t).getTime() }))}>
                  <CartesianGrid stroke="var(--color-line)" strokeDasharray="3 3" />
                  <XAxis dataKey="t" type="number" domain={["dataMin", "dataMax"]} scale="time" tickFormatter={(v) => format(v, "MMM d")} stroke="var(--color-mute)" fontSize={11} />
                  <YAxis stroke="var(--color-mute)" fontSize={11} width={70} tickFormatter={(v) => `${Number(v).toFixed(1)}%`} />
                  <Tooltip contentStyle={tooltipStyle} labelFormatter={(v) => format(Number(v), "PPp")} formatter={(v: number) => `${v.toFixed(2)}%`} />
                  <Area type="monotone" dataKey="pct" name="Drawdown" stroke="var(--color-pink)" fill="var(--color-pink)" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <Empty text="Not enough equity snapshots to compute drawdown." />
            )}
          </div>
        </Panel>

        {trades.length === 0 ? (
          <Panel>
            <Empty text="No closed trades yet." />
          </Panel>
        ) : (
          <>
            <div className="grid gap-4 lg:grid-cols-3">
              <DistChart title="P&L by weekday" data={groupBy(trades, (d) => d.getDay(), 7, (i) => WEEKDAYS[i])} />
              <DistChart title="P&L by hour" data={groupBy(trades, (d) => d.getHours(), 24, (i) => String(i))} />
              <DistChart title="P&L by month" data={byMonth(trades)} />
            </div>

            <Panel>
              <h2 className="font-display text-base font-semibold">Streaks</h2>
              <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
                <Stat label="Max consecutive wins" value={streaks.maxWin ? `${streaks.maxWin.n} · ${money(streaks.maxWin.sum)}` : "—"} tone="pos" />
                <Stat label="Max consecutive losses" value={streaks.maxLoss ? `${streaks.maxLoss.n} · ${money(streaks.maxLoss.sum)}` : "—"} tone="neg" />
                <Stat label="Avg winning streak" value={streaks.avgWin == null ? "—" : streaks.avgWin.toFixed(1)} />
                <Stat label="Avg losing streak" value={streaks.avgLoss == null ? "—" : streaks.avgLoss.toFixed(1)} />
              </div>
            </Panel>

            <TradeLog trades={trades} />
          </>
        )}
      </div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="grid h-full place-items-center py-8 text-center font-mono text-xs text-mute">{text}</p>;
}

type Bucket = { label: string; pnl: number; count: number };

function groupBy(trades: EaTrade[], key: (d: Date) => number, size: number, label: (i: number) => string): Bucket[] {
  const b: Bucket[] = Array.from({ length: size }, (_, i) => ({ label: label(i), pnl: 0, count: 0 }));
  for (const t of trades) {
    if (!t.close_time) continue;
    const k = key(new Date(t.close_time));
    b[k].pnl += netOf(t);
    b[k].count++;
  }
  return b;
}

function byMonth(trades: EaTrade[]): Bucket[] {
  const m = new Map<string, Bucket>();
  for (const t of trades) {
    if (!t.close_time) continue;
    const k = format(new Date(t.close_time), "yyyy-MM");
    const cur = m.get(k) ?? { label: format(new Date(t.close_time), "MMM yy"), pnl: 0, count: 0 };
    cur.pnl += netOf(t);
    cur.count++;
    m.set(k, cur);
  }
  return [...m.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v);
}

function DistChart({ title, data }: { title: string; data: Bucket[] }) {
  return (
    <Panel>
      <h3 className="font-display text-sm font-semibold">{title}</h3>
      <div className="mt-3 h-48">
        <ResponsiveContainer>
          <BarChart data={data}>
            <XAxis dataKey="label" stroke="var(--color-mute)" fontSize={10} />
            <YAxis stroke="var(--color-mute)" fontSize={10} width={50} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v: number, _n, p) => [`${money(v)} (${(p.payload as Bucket).count} trades)`, "P&L"]}
            />
            <Bar dataKey="pnl">
              {data.map((d, i) => (
                <Cell key={i} fill={d.pnl >= 0 ? "var(--color-mint)" : "var(--color-pink)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}

type SortKey = "close_time" | "symbol" | "lot" | "profit";

function TradeLog({ trades }: { trades: EaTrade[] }) {
  const [symbol, setSymbol] = useState("");
  const [dir, setDir] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; asc: boolean }>({ key: "close_time", asc: false });
  const symbols = useMemo(() => [...new Set(trades.map((t) => t.symbol))].sort(), [trades]);

  const rows = useMemo(() => {
    const f = trades.filter((t) => {
      if (symbol && t.symbol !== symbol) return false;
      if (dir && t.direction !== dir) return false;
      if (from && (!t.close_time || t.close_time < from)) return false;
      if (to && (!t.close_time || t.close_time.slice(0, 10) > to)) return false;
      return true;
    });
    return f.sort((a, b) => {
      const va = a[sort.key] ?? "";
      const vb = b[sort.key] ?? "";
      const c = va < vb ? -1 : va > vb ? 1 : 0;
      return sort.asc ? c : -c;
    });
  }, [trades, symbol, dir, from, to, sort]);

  const th = (key: SortKey, label: string) => (
    <th className="px-3 py-2 text-left">
      <button className="inline-flex items-center gap-1 hover:text-white" onClick={() => setSort((s) => ({ key, asc: s.key === key ? !s.asc : false }))}>
        {label}
        <ArrowUpDown className="size-3" />
      </button>
    </th>
  );
  const input = "rounded-md border border-line bg-ink2 px-2 py-1.5 font-mono text-xs text-white";

  return (
    <Panel>
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="mr-auto font-display text-base font-semibold">Trade log</h2>
        <select className={input} value={symbol} onChange={(e) => setSymbol(e.target.value)}>
          <option value="">All symbols</option>
          {symbols.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select className={input} value={dir} onChange={(e) => setDir(e.target.value)}>
          <option value="">Buy & sell</option>
          <option value="buy">Buy</option>
          <option value="sell">Sell</option>
        </select>
        <input type="date" className={input} value={from} onChange={(e) => setFrom(e.target.value)} />
        <input type="date" className={input} value={to} onChange={(e) => setTo(e.target.value)} />
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="font-mono text-[10px] uppercase text-mute">
            <tr className="border-b border-line">
              {th("close_time", "Close time")}
              {th("symbol", "Symbol")}
              <th className="px-3 py-2 text-left">Dir</th>
              {th("lot", "Lot")}
              <th className="px-3 py-2 text-right">Open</th>
              <th className="px-3 py-2 text-right">Close</th>
              {th("profit", "Profit")}
              <th className="px-3 py-2 text-right">Comm.</th>
              <th className="px-3 py-2 text-right">Swap</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line font-mono">
            {rows.map((t) => (
              <tr key={t.id}>
                <td className="px-3 py-2 text-fog">{t.close_time ? format(new Date(t.close_time), "yyyy-MM-dd HH:mm") : "—"}</td>
                <td className="px-3 py-2">{t.symbol}</td>
                <td className={cn("px-3 py-2 uppercase", t.direction === "buy" ? "text-mint" : "text-pink")}>{t.direction}</td>
                <td className="px-3 py-2">{t.lot}</td>
                <td className="px-3 py-2 text-right">{t.open_price ?? "—"}</td>
                <td className="px-3 py-2 text-right">{t.close_price ?? "—"}</td>
                <td className={cn("px-3 py-2", t.profit >= 0 ? "text-mint" : "text-pink")}>{money(t.profit)}</td>
                <td className="px-3 py-2 text-right text-fog">{money(t.commission)}</td>
                <td className="px-3 py-2 text-right text-fog">{money(t.swap)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className="py-6 text-center text-mute">No trades match these filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
