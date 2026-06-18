const providers = ["OpenAI", "Anthropic", "Gemini", "BYOK", "Local model"];

export function V2ModelSettingsPanel() {
  return <section className="rounded-3xl border border-v2-border p-5">
    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-500">Models</p>
    <h3 className="mt-2 text-lg font-semibold">Local deterministic agent</h3>
    <p className="mt-2 text-sm text-v2-muted">External models are not connected yet. This PR intentionally does not add model routing, API key fields, or provider calls.</p>
    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">{providers.map((provider) => <div key={provider} className="rounded-2xl border border-v2-border bg-black/5 p-4"><p className="font-semibold">{provider}</p><p className="mt-1 text-xs text-v2-muted">Coming soon · disabled</p></div>)}</div>
  </section>;
}
