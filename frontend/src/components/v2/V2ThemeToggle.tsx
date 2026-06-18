import type { V2Theme } from "@/components/v2/types";

export function V2ThemeToggle({ theme, onThemeChange }: { theme: V2Theme; onThemeChange: (theme: V2Theme) => void }) {
  return <label className="hidden items-center gap-2 rounded-xl border border-v2-border px-2 py-1 text-xs text-v2-muted sm:flex">
    Theme
    <select className="bg-transparent text-sm font-semibold outline-none" value={theme} onChange={(event) => onThemeChange(event.target.value as V2Theme)}>
      <option value="dark">Dark</option>
      <option value="light">Light</option>
      <option value="system">System</option>
    </select>
  </label>;
}
