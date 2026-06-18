import { useState } from "react";

const chips = ["Run analysis", "Run simulation", "Generate report", "Recommend improvement", "What parameters are missing?"];

export function V2AgentComposer({ onSubmit }: { onSubmit: (command: string) => void }) {
  const [command, setCommand] = useState("");
  function submit(value = command) {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setCommand("");
  }
  return <form className="fixed inset-x-3 bottom-3 z-40 rounded-3xl border border-amber-700/35 bg-[#171514]/95 p-3 shadow-2xl shadow-black/40 backdrop-blur-xl" onSubmit={(event) => { event.preventDefault(); submit(); }}>
    <div className="mb-2 flex gap-2 overflow-x-auto pb-1">{chips.map((chip) => <button key={chip} type="button" onClick={() => submit(chip)} className="shrink-0 rounded-full border border-stone-700 px-3 py-1.5 text-xs font-semibold text-stone-300 transition hover:border-amber-600 hover:text-amber-500">{chip}</button>)}</div>
    <div className="flex gap-2"><input className="min-w-0 flex-1 rounded-2xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-100 outline-none transition focus:border-amber-600" value={command} onChange={(event) => setCommand(event.target.value)} placeholder="Ask: Analyze this four-bar linkage, run a sweep, generate a report..." /><button className="rounded-2xl bg-amber-600 px-5 py-3 font-semibold text-white hover:bg-amber-500">Run</button></div>
  </form>;
}
