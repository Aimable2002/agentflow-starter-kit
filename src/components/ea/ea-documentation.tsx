import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Panel } from "@/components/pink/primitives";

export const eaDocSections = [
  ["what", "What it does"],
  ["how", "How it works"],
  ["risk", "Risk warning"],
  ["setup", "Setting it up in MT5"],
  ["authorize", "Authorize your account"],
  ["faq", "FAQ"],
] as const;

const faqs = [
  {
    q: "Does the website ever connect to my MT5 account?",
    a: "No. The EA runs entirely inside your own MT5 terminal and reports to us on its own. The website only lets you authorize an MT5 login number as yours.",
  },
  { q: "What happens if my subscription lapses?", a: "[CONFIRM WITH OWNER]" },
  { q: "Does this work on any broker?", a: "[CONFIRM WITH OWNER]" },
  {
    q: "Can I authorize multiple accounts?",
    a: "Yes, you can authorize more than one MT5 login number. Each account is activated for trading separately. [CONFIRM WITH OWNER]",
  },
  {
    q: "Where do I see my results?",
    a: "Closed trades and account snapshots reported by the EA appear in your EA dashboard after authorization.",
  },
];

export function EaDocumentation() {
  return (
    <div className="space-y-14">
      <DocSection id="what" title="What it does">
        <p className="text-fog">
          DirectionalTrendEA holds at most one market position at a time, in whichever direction its
          trend-confirmation logic currently agrees on. It does not grid, does not average into losing positions,
          and does not guarantee profit. Entries require multiple independent signals to agree before it opens a
          position, and it exits early if those signals reverse—not only when a stop-loss is hit.
        </p>
      </DocSection>

      <DocSection id="how" title="How it works">
        <ul className="list-disc space-y-2 pl-5 text-fog">
          <li>Direction is confirmed only when enough enabled signals agree.</li>
          <li>Only one position is open at a time, with no averaging or pyramiding.</li>
          <li>A mandatory stop-loss is attached to every trade.</li>
          <li>An optional hard dollar loss cap can bound the worst case on a single trade.</li>
          <li>
            The EA runs inside your MT5 terminal and sends closed trades and periodic account snapshots to your
            dashboard. Reporting is initiated by the EA, never by this website.
          </li>
        </ul>
      </DocSection>

      <DocSection id="risk" title="Risk warning">
        <Panel accent>
          <p className="text-sm leading-relaxed text-white">
            Trading foreign exchange, metals, and CFDs carries a high level of risk and may not be suitable for
            all investors. Past performance, including backtested results, is not indicative of future results.
            Do not trade with money you cannot afford to lose. This software automates a trading strategy; it does
            not guarantee profit and can lose money, including more than your balance in some account structures.
            By downloading and running this EA, you accept full responsibility for its trading activity.
          </p>
        </Panel>
      </DocSection>

      <DocSection id="setup" title="Setting it up in MT5">
        <p className="mb-4 text-sm text-mute">These steps happen entirely inside MT5 on your computer.</p>
        <ol className="list-decimal space-y-3 pl-5 text-fog">
          <li>
            Download the current published version from <Link to="/app/ea/releases" className="text-pink underline">EA releases</Link>.
          </li>
          <li>Copy the EA file into your MT5 <code className="text-white">MQL5/Experts</code> folder.</li>
          <li>
            In MT5, open Tools → Options → Expert Advisors, enable WebRequest for listed URLs, and add the URL shown
            on the Authorize account page.
          </li>
          <li>
            Attach the EA to a chart and enter the supplied <code className="text-white">InpSupabaseBaseUrl</code> and
            <code className="text-white"> InpSupabaseAnonKey</code> values.
          </li>
          <li>Keep MT5 running with automated trading enabled so the EA can operate and report.</li>
        </ol>
      </DocSection>

      <DocSection id="authorize" title="Authorize your account">
        <p className="text-fog">
          Running the EA does not identify its MT5 login as yours. Authorization matches that login number to your
          account here so its reported activity can appear in your dashboard and be activated for trading.
        </p>
        <Link
          to="/app/ea/authorize-account"
          className="mt-5 inline-flex rounded-md bg-pink px-5 py-2.5 text-sm font-medium text-ink hover:bg-white"
        >
          Authorize account
        </Link>
      </DocSection>

      <DocSection id="faq" title="FAQ">
        <dl className="space-y-5">
          {faqs.map((faq) => (
            <div key={faq.q}>
              <dt className="font-medium text-white">{faq.q}</dt>
              <dd className="mt-1 text-sm text-fog">{faq.a}</dd>
            </div>
          ))}
        </dl>
      </DocSection>
    </div>
  );
}

function DocSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="mb-4 font-display text-2xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}