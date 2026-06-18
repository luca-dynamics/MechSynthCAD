import type { MechanismType } from "@/types";

export function V2OverviewPanel({ selectedMechanism, hasResult, sampleCount, activeTask }: { selectedMechanism: MechanismType; hasResult: boolean; sampleCount: number; activeTask: string }) {
  const metrics = [
    ["Mechanism", selectedMechanism.replace("_", "-")],
    ["Analysis", hasResult ? "solver result ready" : "not run"],
    ["Simulation", `${sampleCount} samples`],
    ["Agent state", activeTask],
  ];
  return <section className="v2-surface border-v2-border rounded-3xl border p-5">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div><p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-500">Workspace overview</p><h2 className="mt-2 text-2xl font-semibold">Mechanism engineering cockpit</h2></div>
      <p className="max-w-xl text-sm text-v2-muted">A V2 desktop-style environment for deterministic mechanism analysis, synthesis direction, validation, and report preparation.</p>
    </div>
    <div className="mt-5 grid gap-3 md:grid-cols-4">{metrics.map(([label, value]) => <div key={label} className="rounded-2xl border border-v2-border bg-black/5 p-4"><p className="text-xs uppercase tracking-wide text-v2-muted">{label}</p><p className="mt-2 text-lg font-semibold">{value}</p></div>)}</div>
  </section>;
}
