import type { V2MechanismState } from "@/components/v2/types";

export function V2AgentQuestionCards({ state, onRun }: { state: V2MechanismState; onRun: (command: string) => void }) {
  const isFourBar = state.selectedMechanism === "four_bar";
  const fields = isFourBar
    ? [["Ground", state.form.l1, "l1"], ["Input", state.form.l2, "l2"], ["Coupler", state.form.l3, "l3"], ["Output", state.form.l4, "l4"], ["θ2", state.form.theta2_deg, "theta2_deg"]]
    : [["Crank", state.sliderCrankForm.crank_radius, "crank_radius"], ["Rod", state.sliderCrankForm.connecting_rod_length, "connecting_rod_length"], ["θ", state.sliderCrankForm.theta_deg, "theta_deg"], ["ω", state.sliderCrankForm.omega, "omega"], ["Offset", state.sliderCrankForm.offset, "offset"]];
  return <section className="rounded-3xl border border-amber-600/20 bg-[#080807] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[11px] font-bold uppercase tracking-[0.26em] text-amber-500">Agent parameter question</p><h3 className="mt-1 text-lg font-semibold">Confirm the mechanism inputs before I call the solver.</h3><p className="mt-1 text-sm text-v2-muted">These values are rendered as agent intake cards so the form does not own the workspace.</p></div><span className="rounded-full border border-v2-border bg-[#121110] px-3 py-1 text-xs text-v2-muted">{isFourBar ? "Four-bar" : "Slider-crank"}</span></div>
    <div className="mt-4 grid gap-2 sm:grid-cols-5">{fields.map(([label, value, key]) => <div key={String(key)} className="rounded-2xl border border-v2-border bg-[#121110] p-3"><p className="text-[10px] uppercase tracking-[0.2em] text-stone-500">{label}</p><p className="mt-1 text-lg font-semibold text-v2-text">{String(value)}</p></div>)}</div>
    <div className="mt-4 flex flex-wrap gap-2"><button onClick={() => onRun("Run analysis with these parameters")} className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-bold text-black hover:bg-amber-500">Looks good — run analysis</button><button onClick={() => onRun("Run simulation sweep with these parameters")} className="rounded-xl border border-v2-border bg-[#191715] px-4 py-2 text-sm font-semibold text-v2-muted hover:text-amber-500">Run sweep</button><button onClick={() => onRun("What parameters are missing?")} className="rounded-xl border border-v2-border bg-[#191715] px-4 py-2 text-sm font-semibold text-v2-muted hover:text-amber-500">Ask agent to audit</button></div>
  </section>;
}
