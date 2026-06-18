import { V2ModelSettingsPanel } from "@/components/v2/V2ModelSettingsPanel";
import { V2ThemeToggle } from "@/components/v2/V2ThemeToggle";
import type { V2Theme } from "@/components/v2/types";

export function V2SettingsPanel({ theme, onThemeChange }: { theme: V2Theme; onThemeChange: (theme: V2Theme) => void }) {
  const sections = [
    ["General", "V2 AI engineering desktop at `/v2`; the classic supervisor/reference interface remains at `/`."],
    ["Agents", "Local deterministic agent adapter with placeholder tool permissions and no external model calls."],
    ["Models", "Provider cards are disabled until a future integration explicitly connects them."],
    ["Theme", "Dark, light, and system modes use shared V2 surface, border, muted text, and amber accent tokens."],
    ["Solver", "Deterministic backend endpoints remain the numerical source of truth for Four-Bar and Slider-Crank."],
    ["Reports", "Markdown export and browser print/save-as-PDF remain available through existing report flows."],
    ["About", "MechSynthCAD supports planar mechanism analysis, synthesis direction, validation, and report preparation."],
  ];
  return <section className="v2-surface border-v2-border rounded-[1.5rem] border p-5">
    <div><p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-500">Settings</p><h2 className="mt-2 text-2xl font-semibold">Workspace configuration</h2></div>
    <div className="mt-5 grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)]"><nav className="flex gap-2 overflow-x-auto lg:flex-col">{sections.map(([title]) => <a key={title} href={`#v2-${title}`} className="shrink-0 rounded-xl border border-v2-border bg-v2-control px-3 py-2 text-sm font-semibold text-v2-muted hover:text-amber-500">{title}</a>)}</nav><div className="space-y-4"><article id="v2-Theme" className="rounded-[1.25rem] border border-v2-border bg-v2-control p-5"><p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-500">Theme</p><div className="mt-3"><V2ThemeToggle theme={theme} onThemeChange={onThemeChange} /></div><p className="mt-2 text-sm text-v2-muted">Theme settings apply across shell, sidebar, workspace, inspector, reports, validation, and composer.</p></article><V2ModelSettingsPanel /><div className="grid gap-4 md:grid-cols-2">{sections.filter(([title]) => title !== "Theme" && title !== "Models").map(([title, body]) => <article id={`v2-${title}`} key={title} className="rounded-[1.25rem] border border-v2-border bg-v2-control p-5"><h3 className="font-semibold text-amber-500">{title}</h3><p className="mt-2 text-sm leading-6 text-v2-muted">{body}</p></article>)}</div></div></div>
  </section>;
}
