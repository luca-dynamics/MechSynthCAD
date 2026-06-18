import { V2ModelSettingsPanel } from "@/components/v2/V2ModelSettingsPanel";
import { V2ThemeToggle } from "@/components/v2/V2ThemeToggle";
import type { V2Theme } from "@/components/v2/types";

export function V2SettingsPanel({ theme, onThemeChange }: { theme: V2Theme; onThemeChange: (theme: V2Theme) => void }) {
  return <section className="v2-surface border-v2-border rounded-[1.5rem] border p-5">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-500">Studio settings</p><h2 className="mt-2 text-2xl font-semibold">Agent workspace controls</h2></div><V2ThemeToggle theme={theme} onThemeChange={onThemeChange} /></div>
    <div className="mt-5 grid gap-4"><V2ModelSettingsPanel /><article className="rounded-[1.25rem] border border-v2-border bg-[#0d0c0b] p-5"><p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-500">Product mode</p><div className="mt-3 grid gap-3 md:grid-cols-3"><Tile title="Chat-first" body="Composer lives in the center mission panel." /><Tile title="Artifact panels" body="CAD, charts, tables, reports, and validation render as workspace artifacts." /><Tile title="Deterministic truth" body="Existing solvers remain the source of numerical results." /></div></article></div>
  </section>;
}
function Tile({ title, body }: { title: string; body: string }) { return <div className="rounded-2xl border border-v2-border bg-[#080807] p-4"><p className="font-semibold">{title}</p><p className="mt-2 text-sm text-v2-muted">{body}</p></div>; }
