import type { MechanismType } from "@/types";

export function V2OverviewPanel({ selectedMechanism, hasResult, sampleCount, activeTask }: { selectedMechanism: MechanismType; hasResult: boolean; sampleCount: number; activeTask: string }) {
  const metrics = [["Mechanism", selectedMechanism.replace("_", "-")], ["Solver", hasResult ? "result ready" : "not run"], ["Sweep", `${sampleCount} samples`], ["Agent", activeTask]];
  return <section className="v2-surface border-v2-border rounded-[1.5rem] border p-5">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-500">Mission control</p><h2 className="mt-2 text-2xl font-semibold">AI engineering workspace</h2></div><p className="max-w-xl text-sm leading-6 text-v2-muted">A compact desktop cockpit for deterministic mechanism analysis, agent-guided tool runs, synthesis direction, validation, and report preparation.</p></div>
    <div className="mt-5 grid gap-3 md:grid-cols-4">{metrics.map(([label, value]) => <div key={label} className="rounded-2xl border border-v2-border bg-v2-control p-4"><p className="text-[11px] uppercase tracking-[0.18em] text-v2-muted">{label}</p><p className="mt-2 text-lg font-semibold">{value}</p></div>)}</div>
  </section>;
}
