import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Line, LineChart, ResponsiveContainer, YAxis } from "recharts";
import { startOfMonth, startOfWeek } from "date-fns";
import { PageHeader } from "@/components/app/app-shell";
import { Panel } from "@/components/pink/primitives";
import { EaStatusBadge, LastSeen } from "@/components/ea/ea-ui";
import { money, netOf, useEaAccounts, useEaTrades, useEquitySnapshots, type EaAccount, type EaTrade } from "@/lib/ea";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/ea/dashboard/")({
  head: () => ({
    meta: [
      { title: "EA dashboard | DirectionalTrendEA" },
      { name: "description", content: "Equity, balance and profit across your authorized MT5 accounts." },
      { property: "og:title", content: "DirectionalTrendEA dashboard" },
      { property: "og:description", content: "Overview of every MT5 account running DirectionalTrendEA." },
    ],
  }),
  component: EaDashboard,
});

type Period = "all" | "month" | "week";

function EaDashboard() {
  const { data: accounts = [], isLoading } = useEaAccounts();
  const { data: trades = [] } = useEaTrades(accounts.map((a) => a.id));
  const [period, setPeriod] = useState<Period>("all");

  return (
    <div>
      <PageHeader
        title="EA dashboard"
        copy="Live reporting from DirectionalTrendEA on each of your MT5 accounts."
        actions={
          <div className="flex rounded-md border border-line bg-ink2 p-0.5">
            {(["all", "month", "week"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  "rounded px-3 py-1 font-mono text-[11px]",
                  period === p ? "bg-panel text-white" : "text-mute hover:text-white",
                )}
              >
                {p === "all" ? "All time" : p === "month" ? "This month" : "This week"}
              </button>
            ))}
          </div>
        }
      />
      <div className="px-4 py-6 lg:px-8">
        {isLoading ? (
          <p className="text-sm text-mute">Loading…</p>
        ) : accounts.length === 0 ? (
          <Panel className="text-center">
            <p className="font-display text-lg">No authorized accounts yet</p>
            <p className="mt-2 text-sm text-fog">Authorize your MT5 login number to start seeing the data your EA reports.</p>
            <Link
              to="/app/ea/authorize-account"
              className="mt-4 inline-block rounded-md bg-pink px-4 py-2 text-sm font-medium text-ink hover:bg-white"
            >
              Authorize account
            </Link>
          </Panel>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {accounts.map((a) => (
              <AccountCard key={a.id} account={a} trades={trades.filter((t) => t.account_id === a.id)} period={period} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AccountCard({ account, trades, period }: { account: EaAccount; trades: EaTrade[]; period: Period }) {
  const { data: snaps = [] } = useEquitySnapshots(account.id, 50);
  const net = useMemo(() => {
    const from =
      period === "month" ? startOfMonth(new Date()) : period === "week" ? startOfWeek(new Date(), { weekStartsOn: 1 }) : null;
    return trades
      .filter((t) => !from || (t.close_time && new Date(t.close_time) >= from))
      .reduce((s, t) => s + netOf(t), 0);
  }, [trades, period]);

  return (
    <Link to="/app/ea/dashboard/$accountId" params={{ accountId: account.id }} className="block">
      <Panel className="h-full transition-colors hover:border-pink/40">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm">MT5 {account.mt5_login}</span>
          <span className="ml-auto">
            <EaStatusBadge status={account.status} />
          </span>
        </div>
        <div className="mt-1">
          <LastSeen account={account} />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div>
            <p className="font-mono text-[10px] uppercase text-mute">Equity</p>
            <p className="text-sm">{money(account.last_equity)}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase text-mute">Balance</p>
            <p className="text-sm">{money(account.last_balance)}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase text-mute">Net profit</p>
            <p className={cn("text-sm", net >= 0 ? "text-mint" : "text-pink")}>{money(net)}</p>
          </div>
        </div>
        <div className="mt-4 h-16">
          {snaps.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={snaps}>
                <YAxis hide domain={["auto", "auto"]} />
                <Line type="monotone" dataKey="equity" stroke="var(--color-pink)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="pt-5 text-center font-mono text-[11px] text-mute">No equity snapshots yet</p>
          )}
        </div>
      </Panel>
    </Link>
  );
}
