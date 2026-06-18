import Link from "next/link";
import { v2Tokens } from "@/components/v2/theme";
import { V2ThemeToggle } from "@/components/v2/V2ThemeToggle";
import type { V2Theme } from "@/components/v2/types";

type Props = { sidebarOpen: boolean; onToggleSidebar: () => void; theme: V2Theme; onThemeChange: (theme: V2Theme) => void; taskState: string };

export function V2TopBar({ sidebarOpen, onToggleSidebar, theme, onThemeChange, taskState }: Props) {
  const pills = ["Deterministic Solver", "Local Agent", "V2 Workspace"];
  return <header className={`${v2Tokens.topBar} ${v2Tokens.topBarTone}`}>
    <div className="flex items-center justify-between gap-3 px-3 py-2.5 sm:px-4">
      <div className="flex min-w-0 items-center gap-3">
        <button aria-label="Toggle navigation" className="grid h-10 w-10 place-items-center rounded-xl border border-v2-border bg-v2-control text-v2-muted transition hover:border-amber-600/60 hover:text-amber-500" onClick={onToggleSidebar}>{sidebarOpen ? "◀" : "☰"}</button>
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-amber-700/35 bg-amber-900/15 font-semibold text-amber-500 shadow-inner shadow-amber-950/20">MS</div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-amber-500">MechSynthCAD V2</p>
          <h1 className="truncate text-sm font-semibold sm:text-base">AI engineering workspace</h1>
        </div>
      </div>
      <div className="hidden min-w-0 items-center justify-center gap-2 lg:flex">
        {pills.map((pill) => <span key={pill} className={v2Tokens.pill}>{pill}</span>)}
        <span className="rounded-full border border-amber-700/30 bg-amber-900/10 px-3 py-1 text-xs font-medium text-amber-500">{taskState}</span>
      </div>
      <div className="flex items-center gap-2">
        <V2ThemeToggle theme={theme} onThemeChange={onThemeChange} />
        <Link href="/" className="hidden rounded-xl border border-v2-border bg-v2-control px-3 py-2 text-xs font-semibold text-v2-muted transition hover:text-amber-500 sm:inline-flex">Classic Supervisor View</Link>
      </div>
    </div>
  </header>;
}
