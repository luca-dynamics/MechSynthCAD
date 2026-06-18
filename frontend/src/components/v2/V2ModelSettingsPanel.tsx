const providers = ["OpenAI", "Anthropic", "Gemini", "Local"];

export function V2ModelSettingsPanel() {
  return <section className="rounded-[1.25rem] border border-v2-border bg-[#0d0c0b] p-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-500">Models + BYOK</p><h3 className="mt-2 text-lg font-semibold">Agent model routing</h3></div><span className="rounded-full border border-v2-border bg-[#121110] px-3 py-1 text-xs text-v2-muted">UI only · no calls</span></div>
    <div className="mt-4 grid gap-3 md:grid-cols-4">{providers.map((provider) => <div key={provider} className="rounded-2xl border border-v2-border bg-[#080807] p-4"><div className="flex items-center justify-between gap-2"><p className="font-semibold">{provider}</p><span className="h-2 w-2 rounded-full bg-stone-700" /></div><input disabled placeholder={provider === "Local" ? "local deterministic" : "paste key later"} className="mt-3 w-full rounded-xl border border-v2-border bg-[#121110] px-3 py-2 text-xs text-v2-muted outline-none" /></div>)}</div>
  </section>;
}
