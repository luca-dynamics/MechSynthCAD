export function V2ArtifactCard({ title, status, summary, action, onAction }: { title: string; status: string; summary: string; action: string; onAction?: () => void }) {
  return <article className="rounded-2xl border border-v2-border bg-[#121110] p-4 shadow-[0_18px_45px_rgba(0,0,0,0.18)]">
    <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-v2-text">{title}</p><p className="mt-1 text-xs leading-5 text-v2-muted">{summary}</p></div><span className="rounded-full border border-amber-600/25 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-500">{status}</span></div>
    <button onClick={onAction} className="mt-3 rounded-xl border border-v2-border bg-[#191715] px-3 py-2 text-xs font-semibold text-v2-muted hover:border-amber-600/40 hover:text-amber-500">{action}</button>
  </article>;
}
