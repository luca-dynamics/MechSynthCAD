import type React from "react";
import { V2CompactInspector } from "@/components/v2/V2ArtifactDetail";
import type {
  V2ActivityEvent,
  V2AgentMessage,
  V2ArtifactKind,
  V2MechanismState,
  V2ProviderId,
  V2ProviderStatus,
} from "@/components/v2/types";
import { V2GuidedMissionChecklist } from "@/components/v2/V2GuidedMissionChecklist";

export function V2OperationsPanel({
  state,
  activeTask,
  onOpenReports,
  activeArtifact,
  onOpenArtifact,
  onCloseArtifact,
  onCommand,
  activeProvider,
  providers,
  activityLog,
  latestError,
  messages,
  sessionStatus,
  lastSavedAt,
  onSaveSession,
  onRestoreSession,
  onClearSession,
  onResetWorkspace,
}: {
  state: V2MechanismState;
  activeTask: string;
  onOpenReports: () => void;
  activeArtifact: V2ArtifactKind | null;
  onOpenArtifact: (kind: V2ArtifactKind) => void;
  onCloseArtifact: () => void;
  onCommand: (command: string) => void;
  activeProvider: V2ProviderId;
  providers: V2ProviderStatus[];
  activityLog: V2ActivityEvent[];
  latestError: string | null;
  messages: V2AgentMessage[];
  sessionStatus: string;
  lastSavedAt: string | null;
  onSaveSession: () => void;
  onRestoreSession: () => void;
  onClearSession: () => void;
  onResetWorkspace: () => void;
}) {
  const mechanism =
    state.selectedMechanism === "four_bar"
      ? "Four-bar linkage"
      : "Slider-crank";
  const hasSweep =
    state.selectedMechanism === "four_bar"
      ? Boolean(state.sweepResult)
      : Boolean(state.sliderCrankSweepResult);
  const provider =
    providers.find((item) => item.id === activeProvider) ?? providers[0];
  const missing = Object.entries(state.inputParameters).filter(
    ([, value]) => typeof value !== "number" || Number.isNaN(value),
  );
  return (
    <aside className="v2-scrollbar mt-3 h-auto overflow-y-auto rounded-[1.4rem] border border-v2-border bg-[#080807] p-3 xl:sticky xl:top-2 xl:mt-0 xl:block xl:h-[calc(100vh-1rem)]">
      <Panel title="Model Assignment">
        <Rows
          rows={[
            ["Active provider", provider?.label ?? "Local Deterministic Agent"],
            ["Provider status", provider?.status.replace("_", " ") ?? "local"],
            ["Key source", provider?.keySource ?? "Local deterministic"],
            [
              "Default model",
              provider?.defaultModel ?? "backend deterministic solver",
            ],
            [
              "Advisory rule",
              activeProvider === "local"
                ? "No external model"
                : "Model output advisory only",
            ],
          ]}
        />
      </Panel>
      <Panel title="Mechanism Context">
        <Rows
          rows={[
            ["Selected", mechanism],
            [
              "Input completeness",
              missing.length
                ? `Missing: ${missing.map(([key]) => key).join(", ")}`
                : "Numeric fields ready",
            ],
            [
              "Result state",
              state.solverResult ? "Result available" : "Awaiting analysis",
            ],
            ["Sweep state", hasSweep ? "Samples available" : "No sweep run"],
            ["Latest error", latestError ?? "None"],
          ]}
        />
      </Panel>
      <Panel title="Session Memory">
        <Rows
          rows={[
            ["Local session", sessionStatus],
            ["Last saved", formatSavedAt(lastSavedAt)],
            ["Mechanism", mechanism],
            ["Active artifact", activeArtifact ?? "closed"],
          ]}
        />
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={onSaveSession}
            className="rounded-xl border border-v2-border bg-[#191715] px-3 py-2 text-xs font-semibold text-v2-muted hover:text-amber-500"
          >
            Save now
          </button>
          <button
            onClick={onRestoreSession}
            className="rounded-xl border border-v2-border bg-[#191715] px-3 py-2 text-xs font-semibold text-v2-muted hover:text-amber-500"
          >
            Restore saved
          </button>
          <button
            onClick={onClearSession}
            className="rounded-xl border border-v2-border bg-[#191715] px-3 py-2 text-xs font-semibold text-v2-muted hover:text-amber-500"
          >
            Clear saved session
          </button>
          <button
            onClick={onResetWorkspace}
            className="rounded-xl border border-v2-border bg-[#191715] px-3 py-2 text-xs font-semibold text-v2-muted hover:text-amber-500"
          >
            Reset V2 workspace
          </button>
        </div>
        <p className="mt-2 text-[10px] leading-4 text-v2-muted">
          Session memory is V2-only and stores browser workspace state, not
          provider secrets or BYOK keys.
        </p>
      </Panel>
      <Panel title="Compact Inspector">
        <V2CompactInspector
          state={state}
          onOpenArtifact={onOpenArtifact}
          onCommand={onCommand}
        />
        <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-v2-muted">
          Drawer: {activeArtifact ?? "closed"}
        </p>
        {activeArtifact ? (
          <button
            onClick={onCloseArtifact}
            className="mt-2 rounded-xl border border-v2-border bg-[#191715] px-3 py-2 text-xs font-semibold text-v2-muted hover:text-amber-500"
          >
            Close drawer
          </button>
        ) : null}
      </Panel>
      <Panel title="Mission Checklist">
        <V2GuidedMissionChecklist state={state} messages={messages} />
      </Panel>
      <Panel title="Progress Log">
        <div className="space-y-2 text-xs text-v2-muted">
          <p>Now · {activeTask}</p>
          {activityLog.map((event) => (
            <p
              key={event.id}
              className={
                event.status === "error"
                  ? "text-red-400"
                  : event.status === "success"
                    ? "text-amber-500"
                    : "text-v2-muted"
              }
            >
              {event.at} · {event.type} · {event.message}
            </p>
          ))}
        </div>
      </Panel>
      <Panel title="Tool Status">
        <Rows
          rows={[
            ["API health", "API health check not connected"],
            ["Solver", "Deterministic active"],
            ["Report builder", "Available"],
            ["Validation", "Available"],
          ]}
        />
        <button
          onClick={onOpenReports}
          className="mt-3 rounded-xl border border-v2-border bg-[#191715] px-3 py-2 text-xs font-semibold text-v2-muted hover:text-amber-500"
        >
          Open reports
        </button>
      </Panel>
    </aside>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-3 rounded-2xl border border-v2-border bg-[#0d0c0b] p-3">
      <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.24em] text-amber-500">
        {title}
      </p>
      {children}
    </section>
  );
}
function Rows({ rows }: { rows: string[][] }) {
  return (
    <div className="space-y-2">
      {rows.map(([key, value]) => (
        <div
          key={key}
          className="flex items-start justify-between gap-3 rounded-xl bg-[#121110] px-3 py-2 text-xs"
        >
          <span className="text-v2-muted">{key}</span>
          <span className="max-w-[55%] text-right font-medium text-v2-text">
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}

function formatSavedAt(value: string | null) {
  if (!value) return "Not saved yet";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Unknown"
    : date.toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
}
