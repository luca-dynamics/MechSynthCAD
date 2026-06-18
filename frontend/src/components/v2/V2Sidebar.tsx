import type { V2NavItem } from "@/components/v2/types";

const items: Array<{ item: V2NavItem; icon: string; caption: string }> = [
  { item: "Overview", icon: "⌁", caption: "Mission state" },
  { item: "Workspace", icon: "▧", caption: "CAD canvas" },
  { item: "Results", icon: "∑", caption: "Solver + synthesis" },
  { item: "Agent", icon: "✦", caption: "Thread" },
  { item: "Reports", icon: "▤", caption: "Export" },
  { item: "Validation", icon: "✓", caption: "Checks" },
  { item: "Settings", icon: "⚙", caption: "Modes" },
];

export function V2Sidebar({ active, onSelect, open }: { active: V2NavItem; onSelect: (item: V2NavItem) => void; open: boolean }) {
  if (!open) return null;
  return <aside className="v2-surface border-v2-border fixed inset-y-0 left-0 z-50 w-72 border-r p-4 pt-20 shadow-2xl lg:sticky lg:top-[65px] lg:z-auto lg:h-[calc(100vh-81px)] lg:w-auto lg:rounded-2xl lg:border lg:pt-4">
    <div className="mb-5 rounded-2xl border border-amber-700/30 bg-amber-900/10 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-500">Deterministic agent</p>
      <p className="mt-1 text-xs text-v2-muted">Solver outputs are the numerical source of truth.</p>
    </div>
    <nav className="space-y-2">
      {items.map(({ item, icon, caption }) => <button key={item} onClick={() => onSelect(item)} className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${active === item ? "bg-amber-600 text-white shadow-lg shadow-amber-950/30" : "hover:bg-amber-950/10"}`}>
        <span className="grid h-9 w-9 place-items-center rounded-xl border border-v2-border bg-black/10 text-lg">{icon}</span>
        <span><span className="block text-sm font-semibold">{item}</span><span className={`block text-xs ${active === item ? "text-amber-100" : "text-v2-muted"}`}>{caption}</span></span>
      </button>)}
    </nav>
  </aside>;
}
