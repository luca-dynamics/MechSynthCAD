"use client";

import { useState } from "react";
import { V2ModelSettingsPanel } from "@/components/v2/V2ModelSettingsPanel";
import { V2ThemeToggle } from "@/components/v2/V2ThemeToggle";
import type { V2Theme } from "@/components/v2/types";

type SettingsTab = "general" | "models" | "appearance" | "connectors";

const tabs: { id: SettingsTab; label: string; meta: string }[] = [
  { id: "general", label: "General", meta: "Workspace behavior" },
  { id: "models", label: "Models", meta: "Cloud + BYOK" },
  { id: "appearance", label: "Appearance", meta: "Theme" },
  { id: "connectors", label: "Connectors", meta: "Tools" },
];

export function V2SettingsPanel({ theme, onThemeChange }: { theme: V2Theme; onThemeChange: (theme: V2Theme) => void }) {
  const [tab, setTab] = useState<SettingsTab>("models");
  return <section className="grid min-h-[calc(100vh-1rem)] place-items-center p-3">
    <div className="grid h-[min(760px,calc(100vh-2rem))] w-full max-w-6xl overflow-hidden rounded-[1.5rem] border border-v2-border bg-[#080807] shadow-2xl shadow-black/50 md:grid-cols-[250px_minmax(0,1fr)]">
      <aside className="border-b border-v2-border bg-[#0b0a09] p-3 md:border-b-0 md:border-r">
        <div className="px-3 py-3"><p className="text-[11px] font-bold uppercase tracking-[0.28em] text-amber-500">App Settings</p><h2 className="mt-2 text-xl font-semibold">MechSynthCAD</h2></div>
        <nav className="mt-2 space-y-1">{tabs.map((entry) => <button key={entry.id} onClick={() => setTab(entry.id)} className={`w-full rounded-xl px-3 py-2.5 text-left transition ${tab === entry.id ? "bg-amber-500/10 text-v2-text" : "text-v2-muted hover:bg-white/[0.03] hover:text-v2-text"}`}><span className="block text-sm font-semibold">{entry.label}</span><span className="mt-0.5 block text-[11px] text-v2-muted">{entry.meta}</span></button>)}</nav>
      </aside>
      <div className="v2-scrollbar overflow-y-auto bg-[#0d0c0b] p-5 md:p-7">
        {tab === "models" ? <V2ModelSettingsPanel /> : null}
        {tab === "general" ? <Panel title="General" kicker="Product mode"><div className="grid gap-3 md:grid-cols-3"><Tile title="Chat-first" body="Agent prompt remains in the mission center, with parameter cards rendered only when needed." /><Tile title="Artifacts" body="CAD, charts, reports, validation, and presentations render as workspace panels." /><Tile title="Deterministic solvers" body="Mechanism math remains delegated to the existing backend endpoints." /></div></Panel> : null}
        {tab === "appearance" ? <Panel title="Appearance" kicker="Theme"><div className="flex items-center justify-between rounded-2xl border border-v2-border bg-[#080807] p-4"><div><p className="font-semibold">Workspace theme</p><p className="mt-1 text-sm text-v2-muted">Claude Desktop-style settings shell with graphite surfaces.</p></div><V2ThemeToggle theme={theme} onThemeChange={onThemeChange} /></div></Panel> : null}
        {tab === "connectors" ? <Panel title="Connectors" kicker="Tool providers"><div className="grid gap-3 md:grid-cols-2"><Tile title="Mechanism solvers" body="Four-bar and slider-crank deterministic tools are available." /><Tile title="Reports" body="Markdown, print, and PDF-oriented report builder remains available." /><Tile title="Model auth providers" body="OpenAI, Anthropic, and Gemini account-connect buttons appear when OAuth handoff URLs are configured." /><Tile title="BYOK" body="User keys are verified live through server routes and are not saved by the settings UI." /></div></Panel> : null}
      </div>
    </div>
  </section>;
}

function Panel({ title, kicker, children }: { title: string; kicker: string; children: React.ReactNode }) { return <section className="rounded-[1.25rem] border border-v2-border bg-[#0d0c0b] p-5"><p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-500">{kicker}</p><h3 className="mt-2 text-lg font-semibold">{title}</h3><div className="mt-5">{children}</div></section>; }
function Tile({ title, body }: { title: string; body: string }) { return <div className="rounded-2xl border border-v2-border bg-[#080807] p-4"><p className="font-semibold">{title}</p><p className="mt-2 text-sm leading-6 text-v2-muted">{body}</p></div>; }
