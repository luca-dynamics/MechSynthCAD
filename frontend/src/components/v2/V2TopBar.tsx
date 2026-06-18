import Link from "next/link";
import { v2Tokens } from "@/components/v2/theme";
import { V2ThemeToggle } from "@/components/v2/V2ThemeToggle";
import type { V2Theme } from "@/components/v2/types";

type Props = { sidebarOpen: boolean; onToggleSidebar: () => void; theme: V2Theme; onThemeChange: (theme: V2Theme) => void; taskState: string };

export function V2TopBar({ sidebarOpen, onToggleSidebar, theme, onThemeChange, taskState }: Props) {
  return <header className={`${v2Tokens.topBar} ${v2Tokens.topBarTone}`}>
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <button className={v2Tokens.ghostButton} onClick={onToggleSidebar}>{sidebarOpen ? "Hide nav" : "Show nav"}</button>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-500">MechSynthCAD V2</p>
          <h1 className="truncate text-base font-semibold">AI engineering workspace</h1>
        </div>
      </div>
      <div className="hidden items-center gap-2 rounded-full border border-v2-border px-3 py-2 text-xs text-v2-muted md:flex">
        <span className="h-2 w-2 rounded-full bg-amber-500" /> {taskState}
      </div>
      <div className="flex items-center gap-2">
        <V2ThemeToggle theme={theme} onThemeChange={onThemeChange} />
        <Link href="/" className={v2Tokens.ghostButton}>Classic Supervisor View</Link>
      </div>
    </div>
  </header>;
}
