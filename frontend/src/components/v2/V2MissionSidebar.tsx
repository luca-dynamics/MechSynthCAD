import type { V2NavItem } from "@/components/v2/types";

const nav: { label: string; item: V2NavItem; meta: string }[] = [
  { label: "Workspace Dashboard", item: "Workspace", meta: "Command center" },
  { label: "Active Mission", item: "Agent", meta: "Execution stream" },
  { label: "Four-Bar Analysis", item: "Results", meta: "Linkage solver" },
  { label: "Slider-Crank Analysis", item: "Results", meta: "Crank solver" },
  { label: "Simulation Runs", item: "Results", meta: "Sweep tools" },
  { label: "Reports", item: "Reports", meta: "Markdown / PDF" },
  { label: "Validation", item: "Validation", meta: "Truth matrix" },
  { label: "Settings", item: "Settings", meta: "Theme / config" },
];

const sessions = ["Current Workspace", "Four-Bar Solver Session", "Slider-Crank Solver Session", "Report Builder Session"];
const milestones = ["Parameter intake", "Deterministic analysis", "Sweep simulation", "Result interpretation", "Design recommendation", "Report generation", "Validation review"];

export function V2MissionSidebar({ active, onSelect, open }: { active: V2NavItem; onSelect: (item: V2NavItem) => void; open: boolean }) {
  return <aside className={`${open ? "block" : "hidden lg:block"} v2-panel v2-scrollbar h-[calc(100vh-1rem)] overflow-y-auto rounded-[1.4rem] border border-v2-border bg-[#080807] p-3 lg:sticky lg:top-2`}>
    <div className="mb-4 flex items-center gap-3 rounded-2xl border border-v2-border bg-[#0d0c0b] p-3">
      <div className="grid h-9 w-9 place-items-center rounded-xl border border-amber-600/30 bg-amber-500/10 text-sm font-black text-amber-500">MS</div>
      {open ? <div><p className="text-sm font-semibold">MechSynth Agent</p><p className="text-[11px] text-v2-muted">Local deterministic workspace</p></div> : null}
    </div>
    <Section title="Missions">
      {nav.map((entry) => <button key={entry.label} onClick={() => onSelect(entry.item)} className={`group w-full rounded-xl border px-3 py-2 text-left transition ${active === entry.item ? "border-amber-600/35 bg-amber-500/10 text-v2-text" : "border-transparent text-v2-muted hover:border-v2-border hover:bg-white/[0.025] hover:text-v2-text"}`}>
        <span className="flex items-center gap-2 text-sm font-semibold"><span className={`h-1.5 w-1.5 rounded-full ${active === entry.item ? "bg-amber-500" : "bg-stone-600"}`} />{open ? entry.label : entry.label.slice(0, 2)}</span>
        {open ? <span className="mt-0.5 block pl-3.5 text-[11px] text-v2-muted">{entry.meta}</span> : null}
      </button>)}
    </Section>
    {open ? <>
      <Section title="Mission History">{sessions.map((session, index) => <div key={session} className="flex items-center justify-between rounded-xl border border-v2-border bg-[#0d0c0b] px-3 py-2 text-xs"><span>{session}</span><span className="text-v2-muted">S{index + 1}</span></div>)}</Section>
      <Section title="Task Plan">{milestones.map((step, index) => <div key={step} className="flex gap-2 rounded-xl px-2 py-1.5 text-xs text-v2-muted"><span className={`mt-1 h-2 w-2 rounded-full ${index < 2 ? "bg-amber-500" : "bg-stone-700"}`} /><span>{step}</span></div>)}</Section>
    </> : null}
  </aside>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) { return <div className="mb-5 space-y-1.5"><p className="px-2 text-[10px] font-bold uppercase tracking-[0.24em] text-stone-500">{title}</p>{children}</div>; }
