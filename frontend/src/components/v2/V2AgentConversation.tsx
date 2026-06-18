import type { V2AgentMessage } from "@/components/v2/types";

export function V2AgentConversation({ messages, onAction }: { messages: V2AgentMessage[]; onAction: (command: string) => void }) {
  return <section className="v2-surface border-v2-border rounded-3xl border p-5">
    <div className="mb-4 flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-500">Agent thread</p><h2 className="mt-1 text-xl font-semibold">Deterministic engineering agent</h2></div><span className="rounded-full border border-v2-border px-3 py-1 text-xs text-v2-muted">local adapter</span></div>
    <div className="v2-scrollbar max-h-[620px] space-y-4 overflow-auto pr-1">
      {messages.map((message) => <article key={message.id} className={`rounded-3xl border p-4 ${message.role === "user" ? "ml-auto max-w-[86%] border-amber-700/30 bg-amber-900/20" : "mr-auto border-v2-border bg-black/10"}`}>
        <div className="mb-2 flex items-center gap-2"><span className="text-xs font-semibold uppercase tracking-wide text-amber-500">{message.role === "user" ? "You" : "Agent"}</span>{message.intent ? <span className="rounded-full border border-v2-border px-2 py-0.5 text-[11px] text-v2-muted">{message.intent}</span> : null}</div>
        <p className="text-sm leading-6">{message.text}</p>
        {message.steps ? <ol className="mt-3 space-y-2">{message.steps.map((step) => <li key={step.label} className="rounded-2xl border border-v2-border bg-black/5 p-3 text-sm"><span className={`mr-2 inline-block h-2 w-2 rounded-full ${step.status === "complete" ? "bg-amber-500" : step.status === "blocked" ? "bg-red-500" : "bg-stone-500"}`} /><span className="font-semibold">{step.label}</span><p className="mt-1 pl-4 text-xs text-v2-muted">{step.detail}</p></li>)}</ol> : null}
        {message.actions ? <div className="mt-3 flex flex-wrap gap-2">{message.actions.map((action) => <button key={action.label} onClick={() => onAction(action.command)} className="rounded-full border border-v2-border px-3 py-1 text-xs font-semibold text-amber-500 hover:border-amber-600">{action.label}</button>)}</div> : null}
      </article>)}
    </div>
  </section>;
}
