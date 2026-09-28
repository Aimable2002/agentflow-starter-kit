import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import manifest from "../../directional-ea/releases.json";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/integrations/supabase/client";
import type { EaRelease } from "@/lib/ea";

// Every .ex5 in directional-ea/ is embedded server-side as a data URL; never shipped to the browser bundle.
const files = import.meta.glob("../../directional-ea/**/*.ex5", {
  query: "?inline",
  import: "default",
}) as Record<string, () => Promise<string>>;

async function requireUser() {
  const auth = getRequest().headers.get("authorization");
  const token = auth?.replace(/^Bearer\s+/i, "");
  if (!token) throw new Error("Please sign in to access EA releases.");
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) throw new Error("Please sign in to access EA releases.");
}

function published(): EaRelease[] {
  return (manifest as Omit<EaRelease, "id">[])
    .filter((r) => r.status === "published")
    .map((r) => ({ ...r, id: r.version }))
    .sort((a, b) => new Date(b.released_at).getTime() - new Date(a.released_at).getTime());
}

export const listEaReleases = createServerFn({ method: "GET" }).handler(async () => {
  await requireUser();
  return published();
});

export const downloadEaRelease = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ version: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    await requireUser();
    const release = published().find((r) => r.version === data.version);
    if (!release) throw new Error("This release is not available.");
    const loader = files[`../../directional-ea/${release.file_path}`];
    if (!loader) throw new Error("This release file is not available. Please contact support.");
    const dataUrl = await loader();
    return { fileName: release.file_name, base64: dataUrl.slice(dataUrl.indexOf(",") + 1) };
  });
