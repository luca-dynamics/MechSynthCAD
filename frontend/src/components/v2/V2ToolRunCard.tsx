import type { V2AgentMessage } from "@/components/v2/types";

export function V2ToolRunCard({ message, onAction }: { message: V2AgentMessage; onAction: (command: string) => void }) {
  if (message.role === "user") return <div className="ml-auto max-w-[78%] rounded-2xl border border-amber-600/20 bg-amber-500/10 px-4 py-3"><p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-500">User command</p><p className="mt-1 text-sm text-v2-text">{message.text}</p></div>;
  return <article className="rounded-2xl border border-v2-border bg-[#121110] p-4">
    <div className="flex items-center justify-between gap-3"><p className="text-[11px] font-bold uppercase tracking-[0.22em] text-stone-500">Agent execution block</p><span className="rounded-full bg-[#191715] px-2 py-1 text-[10px] text-v2-muted">{message.intent ?? "ready"}</span></div>
    <p className="mt-2 text-sm leading-6 text-v2-text">{message.text}</p>
    {message.steps?.length ? <div className="mt-4 grid gap-2 sm:grid-cols-2">{message.steps.map((step) => <div key={`${message.id}-${step.label}`} className="rounded-xl border border-v2-border bg-[#0d0c0b] p-3"><p className="flex items-center gap-2 text-xs font-semibold"><span className={`h-2 w-2 rounded-full ${step.status === "complete" ? "bg-amber-500" : step.status === "blocked" ? "bg-red-500" : "bg-stone-600"}`} />{step.label}</p><p className="mt-1 text-[11px] leading-4 text-v2-muted">{step.detail}</p></div>)}</div> : null}
    {message.actions?.length ? <div className="mt-4 flex flex-wrap gap-2">{message.actions.slice(0, 4).map((action) => <button key={action.command} onClick={() => onAction(action.command)} className="rounded-full border border-v2-border bg-[#191715] px-3 py-1.5 text-xs text-v2-muted hover:border-amber-600/40 hover:text-amber-500">{action.label}</button>)}</div> : null}
  </article>;
}
