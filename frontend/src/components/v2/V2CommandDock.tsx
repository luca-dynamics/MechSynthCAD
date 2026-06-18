import { FormEvent, useState } from "react";
import type { MechanismType } from "@/types";
import type { V2NavItem, V2ProviderId, V2ProviderStatus } from "@/components/v2/types";

type Chip = { label: string; action: () => void; disabled?: boolean; hint?: string };

export function V2CommandDock({ onSubmit, activeProvider, providers, onProviderSelect, onMechanismSelect, onNavigate }: { onSubmit: (command: string, modelProvider?: V2ProviderId) => void; activeProvider: V2ProviderId; providers: V2ProviderStatus[]; onProviderSelect: (provider: V2ProviderId) => void; onMechanismSelect: (mechanism: MechanismType) => void; onNavigate: (item: V2NavItem) => void }) {
  const [value, setValue] = useState("");
  function submit(event: FormEvent) { event.preventDefault(); const command = value.trim(); if (!command) return; onSubmit(command, activeProvider); setValue(""); }
  const byId = Object.fromEntries(providers.map((p) => [p.id, p]));
  const chips: Chip[] = [
    { label: "Local Agent", action: () => onProviderSelect("local") },
    { label: "GPT", action: () => onProviderSelect("openai"), hint: byId.openai?.message },
    { label: "Claude", action: () => onProviderSelect("anthropic"), hint: byId.anthropic?.message },
    { label: "Gemini", action: () => onProviderSelect("gemini"), hint: byId.gemini?.message },
    { label: "BYOK", action: () => onNavigate("Settings") },
    { label: "Four-Bar", action: () => onMechanismSelect("four_bar") },
    { label: "Slider-Crank", action: () => onMechanismSelect("slider_crank") },
    { label: "Charts", action: () => onSubmit("Run simulation", activeProvider) },
    { label: "Reports", action: () => onNavigate("Reports") },
  ];
  return <form onSubmit={submit} className="rounded-[1.65rem] border border-v2-border bg-[#050505] p-3 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
    <textarea value={value} onChange={(event) => setValue(event.target.value)} rows={3} placeholder="Ask the agent to analyze a mechanism, render a CAD view, plot a graph, build a report, or prepare a presentation…" className="min-h-20 w-full resize-none rounded-2xl border border-v2-border bg-[#080807] px-4 py-3 text-sm text-v2-text outline-none placeholder:text-stone-600 focus:border-amber-600/50" />
    <div className="mt-3 flex flex-wrap items-center gap-2">{chips.map((chip) => <button title={chip.hint} type="button" key={chip.label} disabled={chip.disabled} onClick={chip.action} className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold ${chip.label.toLowerCase().includes(activeProvider === "openai" ? "gpt" : activeProvider === "anthropic" ? "claude" : activeProvider === "gemini" ? "gemini" : "local") ? "border-amber-600/50 bg-amber-500/10 text-amber-500" : "border-v2-border bg-[#121110] text-v2-muted hover:border-amber-600/40 hover:text-amber-500"}`}>{chip.label}</button>)}<select value={activeProvider} onChange={(event) => onProviderSelect(event.target.value as V2ProviderId)} className="ml-auto rounded-full border border-v2-border bg-[#121110] px-3 py-1.5 text-[11px] text-v2-muted">{providers.map((p) => <option key={p.id} value={p.id}>{p.label} · {p.status === "configured" || p.status === "local" ? "ready" : "not configured"}</option>)}</select><button className="rounded-full bg-amber-600 px-5 py-2 text-sm font-bold text-black hover:bg-amber-500">Send</button></div>
  </form>;
}
