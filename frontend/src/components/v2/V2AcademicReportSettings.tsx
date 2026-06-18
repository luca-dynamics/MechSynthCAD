import type { V2AcademicReportMetadata } from "@/components/v2/academicReportBuilder";

const modes: V2AcademicReportMetadata["reportMode"][] = ["Proposal", "Chapter Draft", "Result Appendix", "Supervisor Demo"];

export function V2AcademicReportSettings({ metadata, onChange }: { metadata: V2AcademicReportMetadata; onChange: (metadata: V2AcademicReportMetadata) => void }) {
  const set = (key: keyof V2AcademicReportMetadata, value: string) => onChange({ ...metadata, [key]: value });
  const fields: Array<[keyof V2AcademicReportMetadata, string, string]> = [["projectTitle", "Project title", "text"], ["studentName", "Student name", "text"], ["department", "Department", "text"], ["institution", "Institution", "text"], ["level", "Level", "text"], ["supervisor", "Supervisor", "text"], ["sessionSemester", "Session/Semester", "text"], ["date", "Date", "date"]];
  return <section className="rounded-2xl border border-v2-border bg-[#0d0c0b] p-4">
    <div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-500">Academic metadata</p><h4 className="mt-1 font-semibold text-v2-text">Title-page and submission settings</h4></div><select value={metadata.reportMode} onChange={(e) => set("reportMode", e.target.value)} className="rounded-xl border border-v2-border bg-[#080807] px-3 py-2 text-sm text-v2-text">{modes.map((mode) => <option key={mode}>{mode}</option>)}</select></div>
    <div className="mt-4 grid gap-3 md:grid-cols-2">{fields.map(([key, label, type]) => <label key={key} className={key === "projectTitle" ? "md:col-span-2" : ""}><span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-v2-muted">{label}</span><input type={type} value={String(metadata[key] ?? "")} onChange={(e) => set(key, e.target.value)} className="w-full rounded-xl border border-v2-border bg-[#080807] px-3 py-2 text-sm text-v2-text outline-none focus:border-amber-600/60" /></label>)}</div>
  </section>;
}
