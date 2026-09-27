import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/app-shell";
import { Panel } from "@/components/pink/primitives";
import { EaStatusBadge } from "@/components/ea/ea-ui";
import { EA_SUPPORT_PLACEHOLDER, useEaAccounts } from "@/lib/ea";

export const Route = createFileRoute("/app/ea/billing")({
  head: () => ({
    meta: [
      { title: "EA billing status | DirectionalTrendEA" },
      { name: "description", content: "See whether each authorized MT5 account is active for trading." },
      { property: "og:title", content: "DirectionalTrendEA billing status" },
      { property: "og:description", content: "Trading activation status for your MT5 accounts." },
    ],
  }),
  component: EaBilling,
});

function EaBilling() {
  const { data: accounts = [], isLoading } = useEaAccounts();
  return (
    <div>
      <PageHeader title="EA billing" copy="Trading activation status for each authorized MT5 account." />
      <div className="space-y-4 px-4 py-6 lg:px-8">
        {/* TODO: payment provider integration - status is currently set manually by an admin in Supabase */}
        {isLoading && <p className="text-sm text-mute">Loading…</p>}
        {!isLoading && accounts.length === 0 && (
          <Panel>
            <p className="text-sm text-fog">
              No authorized accounts yet.{" "}
              <Link to="/app/ea/authorize-account" className="text-pink underline">
                Authorize an account
              </Link>
            </p>
          </Panel>
        )}
        {accounts.map((a) => (
          <Panel key={a.id}>
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm">MT5 {a.mt5_login}</span>
              <EaStatusBadge status={a.status} />
            </div>
            <p className="mt-3 text-sm text-fog">
              {a.status === "active"
                ? "This account is active for trading. No action needed."
                : `Your account is not currently active for trading. Contact ${EA_SUPPORT_PLACEHOLDER} to activate your subscription.`}
            </p>
          </Panel>
        ))}
      </div>
    </div>
  );
}
