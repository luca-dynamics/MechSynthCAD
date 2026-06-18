import type { V2AgentMessage } from "@/components/v2/types";

export function V2AgentConversation({ messages, onAction }: { messages: V2AgentMessage[]; onAction: (command: string) => void }) {
  return <section className="v2-surface border-v2-border rounded-[1.5rem] border p-5">
    <div className="mb-4 flex items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-500">Agent log</p><h2 className="mt-1 text-xl font-semibold">Deterministic engineering agent</h2></div><span className="rounded-full border border-v2-border bg-v2-control px-3 py-1 text-xs text-v2-muted">local adapter</span></div>
    {messages.length <= 1 ? <div className="mb-4 rounded-2xl border border-dashed border-v2-border bg-v2-control p-5 text-sm text-v2-muted">Ready for an engineering command. Ask for analysis, simulation, synthesis direction, validation context, or a report package.</div> : null}
    <div className="v2-scrollbar max-h-[620px] space-y-4 overflow-auto pr-1">
      {messages.map((message) => <article key={message.id} className={`rounded-[1.25rem] border p-4 ${message.role === "user" ? "ml-auto max-w-[88%] border-amber-700/25 bg-amber-900/10" : "mr-auto border-v2-border bg-v2-control"}`}>
        <div className="mb-2 flex items-center gap-2"><span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-500">{message.role === "user" ? "Operator" : "Agent"}</span>{message.intent ? <span className="rounded-full border border-v2-border px-2 py-0.5 text-[11px] text-v2-muted">intent · {message.intent}</span> : null}</div>
        <p className="text-sm leading-6">{message.text}</p>
        {message.steps ? <ol className="mt-3 space-y-2 border-l border-v2-border pl-3">{message.steps.map((step) => <li key={step.label} className="rounded-2xl border border-v2-border bg-v2-input p-3 text-sm"><span className={`mr-2 inline-block h-2 w-2 rounded-full ${step.status === "complete" ? "bg-amber-500" : step.status === "blocked" ? "bg-red-500" : "bg-stone-500"}`} /><span className="font-semibold">{step.label}</span><span className="ml-2 text-[11px] uppercase tracking-wide text-v2-muted">{step.status}</span><p className="mt-1 pl-4 text-xs leading-5 text-v2-muted">{step.detail}</p></li>)}</ol> : null}
        {message.actions ? <div className="mt-3 flex flex-wrap gap-2">{message.actions.map((action) => <button key={action.label} onClick={() => onAction(action.command)} className="rounded-full border border-v2-border bg-v2-control px-3 py-1.5 text-xs font-semibold text-amber-500 hover:border-amber-600/60">{action.label}</button>)}</div> : null}
      </article>)}
    </div>
  </section>;
}
