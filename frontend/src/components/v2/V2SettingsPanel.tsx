import { V2ModelSettingsPanel } from "@/components/v2/V2ModelSettingsPanel";
import { V2ThemeToggle } from "@/components/v2/V2ThemeToggle";
import type { V2Theme } from "@/components/v2/types";

export function V2SettingsPanel({ theme, onThemeChange }: { theme: V2Theme; onThemeChange: (theme: V2Theme) => void }) {
  const sections = [
    ["General", "Workspace mode: V2 AI engineering desktop. The classic supervisor/reference interface remains available at `/`; this interface lives at `/v2`."],
    ["Agents", "Agent mode: Deterministic Engineering Agent. Tool permission controls are placeholders; the source-of-truth rule is deterministic backend solvers only."],
    ["Solver", "Numerical source: deterministic backend solver endpoints. Supported mechanisms: Four-Bar and Slider-Crank. No solver math is changed here."],
    ["Reports", "Reports support Markdown export and browser print/save as PDF using existing report generation flows."],
    ["About", "MechSynthCAD is an AI-assisted CAD-based system for planar mechanism analysis, synthesis direction, validation, and report preparation."],
  ];
  return <section className="v2-surface border-v2-border space-y-4 rounded-3xl border p-5">
    <div><p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-500">Settings</p><h2 className="mt-2 text-2xl font-semibold">Workspace configuration</h2></div>
    <div className="rounded-3xl border border-v2-border p-5"><p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-500">Theme</p><div className="mt-3"><V2ThemeToggle theme={theme} onThemeChange={onThemeChange} /></div><p className="mt-2 text-sm text-v2-muted">Dark, light, and system modes apply through V2 theme tokens across the shell, sidebar, workspace, inspector, reports, validation, and composer.</p></div>
    <V2ModelSettingsPanel />
    <div className="grid gap-4 md:grid-cols-2">{sections.map(([title, body]) => <article key={title} className="rounded-3xl border border-v2-border bg-black/5 p-5"><h3 className="font-semibold text-amber-500">{title}</h3><p className="mt-2 text-sm leading-6 text-v2-muted">{body}</p></article>)}</div>
  </section>;
}
