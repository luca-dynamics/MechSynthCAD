import { useState } from "react";

const chips = ["Run analysis", "Run simulation", "Generate report", "Recommend improvement", "What parameters are missing?"];

export function V2AgentComposer({ onSubmit }: { onSubmit: (command: string) => void }) {
  const [command, setCommand] = useState("");
  function submit(value = command) { const trimmed = value.trim(); if (!trimmed) return; onSubmit(trimmed); setCommand(""); }
  return <form className="fixed inset-x-2 bottom-2 z-40 mx-auto max-w-5xl rounded-[1.35rem] border border-v2-border bg-v2-topbar/95 p-2.5 shadow-2xl shadow-black/40 backdrop-blur-2xl sm:inset-x-4 sm:bottom-4 sm:p-3" onSubmit={(event) => { event.preventDefault(); submit(); }}>
    <div className="mb-2 flex gap-2 overflow-x-auto pb-1">{chips.map((chip) => <button key={chip} type="button" onClick={() => submit(chip)} className="shrink-0 rounded-full border border-v2-border bg-v2-control px-3 py-1.5 text-xs font-semibold text-v2-muted transition hover:border-amber-600/60 hover:text-amber-500">{chip}</button>)}</div>
    <div className="flex gap-2"><input className="min-w-0 flex-1 rounded-2xl border border-v2-border bg-v2-input px-4 py-3 text-sm outline-none transition focus:border-amber-600 sm:text-base" value={command} onChange={(event) => setCommand(event.target.value)} placeholder="Ask the engineering agent to analyze, simulate, recommend, or prepare a report…" /><button className="rounded-2xl bg-amber-600 px-5 py-3 font-semibold text-white hover:bg-amber-500">Run</button></div>
  </form>;
}
