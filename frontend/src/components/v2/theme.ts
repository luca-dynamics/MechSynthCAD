import type { V2ResolvedTheme } from "@/components/v2/types";

export const v2ThemeClass: Record<V2ResolvedTheme, string> = {
  dark: "v2-dark bg-[#11100f] text-stone-100",
  light: "v2-light bg-[#f3f0ea] text-stone-950",
};

export const v2Tokens = {
  shell: "min-h-screen pb-36 transition-colors",
  topBar: "sticky top-0 z-40 border-b backdrop-blur-xl",
  topBarTone: "v2-surface border-v2-border",
  surface: "v2-surface border-v2-border rounded-2xl border shadow-[0_18px_60px_rgba(0,0,0,0.18)]",
  surfaceSoft: "v2-surface-soft border-v2-border rounded-2xl border",
  accentText: "text-amber-500",
  button: "rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:bg-stone-600",
  ghostButton: "rounded-xl border border-v2-border px-3 py-2 text-sm font-semibold transition hover:border-amber-600 hover:text-amber-500",
  input: "rounded-xl border border-v2-border bg-v2-input px-3 py-2 outline-none transition focus:border-amber-600",
};
