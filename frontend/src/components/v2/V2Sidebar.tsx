import type { V2NavItem } from "@/components/v2/types";

const topItems: Array<{ item: V2NavItem; icon: string; caption: string }> = [
  { item: "Overview", icon: "⌁", caption: "Mission state" },
  { item: "Workspace", icon: "▧", caption: "CAD canvas" },
  { item: "Results", icon: "∑", caption: "Solver + synthesis" },
  { item: "Agent", icon: "✧", caption: "Tool-run thread" },
  { item: "Reports", icon: "▤", caption: "Export package" },
  { item: "Validation", icon: "✓", caption: "Capability matrix" },
];
const bottomItem = { item: "Settings" as V2NavItem, icon: "⚙", caption: "Workspace modes" };

export function V2Sidebar({ active, onSelect, open }: { active: V2NavItem; onSelect: (item: V2NavItem) => void; open: boolean }) {
  const items = [...topItems, bottomItem];
  return <aside className={`${open ? "w-72 lg:w-auto" : "w-[76px]"} v2-surface border-v2-border fixed inset-y-0 left-0 z-50 border-r p-3 pt-16 shadow-2xl transition-all lg:sticky lg:top-[65px] lg:z-auto lg:flex lg:h-[calc(100vh-81px)] lg:flex-col lg:rounded-[1.35rem] lg:border lg:pt-3`}>
    {open ? <div className="mb-4 rounded-2xl border border-amber-700/25 bg-amber-900/10 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-500">Deterministic agent</p>
      <p className="mt-1 text-xs leading-5 text-v2-muted">Backend solvers remain the numerical source of truth.</p>
    </div> : null}
    <nav className="flex min-h-0 flex-1 flex-col gap-1.5">
      {items.map(({ item, icon, caption }, index) => <button key={item} onClick={() => onSelect(item)} title={item} className={`${index === topItems.length ? "mt-auto" : ""} group flex w-full items-center gap-3 rounded-2xl px-2.5 py-2.5 text-left transition ${active === item ? "border border-amber-700/30 bg-amber-900/15 text-amber-500 shadow-inner shadow-amber-950/10" : "border border-transparent text-v2-muted hover:border-v2-border hover:bg-v2-control hover:text-v2-text"}`}>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-v2-border bg-v2-control text-sm">{icon}</span>
        {open ? <span className="min-w-0"><span className="block text-sm font-semibold">{item}</span><span className="block truncate text-xs text-v2-muted">{caption}</span></span> : null}
      </button>)}
    </nav>
  </aside>;
}
