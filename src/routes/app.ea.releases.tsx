import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, FileArchive, Search, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import { PageHeader } from "@/components/app/app-shell";
import { Panel } from "@/components/pink/primitives";
import { createReleaseDownloadUrl, useEaReleases, type EaRelease } from "@/lib/ea";

export const Route = createFileRoute("/app/ea/releases")({
  head: () => ({
    meta: [
      { title: "EA releases | DirectionalTrendEA" },
      { name: "description", content: "Download published DirectionalTrendEA versions and review their release notes." },
      { property: "og:title", content: "DirectionalTrendEA releases" },
      { property: "og:description", content: "Official published versions and release history for DirectionalTrendEA." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReleasesPage,
});

function ReleasesPage() {
  const { data: releases = [], isLoading, error } = useEaReleases();
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return releases;
    return releases.filter((release) =>
      `${release.version} ${release.release_notes ?? ""} ${release.file_name}`.toLowerCase().includes(needle),
    );
  }, [query, releases]);
  const latest = filtered[0];

  return (
    <div>
      <PageHeader title="EA releases" copy="The official source for published DirectionalTrendEA algorithm versions." />
      <div className="space-y-8 px-4 py-6 lg:px-8">
        {isLoading && <p className="text-sm text-mute">Loading published releases…</p>}
        {error && <Panel><p className="text-sm text-pink">Published releases could not be loaded.</p></Panel>}
        {!isLoading && !error && releases.length === 0 && (
          <Panel className="text-center">
            <FileArchive className="mx-auto size-8 text-mute" />
            <p className="mt-3 font-display text-lg">No release published yet</p>
            <p className="mt-1 text-sm text-fog">The first approved algorithm version will appear here.</p>
          </Panel>
        )}
        {latest && (
          <section>
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.14em] text-mint">Latest stable release</p>
            <ReleaseCard release={latest} featured />
          </section>
        )}
        {releases.length > 1 && (
          <section>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <h2 className="font-display text-xl font-semibold">Version history</h2>
              <label className="relative sm:ml-auto">
                <span className="sr-only">Search releases</span>
                <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-mute" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search versions or notes"
                  className="w-full rounded-md border border-line bg-ink2 py-2 pl-9 pr-3 text-sm text-white outline-none focus:border-pink/50 sm:w-72"
                />
              </label>
            </div>
            <div className="space-y-3">
              {filtered.slice(1).map((release) => <ReleaseCard key={release.id} release={release} />)}
              {filtered.length === 0 && <p className="text-sm text-mute">No published releases match that search.</p>}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function ReleaseCard({ release, featured = false }: { release: EaRelease; featured?: boolean }) {
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const size = release.file_size_bytes == null ? null : formatBytes(release.file_size_bytes);
  return (
    <Panel accent={featured}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-xl font-semibold">DirectionalTrendEA v{release.version}</h3>
            <span className="rounded border border-mint/30 bg-mint/10 px-2 py-0.5 font-mono text-[10px] uppercase text-mint">
              Published
            </span>
          </div>
          <p className="mt-1 font-mono text-xs text-mute">Released {format(new Date(release.released_at), "PP")}</p>
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-fog">
            {release.release_notes || "No release notes were supplied."}
          </p>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[11px] text-mute">
            <span>{release.file_name}</span>
            {size && <span>{size}</span>}
            {release.minimum_mt5_build && <span>MT5 build {release.minimum_mt5_build}+</span>}
            {release.checksum_sha256 && (
              <span className="inline-flex items-center gap-1" title={release.checksum_sha256}>
                <ShieldCheck className="size-3.5 text-mint" /> SHA-256 {release.checksum_sha256.slice(0, 12)}…
              </span>
            )}
          </div>
          {downloadError && <p className="mt-3 text-xs text-pink">{downloadError}</p>}
        </div>
        <button
          type="button"
          disabled={downloading}
          onClick={async () => {
            setDownloading(true);
            setDownloadError(null);
            try {
              const url = await createReleaseDownloadUrl(release.file_path);
              window.location.assign(url);
            } catch (caught) {
              setDownloadError(caught instanceof Error ? caught.message : "Download could not be started.");
              setDownloading(false);
            }
          }}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-pink px-5 py-2.5 text-sm font-medium text-ink hover:bg-white disabled:opacity-50"
        >
          <Download className="size-4" /> {downloading ? "Preparing…" : "Download"}
        </button>
      </div>
    </Panel>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}