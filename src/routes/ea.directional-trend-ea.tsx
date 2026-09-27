import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, BarChart3, ShieldCheck, TrendingUp } from "lucide-react";
import { SiteLayout, CtaBand } from "@/components/site/site-layout";
import { Panel } from "@/components/pink/primitives";

export const Route = createFileRoute("/ea/directional-trend-ea")({
  head: () => ({
    meta: [
      { title: "DirectionalTrendEA — MT5 trend-following algorithm" },
      {
        name: "description",
        content: "A disciplined, single-position trend-following algorithm for MetaTrader 5 with private performance reporting.",
      },
      { property: "og:title", content: "DirectionalTrendEA for MetaTrader 5" },
      {
        property: "og:description",
        content: "A disciplined MT5 trend-following service with controlled risk and private performance reporting.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EaServicePage,
});

const servicePoints = [
  {
    icon: TrendingUp,
    title: "Direction confirmed",
    copy: "Multiple independent trend and momentum conditions must agree before an entry is considered.",
  },
  {
    icon: ShieldCheck,
    title: "Risk bounded",
    copy: "Every trade uses a stop-loss, with an optional hard dollar loss limit configured inside MT5.",
  },
  {
    icon: Activity,
    title: "One position",
    copy: "The strategy holds at most one market position, without grids, averaging, or pyramiding.",
  },
  {
    icon: BarChart3,
    title: "Private reporting",
    copy: "Your EA reports account snapshots and completed trades to a dashboard visible only after sign-in.",
  },
];

function EaServicePage() {
  return (
    <SiteLayout>
      <section className="border-b border-line">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-pink">MetaTrader 5 algorithm</p>
          <h1 className="mt-5 max-w-4xl font-display text-4xl font-semibold leading-[1.05] lg:text-6xl">
            DirectionalTrendEA
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-fog">
            A focused trend-following service that waits for directional agreement, limits exposure to one
            position, and keeps your trading record visible in one private workspace.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/signup" className="rounded-md bg-pink px-5 py-3 font-medium text-ink hover:bg-white">
              Get started
            </Link>
            <Link to="/login" className="rounded-md border border-line px-5 py-3 text-white hover:bg-panel">
              Sign in to EA workspace
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-4 md:grid-cols-2">
          {servicePoints.map(({ icon: Icon, title, copy }) => (
            <Panel key={title}>
              <Icon className="size-5 text-pink" />
              <h2 className="mt-4 font-display text-xl font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-fog">{copy}</p>
            </Panel>
          ))}
        </div>
        <p className="mt-8 max-w-3xl text-sm leading-relaxed text-mute">
          Trading foreign exchange, metals, and CFDs involves substantial risk. DirectionalTrendEA does not
          guarantee profit, and past or backtested performance does not predict future results.
        </p>
      </section>
      <CtaBand />
    </SiteLayout>
  );
}