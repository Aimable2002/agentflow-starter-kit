import { useEffect, useState, type ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { Download } from "lucide-react";
import { SiteLayout } from "@/components/site/site-layout";
import { Panel } from "@/components/pink/primitives";
import { supabase } from "@/integrations/supabase/client";
import { releaseUrl, useLatestRelease } from "@/lib/ea";

export const Route = createFileRoute("/ea/directional-trend-ea")({
  head: () => ({
    meta: [
      { title: "DirectionalTrendEA — MT5 trend-following expert advisor" },
      {
        name: "description",
        content:
          "A single-position, direction-confirming trend-following expert advisor for MetaTrader 5. Setup guide, risk disclosure and download.",
      },
      { property: "og:title", content: "DirectionalTrendEA for MetaTrader 5" },
      {
        property: "og:description",
        content: "Single-position, direction-confirming trend-following EA. Read the risks, set it up, download.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EaDocs,
});

const sections = [
  ["what", "What it does"],
  ["how", "How it works"],
  ["risk", "Risk warning"],
  ["setup", "Setting it up in MT5"],
  ["authorize", "Authorize your account"],
  ["download", "Download"],
  ["faq", "FAQ"],
] as const;

const faqs = [
  {
    q: "Does the website ever connect to my MT5 account?",
    a: "No. The EA runs entirely inside your own MT5 terminal and reports to us on its own. The website never talks to MT5 - it only lets you authorize an MT5 login number as yours.",
  },
  { q: "What happens if my subscription lapses?", a: "[CONFIRM WITH OWNER]" },
  { q: "Does this work on any broker?", a: "[CONFIRM WITH OWNER]" },
  {
    q: "Can I authorize multiple accounts?",
    a: "Yes, you can authorize more than one MT5 login number on the Authorize Account page. Each account is activated for trading separately. [CONFIRM WITH OWNER]",
  },
  {
    q: "Where do I see my results?",
    a: "Once your login number is authorized, the closed trades and account snapshots your EA reports appear on your dashboard.",
  },
];

function useSignedIn() {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));
    return () => data.subscription.unsubscribe();
  }, []);
  return signedIn;
}

function EaDocs() {
  const { data: release } = useLatestRelease();
  const signedIn = useSignedIn();
  return (
    <SiteLayout>
      <section className="border-b border-line">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-mute">MetaTrader 5 expert advisor</p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight lg:text-5xl">DirectionalTrendEA</h1>
          <p className="mt-4 max-w-2xl text-lg text-fog">
            A single-position, direction-confirming trend-following expert advisor for MetaTrader 5.
          </p>
        </div>
      </section>

      <nav className="sticky top-16 z-30 border-b border-line bg-ink/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl gap-5 overflow-x-auto px-6 py-3 font-mono text-xs text-fog">
          {sections.map(([id, label]) => (
            <a key={id} href={`#${id}`} className="whitespace-nowrap hover:text-white">
              {label}
            </a>
          ))}
        </div>
      </nav>

      <div className="mx-auto max-w-5xl space-y-16 px-6 py-16">
        <Section id="what" title="What it does">
          <p className="text-fog">
            DirectionalTrendEA holds at most one market position at a time, in whichever direction its
            trend-confirmation logic currently agrees on. It does not grid, does not average into losing
            positions, and does not guarantee profit. Entries require multiple independent signals (trend
            strength, price distance from a moving average, and directional momentum) to agree before it opens
            a position, and it exits early if those signals reverse - not just when a stop-loss is hit.
          </p>
        </Section>

        <Section id="how" title="How it works">
          <ul className="list-disc space-y-2 pl-5 text-fog">
            <li>Direction is only confirmed when enough of its enabled signals agree (configurable by the user in MT5)</li>
            <li>Only one position open at a time, no averaging or pyramiding</li>
            <li>A mandatory stop-loss is attached to every trade</li>
            <li>An optional hard dollar loss cap can bound the worst case on any single trade</li>
            <li>
              Runs entirely inside your own MT5 terminal; it automatically reports every closed trade and a
              periodic account snapshot to your dashboard on this site - this reporting is the only data path
              between the EA and us, and it is initiated by the EA itself, not by this website
            </li>
          </ul>
        </Section>

        <Section id="risk" title="Risk warning">
          <Panel accent>
            <p className="text-sm leading-relaxed text-white">
              Trading foreign exchange, metals, and CFDs carries a high level of risk and may not be suitable
              for all investors. Past performance, including any backtested results shown by this EA or on this
              site, is not indicative of future results. You should not trade with money you cannot afford to
              lose. This software is provided as a tool to automate a trading strategy; it does not guarantee
              profit and can lose money, including more than your account balance in some account structures.
              By downloading and running this EA you accept full responsibility for its trading activity on your
              account.
            </p>
          </Panel>
        </Section>

        <Section id="setup" title="Setting it up in MT5">
          <p className="mb-4 text-sm text-mute">
            These steps happen entirely inside MT5, on your own computer. The website is not involved.
          </p>
          <ol className="list-decimal space-y-3 pl-5 text-fog">
            <li>
              Copy the downloaded EA file into your MT5 <code className="text-white">MQL5/Experts</code> folder
            </li>
            <li>
              In MT5: Tools → Options → Expert Advisors → check "Allow WebRequest for listed URL" and add:{" "}
              <code className="text-amber">[INSERT YOUR SUPABASE FUNCTIONS BASE URL HERE]</code>
            </li>
            <li>
              Attach the EA to a chart, open its Inputs tab, and set <code className="text-white">InpSupabaseBaseUrl</code>{" "}
              and <code className="text-white">InpSupabaseAnonKey</code> to the values shown in the Authorize
              Account section below
            </li>
            <li>
              Once running, the EA reports its MT5 login number and trade data to us on its own - nothing further
              to do in MT5
            </li>
          </ol>
        </Section>

        <Section id="authorize" title="Authorize your account">
          <p className="text-fog">
            Setting up the EA in MT5 (previous section) is a separate action from what happens here. Running the
            EA makes it report data under its own MT5 login number - it does not yet know that login number
            belongs to you. Authorizing tells us "this MT5 login is mine," so we can match the data it's already
            sending to your account here and activate it for trading.
          </p>
          <div className="mt-5">
            <Link
              to={signedIn ? "/app/ea/authorize-account" : "/login"}
              className="inline-flex rounded-md bg-pink px-5 py-2.5 text-sm font-medium text-ink hover:bg-white"
            >
              Authorize Account
            </Link>
            <p className="mt-2 text-xs text-mute">
              You'll need your MT5 account login number, shown in MT5 under your account details.
            </p>
          </div>
        </Section>

        <Section id="download" title="Download">
          <Panel className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="font-display text-lg">DirectionalTrendEA</p>
              {release ? (
                <p className="font-mono text-xs text-mute">
                  v{release.version} · updated {format(new Date(release.released_at), "PP")}
                </p>
              ) : (
                <p className="font-mono text-xs text-mute">No release published yet</p>
              )}
              {release?.release_notes && <p className="mt-2 text-sm text-fog">{release.release_notes}</p>}
            </div>
            {release ? (
              <a
                href={releaseUrl(release.file_path)}
                className="inline-flex items-center gap-2 rounded-md bg-pink px-5 py-2.5 text-sm font-medium text-ink hover:bg-white sm:ml-auto"
              >
                <Download className="size-4" /> Download EA
              </a>
            ) : (
              <span className="rounded-md border border-line px-5 py-2.5 text-sm text-mute sm:ml-auto">Unavailable</span>
            )}
          </Panel>
        </Section>

        <Section id="faq" title="FAQ">
          <dl className="space-y-5">
            {faqs.map((f) => (
              <div key={f.q}>
                <dt className="font-medium text-white">{f.q}</dt>
                <dd className="mt-1 text-sm text-fog">{f.a}</dd>
              </div>
            ))}
          </dl>
        </Section>
      </div>
    </SiteLayout>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-32">
      <h2 className="mb-4 font-display text-2xl font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}
