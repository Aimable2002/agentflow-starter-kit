import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/app-shell";
import { EaDocumentation, eaDocSections } from "@/components/ea/ea-documentation";

export const Route = createFileRoute("/app/ea/documentation")({
  head: () => ({
    meta: [
      { title: "EA documentation | DirectionalTrendEA" },
      { name: "description", content: "Setup, operation, risk information and answers for DirectionalTrendEA." },
      { property: "og:title", content: "DirectionalTrendEA documentation" },
      { property: "og:description", content: "Setup, operation, risk information and answers for DirectionalTrendEA." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DocumentationPage,
});

function DocumentationPage() {
  return (
    <div>
      <PageHeader title="EA documentation" copy="Everything you need to install, configure, and understand DirectionalTrendEA." />
      <nav className="sticky top-16 z-20 border-b border-line bg-ink/95 px-4 py-3 backdrop-blur lg:px-8">
        <div className="flex gap-5 overflow-x-auto font-mono text-xs text-fog">
          {eaDocSections.map(([id, label]) => (
            <a key={id} href={`#${id}`} className="whitespace-nowrap hover:text-white">{label}</a>
          ))}
        </div>
      </nav>
      <div className="max-w-4xl px-4 py-10 lg:px-8">
        <EaDocumentation />
      </div>
    </div>
  );
}