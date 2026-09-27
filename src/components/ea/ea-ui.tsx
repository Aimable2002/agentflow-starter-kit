import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { isOffline, type EaAccount } from "@/lib/ea";

export function EaStatusBadge({ status }: { status: string }) {
  const active = status === "active";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px]",
        active ? "border-mint/40 bg-mint/10 text-mint" : "border-amber/40 bg-amber/10 text-amber",
      )}
    >
      <span className={cn("size-1.5 rounded-full", active ? "bg-mint" : "bg-amber")} />
      {active ? "Active" : "Pending activation"}
    </span>
  );
}

export function LastSeen({ account }: { account: EaAccount }) {
  if (!account.last_seen_at)
    return <span className="font-mono text-xs text-mute">Never checked in</span>;
  const offline = isOffline(account);
  return (
    <span className={cn("font-mono text-xs", offline ? "text-amber" : "text-fog")}>
      Last seen {formatDistanceToNow(new Date(account.last_seen_at), { addSuffix: true })}
      {offline && " · may be offline"}
    </span>
  );
}

export function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-mute">{label}</p>
      <div className="mt-1.5 flex items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded-md border border-line bg-ink2 px-3 py-2 font-mono text-xs text-white">
          {value}
        </code>
        <button
          type="button"
          aria-label={`Copy ${label}`}
          onClick={async () => {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="rounded-md border border-line bg-ink2 p-2 text-fog hover:text-white"
        >
          {copied ? <Check className="size-4 text-mint" /> : <Copy className="size-4" />}
        </button>
      </div>
    </div>
  );
}

export function Stat({ label, value, tone }: { label: string; value: string; tone?: "pos" | "neg" | undefined }) {
  return (
    <div className="rounded-lg border border-line bg-panel p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-mute">{label}</p>
      <p
        className={cn(
          "mt-2 font-display text-lg font-semibold",
          tone === "pos" && "text-mint",
          tone === "neg" && "text-pink",
        )}
      >
        {value}
      </p>
    </div>
  );
}
