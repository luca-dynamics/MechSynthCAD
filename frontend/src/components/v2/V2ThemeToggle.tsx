import type { V2Theme } from "@/components/v2/types";

export function V2ThemeToggle({ theme, onThemeChange }: { theme: V2Theme; onThemeChange: (theme: V2Theme) => void }) {
  return <label className="flex items-center gap-2 rounded-xl border border-v2-border bg-v2-control px-2 py-1.5 text-xs text-v2-muted">
    <span className="hidden sm:inline">Theme</span>
    <select className="bg-transparent text-sm font-semibold outline-none" value={theme} onChange={(event) => onThemeChange(event.target.value as V2Theme)}>
      <option value="dark">Dark</option>
      <option value="light">Light</option>
      <option value="system">System</option>
    </select>
  </label>;
}
