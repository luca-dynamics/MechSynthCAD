import type { V2ResolvedTheme } from "@/components/v2/types";

export const v2ThemeClass: Record<V2ResolvedTheme, string> = {
  dark: "v2-dark bg-v2-shell text-v2-text",
  light: "v2-light bg-v2-shell text-v2-text",
};

export const v2Tokens = {
  shell: "relative min-h-screen overflow-x-hidden pb-44 transition-colors before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_18%_0%,rgba(217,119,6,0.10),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.04),transparent_34%)] before:content-['']",
  topBar: "sticky top-0 z-40 border-b backdrop-blur-2xl",
  topBarTone: "bg-v2-topbar/90 border-v2-border",
  surface: "v2-surface border-v2-border rounded-[1.35rem] border shadow-[0_18px_70px_rgba(0,0,0,0.24)]",
  surfaceSoft: "v2-surface-soft border-v2-border rounded-[1.15rem] border",
  accentText: "text-amber-500",
  button: "rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-amber-950/30 transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:bg-stone-600",
  ghostButton: "rounded-xl border border-v2-border bg-v2-control px-3 py-2 text-sm font-semibold text-v2-muted transition hover:border-amber-600/60 hover:text-amber-500",
  input: "rounded-xl border border-v2-border bg-v2-input px-3 py-2 outline-none transition focus:border-amber-600",
  pill: "rounded-full border border-v2-border bg-v2-control px-3 py-1 text-xs font-medium text-v2-muted",
};
