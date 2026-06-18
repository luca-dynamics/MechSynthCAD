import { ValidationMatrix } from "@/components/ValidationMatrix";

export function V2ValidationPanel() {
  return <section className="space-y-4">
    <div className="v2-surface border-v2-border rounded-[1.5rem] border p-5"><p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-500">Validation</p><h2 className="mt-2 text-2xl font-semibold">System capability matrix</h2><p className="mt-2 text-sm leading-6 text-v2-muted">A serious validation view for solver boundaries, supported mechanism classes, source-of-truth assumptions, and reportable capability checks.</p></div>
    <div className="overflow-hidden rounded-[1.25rem] border border-v2-border bg-v2-control p-3"><ValidationMatrix /></div>
  </section>;
}
