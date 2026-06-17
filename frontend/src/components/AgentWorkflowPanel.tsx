import { useState } from "react";
import { runMechanismAgentWorkflow } from "@/lib/api";
import type { AgentMechanismRequestType, AgentWorkflowResponse } from "@/types";

type AgentWorkflowPanelProps = {
  mechanismType: Exclude<AgentMechanismRequestType, "auto">;
  availableContext: Record<string, unknown>;
  solverResult: Record<string, unknown> | null;
  onWorkflowComplete?: (workflow: AgentWorkflowResponse) => void;
};

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h4>
      {items.length > 0 ? <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">{items.map((item) => <li key={item}>{item}</li>)}</ul> : <p className="mt-2 text-sm text-slate-500">None reported.</p>}
    </div>
  );
}

export function AgentWorkflowPanel({ mechanismType, availableContext, solverResult, onWorkflowComplete }: AgentWorkflowPanelProps) {
  const [userGoal, setUserGoal] = useState("Validate inputs, plan solver usage, and prepare engineering interpretation.");
  const [workflow, setWorkflow] = useState<AgentWorkflowResponse | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runWorkflow() {
    setIsRunning(true);
    setError(null);
    try {
      const completedWorkflow = await runMechanismAgentWorkflow({ user_goal: userGoal, mechanism_type: mechanismType, available_context: availableContext, solver_result: solverResult });
      setWorkflow(completedWorkflow);
      onWorkflowComplete?.(completedWorkflow);
    } catch (workflowError) {
      setError(workflowError instanceof Error ? workflowError.message : "Unable to run agent workflow");
      setWorkflow(null);
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <section className="rounded-2xl border border-indigo-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-600">Agentic Engineering Workflow</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">AI-assisted workflow layer</h2>
          <p className="mt-2 text-sm text-slate-600">Coordinates validation, deterministic solver planning, interpretation, design iteration, and report drafting. Numerical truth remains in solver outputs.</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">No AI API calls</span>
      </div>
      <label className="mt-4 block text-sm font-semibold text-slate-700" htmlFor="agent-goal">User goal</label>
      <textarea id="agent-goal" className="mt-2 min-h-24 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" value={userGoal} onChange={(event) => setUserGoal(event.target.value)} />
      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600"><span>Selected mechanism context: <strong>{mechanismType.replace("_", "-")}</strong></span><span>Solver result: <strong>{solverResult ? "available" : "not yet available"}</strong></span></div>
      <button type="button" className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:bg-indigo-300" onClick={runWorkflow} disabled={isRunning}>{isRunning ? "Running workflow..." : "Run Agent Workflow"}</button>
      {error ? <p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      {workflow ? (
        <div className="mt-5 space-y-5 border-t border-slate-200 pt-5">
          <div><h3 className="text-lg font-semibold">Interpreted goal</h3><p className="mt-1 text-sm text-slate-700">{workflow.interpreted_goal}</p></div>
          <div className="grid gap-4 md:grid-cols-2"><ListBlock title="Required inputs" items={workflow.required_inputs} /><ListBlock title="Missing inputs" items={workflow.missing_inputs} /></div>
          <ListBlock title="Validation notes" items={workflow.validation_notes} />
          <ListBlock title="Solver Tool Plan" items={workflow.solver_tool_plan} />
          <div><h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Workflow steps</h4><div className="mt-2 space-y-2">{workflow.workflow_steps.map((step) => <div key={step.step_id} className="rounded-xl border border-slate-200 p-3"><div className="flex justify-between gap-3"><strong className="text-sm text-slate-900">{step.agent_role}</strong><span className="text-xs font-semibold uppercase text-indigo-600">{step.status}</span></div><p className="mt-1 text-sm text-slate-600">{step.action}</p><p className="mt-1 text-sm text-slate-700">{step.summary}</p></div>)}</div></div>
          <ListBlock title="Design Iteration Recommendations" items={workflow.design_recommendations} />
          <div><h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Report-Ready Summary</h4><p className="mt-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{workflow.report_ready_summary}</p></div>
          <ListBlock title="Safety notes" items={workflow.safety_notes} />
        </div>
      ) : null}
    </section>
  );
}
