import { ValidationMatrix } from "@/components/ValidationMatrix";

export function V2ValidationPanel() {
  return <section className="space-y-4">
    <div className="v2-surface border-v2-border rounded-3xl border p-5"><p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-500">Validation</p><h2 className="mt-2 text-2xl font-semibold">Deterministic validation context</h2><p className="mt-2 text-sm text-v2-muted">Use this view to document solver boundaries, source-of-truth assumptions, and academic validation expectations.</p></div>
    <ValidationMatrix />
  </section>;
}
