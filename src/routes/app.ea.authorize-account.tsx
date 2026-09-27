import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app/app-shell";
import { Panel } from "@/components/pink/primitives";
import { CopyField, EaStatusBadge, LastSeen } from "@/components/ea/ea-ui";
import {
  EA_ANON_KEY_PLACEHOLDER,
  EA_BASE_URL_PLACEHOLDER,
  useAuthorizeAccount,
  useEaAccounts,
} from "@/lib/ea";

export const Route = createFileRoute("/app/ea/authorize-account")({
  head: () => ({
    meta: [
      { title: "Authorize MT5 account | DirectionalTrendEA" },
      { name: "description", content: "Authorize your MT5 login number and get the values for your EA inputs." },
      { property: "og:title", content: "Authorize your MT5 account" },
      { property: "og:description", content: "Authorize your MT5 login number for DirectionalTrendEA." },
    ],
  }),
  component: AuthorizeAccount,
});

function AuthorizeAccount() {
  const { data: accounts = [], isLoading } = useEaAccounts();
  const authorize = useAuthorizeAccount();
  const [login, setLogin] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <PageHeader
        title="Authorize account"
        copy="Tell us which MT5 login number is yours. This does not connect to MT5 — your EA reports on its own."
      />
      <div className="grid gap-6 px-4 py-6 lg:grid-cols-2 lg:px-8">
        <div className="space-y-6">
          {accounts.length > 0 && (
            <Panel>
              <h2 className="font-display text-base font-semibold">Your authorized accounts</h2>
              <ul className="mt-4 divide-y divide-line">
                {accounts.map((a) => (
                  <li key={a.id} className="py-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono text-sm">{a.mt5_login}</span>
                      <EaStatusBadge status={a.status} />
                      <span className="ml-auto">
                        <LastSeen account={a} />
                      </span>
                    </div>
                    {a.status !== "active" && (
                      <p className="mt-2 text-xs text-amber">
                        This account is authorized and its data is being received, but it is not yet active for trading.{" "}
                        <Link to="/app/ea/billing" className="underline">
                          See Billing
                        </Link>
                        .
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          <Panel>
            <h2 className="font-display text-base font-semibold">
              {accounts.length ? "Add another account" : "Authorize your MT5 account"}
            </h2>
            <form
              className="mt-4 space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                setError(null);
                const n = Number(login);
                if (!Number.isInteger(n) || n <= 0) return setError("Enter a valid MT5 login number.");
                try {
                  await authorize.mutateAsync(n);
                  setLogin("");
                } catch (err) {
                  setError((err as Error).message);
                }
              }}
            >
              <label className="block text-sm text-fog" htmlFor="mt5">
                MT5 Account Login Number
              </label>
              <input
                id="mt5"
                inputMode="numeric"
                value={login}
                onChange={(e) => setLogin(e.target.value.replace(/\D/g, ""))}
                className="w-full rounded-md border border-line bg-ink2 px-3 py-2 font-mono text-sm text-white outline-none focus:border-pink/50"
                placeholder="e.g. 51234567"
              />
              {error && <p className="text-xs text-pink">{error}</p>}
              <button
                type="submit"
                disabled={authorize.isPending || isLoading}
                className="rounded-md bg-pink px-4 py-2 text-sm font-medium text-ink hover:bg-white disabled:opacity-50"
              >
                {authorize.isPending ? "Authorizing…" : "Authorize this account"}
              </button>
            </form>
          </Panel>
        </div>

        <Panel accent>
          <h2 className="font-display text-base font-semibold">Values for your EA setup</h2>
          <div className="mt-4 space-y-4">
            {/* TODO: replace placeholders with the real values before launch */}
            <CopyField label="InpSupabaseBaseUrl" value={EA_BASE_URL_PLACEHOLDER} />
            <CopyField label="InpSupabaseAnonKey" value={EA_ANON_KEY_PLACEHOLDER} />
          </div>
          <p className="mt-4 text-xs text-fog">
            These two values are the same for every user - only the login number above is what
            identifies an account as yours.
          </p>
        </Panel>
      </div>
    </div>
  );
}
