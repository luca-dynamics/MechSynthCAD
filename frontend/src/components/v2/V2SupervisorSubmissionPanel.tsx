import { useEffect, useMemo, useState } from "react";
import { buildAcademicReport, defaultAcademicReportMetadata, type V2AcademicReportMetadata } from "@/components/v2/academicReportBuilder";
import { V2AcademicReportPreview } from "@/components/v2/V2AcademicReportPreview";
import { V2AcademicReportSettings } from "@/components/v2/V2AcademicReportSettings";
import { V2ReportEvidenceChecklist } from "@/components/v2/V2ReportEvidenceChecklist";
import type { V2AgentMessage, V2MechanismState, V2ProviderStatus } from "@/components/v2/types";

const storageKey = "mechsynthcad:v2:academic-report-metadata";

export function V2SupervisorSubmissionPanel({ state, messages, providers = [], onCommand }: { state: V2MechanismState; messages: V2AgentMessage[]; providers?: V2ProviderStatus[]; onCommand: (command: string) => void }) {
  const [metadata, setMetadata] = useState<V2AcademicReportMetadata>(() => defaultAcademicReportMetadata());
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  useEffect(() => { try { const raw = window.localStorage.getItem(storageKey); if (raw) setMetadata({ ...defaultAcademicReportMetadata(), ...JSON.parse(raw) }); } catch { window.localStorage.removeItem(storageKey); setCopyStatus("Saved report metadata was invalid and has been reset."); } }, []);
  useEffect(() => { try { window.localStorage.setItem(storageKey, JSON.stringify(metadata)); } catch { setCopyStatus("Report metadata could not be saved in this browser."); } }, [metadata]);
  const report = useMemo(() => buildAcademicReport({ state, messages, metadata, providers }), [state, messages, metadata, providers]);
  async function copyMarkdown() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard API unavailable");
      await navigator.clipboard.writeText(report.markdown);
      setCopyStatus("Markdown copied for supervisor report.");
    } catch {
      setCopyStatus("Copy failed. Select the Markdown report source below and copy it manually.");
    }
    window.setTimeout(() => setCopyStatus(null), 4200);
  }
  function downloadMarkdown() { const blob = new Blob([report.markdown], { type: "text/markdown;charset=utf-8" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = "mechsynthcad-supervisor-academic-report.md"; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url); }
  return <section className="space-y-4">
    <div className="rounded-2xl border border-amber-700/30 bg-amber-500/10 p-4"><p className="text-[11px] font-bold uppercase tracking-[0.25em] text-amber-400">Supervisor Submission Mode</p><h3 className="mt-1 text-xl font-semibold text-v2-text">Academic report preview/export</h3><p className="mt-2 text-sm leading-6 text-v2-muted">Prepare a supervisor-facing Mechanical Engineering deliverable from deterministic mechanism evidence. Missing sections are marked professionally instead of inventing solver values.</p><div className="mt-3 flex flex-wrap gap-2"><button onClick={copyMarkdown} className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-black">Copy Markdown</button><button onClick={downloadMarkdown} className="rounded-xl border border-v2-border bg-[#191715] px-4 py-2 text-xs font-semibold text-v2-muted hover:text-amber-500">Download Markdown file</button><button onClick={() => window.print()} className="rounded-xl border border-v2-border bg-[#191715] px-4 py-2 text-xs font-semibold text-v2-muted hover:text-amber-500">Open print/PDF view</button><button onClick={() => onCommand("Open parameter intake")} className="rounded-xl border border-v2-border bg-[#191715] px-4 py-2 text-xs font-semibold text-v2-muted hover:text-amber-500">Open parameter intake</button></div>{copyStatus ? <p className="mt-2 text-xs text-emerald-300">{copyStatus}</p> : null}</div>
    <V2AcademicReportSettings metadata={metadata} onChange={setMetadata} />
    <V2ReportEvidenceChecklist items={report.evidenceChecklist} onCommand={onCommand} />
    <V2AcademicReportPreview report={report} />
    <details className="rounded-2xl border border-v2-border bg-[#0d0c0b] p-4"><summary className="cursor-pointer text-sm font-semibold text-v2-muted">Markdown report source / manual copy fallback</summary><pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap break-words text-xs text-stone-400">{report.markdown}</pre></details>
  </section>;
}
