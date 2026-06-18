import {
  v2MissionTemplates,
  type V2MissionTemplateId,
} from "@/components/v2/missionTemplates";

export function V2FirstRunOverlay({
  open,
  onClose,
  onStartTemplate,
}: {
  open: boolean;
  onClose: (neverShowAgain?: boolean) => void;
  onStartTemplate: (id: V2MissionTemplateId) => void;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 px-3 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="v2-guide-title"
    >
      <div className="mx-auto max-w-4xl rounded-[1.6rem] border border-v2-border bg-[#0d0c0b] p-4 shadow-2xl sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-amber-500">
              First-run guide
            </p>
            <h2 id="v2-guide-title" className="mt-2 text-2xl font-semibold">
              MechSynthCAD V2 mission workspace
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-v2-muted">
              V2 is an AI-assisted mechanical engineering workspace.
              Deterministic solvers remain the source of numerical mechanism
              results; models assist with planning, explanation, and reporting
              only.
            </p>
          </div>
          <button
            onClick={() => onClose()}
            className="min-h-10 rounded-xl border border-v2-border px-4 py-2 text-sm font-semibold text-v2-muted hover:text-amber-500"
          >
            Skip
          </button>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {v2MissionTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => onStartTemplate(template.id)}
              className="min-h-24 rounded-2xl border border-v2-border bg-[#080807] p-4 text-left hover:border-amber-600/50"
            >
              <p className="text-sm font-semibold text-v2-text">
                {template.shortTitle}
              </p>
              <p className="mt-1 text-xs leading-5 text-v2-muted">
                {template.description}
              </p>
            </button>
          ))}
        </div>
        <div className="mt-5 rounded-2xl border border-amber-600/25 bg-amber-500/10 p-4">
          <p className="text-sm font-semibold text-amber-500">Guardrails</p>
          <div className="mt-3 grid gap-2 text-xs text-v2-muted sm:grid-cols-2">
            <p>Deterministic solver = numerical result.</p>
            <p>Model provider = advisory planning, explanation, reporting.</p>
            <p>Tool permission decides whether analysis/sweep endpoints must run.</p>
            <p>BYOK/provider keys are not stored in V2 session memory.</p>
          </div>
        </div>
        <div className="mt-5 rounded-2xl border border-v2-border bg-[#080807] p-4">
          <p className="text-sm font-semibold">Layout map</p>
          <div className="mt-3 grid gap-2 text-xs text-v2-muted sm:grid-cols-2">
            <p>Left: missions and sessions.</p>
            <p>Center: active mission stream and command dock.</p>
            <p>Right: operations, model, tool, and activity status.</p>
            <p>Drawer: focused artifacts and engineering evidence.</p>
            <p>Session memory: V2 saves this browser workspace only.</p>
            <p>
              Privacy: provider secrets and BYOK keys are never stored in
              session memory.
            </p>
            <p>
              Restore: deterministic results return only from saved local
              session data.
            </p>
          </div>
        </div>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            onClick={() => onClose(true)}
            className="min-h-10 rounded-xl border border-v2-border px-4 py-2 text-sm font-semibold text-v2-muted hover:text-amber-500"
          >
            Do not show again
          </button>
          <button
            onClick={() => onStartTemplate("four_bar_demo")}
            className="min-h-10 rounded-xl bg-amber-600 px-4 py-2 text-sm font-bold text-black hover:bg-amber-500"
          >
            Start Four-Bar Mission
          </button>
        </div>
      </div>
    </div>
  );
}
