import { FormEvent, useState } from "react";

const chips = ["GPT", "Claude", "Gemini", "BYOK", "Four-Bar", "Slider-Crank", "Charts", "Reports"];
export function V2CommandDock({ onSubmit }: { onSubmit: (command: string) => void }) {
  const [value, setValue] = useState("");
  function submit(event: FormEvent) { event.preventDefault(); const command = value.trim(); if (!command) return; onSubmit(command); setValue(""); }
  return <form onSubmit={submit} className="rounded-[1.65rem] border border-v2-border bg-[#050505] p-3 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
    <textarea value={value} onChange={(event) => setValue(event.target.value)} rows={3} placeholder="Ask the agent to analyze a mechanism, render a CAD view, plot a graph, build a report, or prepare a presentation…" className="min-h-20 w-full resize-none rounded-2xl border border-v2-border bg-[#080807] px-4 py-3 text-sm text-v2-text outline-none placeholder:text-stone-600 focus:border-amber-600/50" />
    <div className="mt-3 flex flex-wrap items-center gap-2">{chips.map((chip) => <button type="button" key={chip} className="rounded-full border border-v2-border bg-[#121110] px-3 py-1.5 text-[11px] font-semibold text-v2-muted hover:border-amber-600/40 hover:text-amber-500">{chip}</button>)}<select className="ml-auto rounded-full border border-v2-border bg-[#121110] px-3 py-1.5 text-[11px] text-v2-muted"><option>Local agent</option><option>OpenAI · BYOK</option><option>Anthropic · BYOK</option><option>Gemini · BYOK</option></select><button className="rounded-full bg-amber-600 px-5 py-2 text-sm font-bold text-black hover:bg-amber-500">Send</button></div>
  </form>;
}
