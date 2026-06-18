const providers = ["OpenAI", "Anthropic", "Gemini", "BYOK", "Local model"];

export function V2ModelSettingsPanel() {
  return <section className="rounded-[1.25rem] border border-v2-border bg-v2-control p-5">
    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-500">Models</p>
    <h3 className="mt-2 text-lg font-semibold">Provider connections</h3>
    <p className="mt-2 text-sm leading-6 text-v2-muted">External providers are not connected yet. Deterministic backend solvers remain the numerical source of truth.</p>
    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">{providers.map((provider) => <div key={provider} className="rounded-2xl border border-v2-border bg-v2-input p-4 opacity-75"><div className="flex items-center justify-between gap-2"><p className="font-semibold">{provider}</p><span className="rounded-full border border-v2-border px-2 py-0.5 text-[10px] uppercase text-v2-muted">disabled</span></div><p className="mt-2 text-xs text-v2-muted">Coming soon · no API key field active</p></div>)}</div>
  </section>;
}
