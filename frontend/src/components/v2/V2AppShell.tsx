"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { MechanismType } from "@/types";
import { v2ThemeClass, v2Tokens } from "@/components/v2/theme";
import type {
  V2AgentIntent,
  V2AgentMessage,
  V2AgentStep,
  V2NavItem,
  V2ResolvedTheme,
  V2Theme,
  V2ActivityEvent,
  V2ArtifactKind,
  V2ProviderId,
} from "@/components/v2/types";
import { V2MissionCenter } from "@/components/v2/V2MissionCenter";
import { V2MissionSidebar } from "@/components/v2/V2MissionSidebar";
import { V2OperationsPanel } from "@/components/v2/V2OperationsPanel";
import { V2FirstRunOverlay } from "@/components/v2/V2FirstRunOverlay";
import {
  getV2MissionTemplate,
  type V2MissionTemplateId,
} from "@/components/v2/missionTemplates";
import type { V2WorkspaceSession } from "@/components/v2/v2SessionPersistence";
import { useV2SessionPersistence } from "@/components/v2/useV2SessionPersistence";
import { useV2ProviderStatus } from "@/components/v2/useV2ProviderStatus";
import { useV2MechanismRuntime } from "@/components/v2/useV2MechanismRuntime";
import { buildV2GuardrailSteps, decideV2Permission } from "@/components/v2/v2Guardrails";

const firstRunStorageKey = "mechsynthcad:v2:first-run-complete";

export function V2AppShell() {
  const [active, setActive] = useState<V2NavItem>("Workspace");
  const [activeArtifact, setActiveArtifact] = useState<V2ArtifactKind | null>(
    null,
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState<V2Theme>("dark");
  const [messages, setMessages] = useState<V2AgentMessage[]>([
    buildAgentMessage(
      "Deterministic Engineering Agent ready. I can inspect parameters, select existing solver tools, summarize returned values, and prepare report-ready next steps without calculating engineering values myself.",
      undefined,
      undefined,
      defaultActions,
      "local",
      "completed",
      "four_bar",
    ),
  ]);
  const [activeProvider, setActiveProvider] = useState<V2ProviderId>("local");
  const { providerStatuses } = useV2ProviderStatus();
  const [activityLog, setActivityLog] = useState<V2ActivityEvent[]>([
    buildActivity(
      "system",
      "Mission workspace initialized with Local Deterministic Agent.",
      "success",
    ),
  ]);
  const [guideOpen, setGuideOpen] = useState(false);

  const appendWorkspaceActivity = useCallback(
    (type: string, message: string, status: V2ActivityEvent["status"]) => {
      appendActivity(setActivityLog, type, message, status);
    },
    [],
  );

  const {
    mechanismState,
    selectedMechanism,
    setSelectedMechanism,
    inputParameters,
    solverResult,
    activeTask,
    latestError,
    runAnalysis,
    runSliderCrankAnalysis,
    runSweep,
    runSliderCrankSweep,
    resetMechanismRuntime,
    loadMissionTemplateMechanism,
    buildMechanismSession,
    restoreMechanismSession,
  } = useV2MechanismRuntime(appendWorkspaceActivity);

  const resolvedTheme: V2ResolvedTheme = theme === "light" ? "light" : "dark";
  useEffect(() => {
    if (window.localStorage.getItem(firstRunStorageKey) !== "true")
      setGuideOpen(true);
  }, []);

  const buildSession = useCallback(
    (): V2WorkspaceSession => ({
      version: 1,
      savedAt: new Date().toISOString(),
      ...buildMechanismSession(),
      activeProvider,
      active,
      activeArtifact,
      messages,
      activityLog,
      theme,
    }),
    [
      active,
      activeArtifact,
      activeProvider,
      activityLog,
      buildMechanismSession,
      messages,
      theme,
    ],
  );

  const restoreSession = useCallback(
    (session: V2WorkspaceSession) => {
      restoreMechanismSession(session);
      setActive(session.active);
      setActiveArtifact(session.activeArtifact);
      setActiveProvider(session.activeProvider);
      setTheme(session.theme);
      setMessages(
        session.messages.length
          ? session.messages
          : [
              buildAgentMessage(
                "Previous session restored with an empty timeline.",
              ),
            ],
      );
      setActivityLog(session.activityLog);
    },
    [restoreMechanismSession],
  );

  const {
    sessionStatus,
    lastSavedAt,
    restoreBannerOpen,
    setRestoreBannerOpen,
    saveSessionNow,
    restoreSavedSession,
    clearSavedSession,
  } = useV2SessionPersistence({
    buildSession,
    restoreSession,
    appendActivity: appendWorkspaceActivity,
  });

  const resetMissionState = useCallback(() => {
    resetMechanismRuntime();
    setActive("Workspace");
    setActiveArtifact(null);
    setMessages([
      buildAgentMessage(
        "V2 mission state reset. Load a demo or choose a mechanism to continue.",
        "help",
        [
          completeStep(
            "Mission reset",
            "V2 workspace state cleared; classic workspace is unaffected.",
          ),
        ],
        defaultActions,
        "local",
        "completed",
        "four_bar",
      ),
    ]);
    setActivityLog([
      buildActivity("system", "V2 mission state reset.", "success"),
    ]);
  }, [resetMechanismRuntime]);

  const closeGuide = useCallback((_neverShowAgain?: boolean) => {
    window.localStorage.setItem(firstRunStorageKey, "true");
    setGuideOpen(false);
  }, []);

  const startMissionTemplate = useCallback(
    (templateId: V2MissionTemplateId) => {
      const template = getV2MissionTemplate(templateId);
      if (!template) return;
      if (template.mechanism) loadMissionTemplateMechanism(template.mechanism);
      setActive("Workspace");
      if (template.targetArtifact) setActiveArtifact(template.targetArtifact);
      const mechanism = template.mechanism ?? selectedMechanism;
      setMessages((thread) => [
        ...thread,
        buildAgentMessage(
          `${template.shortTitle} loaded. Review parameters, then run analysis.`,
          "help",
          template.expectedSteps.map((step, index) => ({
            label: step,
            detail:
              index === 0 ? template.suggestedCommand : "Pending user action.",
            status: index === 0 ? "complete" : "pending",
          })),
          [
            { label: "Run analysis", command: "Run analysis" },
            { label: "Run simulation", command: "Run simulation" },
            { label: "Generate report", command: "Generate report" },
            { label: "Validate workflow", command: "Validate workflow" },
          ],
          "local",
          "completed",
          mechanism,
        ),
      ]);
      appendActivity(
        setActivityLog,
        "mission",
        `${template.shortTitle} template loaded.`,
        "success",
      );
      window.localStorage.setItem(firstRunStorageKey, "true");
      setGuideOpen(false);
    },
    [loadMissionTemplateMechanism, selectedMechanism],
  );

  const runAgentCommand = useCallback(
    async (command: string, modelProvider: V2ProviderId = activeProvider) => {
      appendActivity(
        setActivityLog,
        "command",
        `${modelProvider} received command: ${command}`,
        "info",
      );
      const intent = detectIntent(command);
      const providerState = providerStatuses.find((provider) => provider.id === modelProvider);
      const permission = decideV2Permission(command, { mechanism: selectedMechanism, hasDeterministicResult: Boolean(solverResult), provider: modelProvider, providerStatus: providerState });
      const guardrailSteps = buildV2GuardrailSteps(permission);
      appendActivity(setActivityLog, "guardrail", permission.allowed ? `Preflight: ${permission.requiresDeterministicTool ? `deterministic ${permission.toolName?.replaceAll("_", " ")} approved.` : `${permission.category} approved.`}` : `Preflight blocked: ${permission.reason}`, permission.allowed ? "success" : "warning");
      setMessages((thread) => [...thread, buildUserMessage(command)]);
      if (!permission.allowed) {
        setMessages((thread) => [
          ...thread,
          buildAgentMessage(`${permission.reason} ${permission.nextAction}.`, intent, guardrailSteps, defaultActions, "local", "blocked", selectedMechanism),
        ]);
        return;
      }
      if (permission.requiresDeterministicTool && modelProvider !== "local") {
        appendActivity(setActivityLog, "guardrail", "Model advisory mode: external provider may explain but not calculate. Routing numerical request to deterministic solver.", "info");
      }
      if (modelProvider !== "local" && !permission.requiresDeterministicTool) {
        if (providerState?.status !== "configured") {
          const label = providerState?.label ?? modelProvider;
          const msg = `${label} is not configured. Add a Dev Cloud key or use BYOK in Settings.`;
          appendActivity(setActivityLog, "provider", msg, "error");
          setMessages((thread) => [
            ...thread,
            buildAgentMessage(
              msg,
              intent,
              [
                ...guardrailSteps,
                { label: "Provider availability", status: "blocked", detail: `${msg} Deterministic solver commands remain available.` },
              ],
              defaultActions,
              modelProvider,
              "blocked",
              selectedMechanism,
            ),
          ]);
          return;
        }
        setMessages((thread) => [
          ...thread,
          buildAgentMessage(
            `Routing prompt to ${modelProvider} with current workspace context.`,
            intent,
            [
              ...guardrailSteps,
              completeStep("Model selected", modelProvider),
              completeStep(
                "Provider request",
                "Calling the server-side model route without exposing Dev Cloud keys to the browser.",
              ),
              {
                label: "Model response",
                status: "pending",
                detail: "Waiting for provider completion.",
              },
            ],
            defaultActions,
            modelProvider,
            "pending",
            selectedMechanism,
          ),
        ]);
        try {
          const response = await fetch("/api/v2/models/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              provider: modelProvider,
              prompt: command,
              context: { selectedMechanism, inputParameters, solverResult },
            }),
          });
          const json = (await response.json()) as {
            ok?: boolean;
            text?: string;
            error?: string;
            model?: string;
          };
          if (!response.ok || !json.ok)
            throw new Error(json.error ?? "Model request failed");
          setMessages((thread) => [
            ...thread,
            buildAgentMessage(
              json.text ?? "Model returned no text.",
              intent,
              [
                ...guardrailSteps,
                completeStep(
                  "Model selected",
                  `${modelProvider}${json.model ? ` · ${json.model}` : ""}`,
                ),
                completeStep(
                  "Provider request",
                  "Server-side model call completed.",
                ),
                completeStep(
                  "Workspace artifact guidance",
                  "Use deterministic solver tools for numerical mechanism truth; use model output for planning, explanation, tables, charts, and presentation drafting.",
                ),
              ],
              defaultActions,
              modelProvider,
              "completed",
              selectedMechanism,
            ),
          ]);
          appendActivity(
            setActivityLog,
            "provider",
            `${modelProvider} advisory response completed. Deterministic solver remains source of truth.`,
            "success",
          );
        } catch (modelError) {
          setMessages((thread) => [
            ...thread,
            buildAgentMessage(
              modelError instanceof Error
                ? modelError.message
                : "Model request failed",
              intent,
              [
                completeStep("Model selected", modelProvider),
                {
                  label: "Provider request",
                  status: "blocked",
                  detail:
                    "Connection failed. Add a Dev Cloud key in .env or verify a BYOK key in Settings.",
                },
              ],
              defaultActions,
              modelProvider,
              "failed",
              selectedMechanism,
            ),
          ]);
          appendActivity(
            setActivityLog,
            "provider",
            modelError instanceof Error
              ? modelError.message
              : "Model request failed",
            "error",
          );
        }
        return;
      }
      const missing = findMissingInputs(selectedMechanism, inputParameters);
      const hasResult = Boolean(solverResult);
      const preSteps = [...guardrailSteps, ...buildPreflightSteps(intent, missing, hasResult)];
      if (
        missing.length > 0 &&
        (intent === "analyze" || intent === "simulate")
      ) {
        setMessages((thread) => [
          ...thread,
          buildAgentMessage(
            "I need complete numeric parameters before selecting a deterministic solver tool.",
            intent,
            preSteps,
            defaultActions,
          ),
        ]);
        return;
      }
      if (intent === "analyze") {
        const response =
          selectedMechanism === "four_bar"
            ? await runAnalysis()
            : await runSliderCrankAnalysis();
        appendActivity(
          setActivityLog,
          "solver",
          response
            ? "Solver source-of-truth: backend analysis endpoint executed."
            : "Analysis failed or returned no deterministic output.",
          response ? "success" : "error",
        );
        setMessages((thread) => [
          ...thread,
          buildAgentMessage(
            `Analysis tool completed. ${summarizeDeterministicOutput(response)}`,
            intent,
            [
              ...preSteps,
              completeStep(
                "Tool selected",
                `${selectedMechanism} analysis endpoint`,
              ),
              completeStep(
                "Solver response received",
                summarizeDeterministicOutput(response),
              ),
              completeStep(
                "Suggested next action",
                "Run simulation, generate a report, or request synthesis direction.",
              ),
            ],
            defaultActions,
          ),
        ]);
        return;
      }
      if (intent === "simulate") {
        const response =
          selectedMechanism === "four_bar"
            ? await runSweep()
            : await runSliderCrankSweep();
        appendActivity(
          setActivityLog,
          "solver",
          response
            ? "Solver source-of-truth: backend sweep endpoint executed."
            : "Sweep failed or returned no deterministic output.",
          response ? "success" : "error",
        );
        setMessages((thread) => [
          ...thread,
          buildAgentMessage(
            `Sweep simulation completed. ${summarizeDeterministicOutput(response)}`,
            intent,
            [
              ...preSteps,
              completeStep(
                "Tool selected",
                `${selectedMechanism} sweep endpoint`,
              ),
              completeStep(
                "Solver response received",
                summarizeDeterministicOutput(response),
              ),
              completeStep(
                "Suggested next action",
                "Inspect samples, open results, or generate a report.",
              ),
            ],
            defaultActions,
          ),
        ]);
        return;
      }
      const normalizedCommand = command.toLowerCase();
      if (normalizedCommand.includes("open parameter"))
        setActiveArtifact("parameters");
      if (normalizedCommand.includes("open canvas"))
        setActiveArtifact("canvas");
      if (normalizedCommand.includes("open validation")) {
        setActive("Validation");
        setActiveArtifact("validation");
      }
      if (intent === "report") {
        setActive("Reports");
        setActiveArtifact("report");
      }
      if (
        normalizedCommand.includes("supervisor") ||
        normalizedCommand.includes("academic report") ||
        normalizedCommand.includes("project report") ||
        normalizedCommand.includes("copy report markdown")
      ) {
        setActive("Reports");
        setActiveArtifact("report");
        appendActivity(
          setActivityLog,
          "report",
          "Supervisor Submission Mode opened for academic report preparation.",
          "success",
        );
      }
      if (intent === "synthesize") setActiveArtifact("synthesis");
      if (intent === "validate") setActive("Validation");
      if (intent === "missing_parameters" || intent === "help")
        setActive("Agent");
      setMessages((thread) => [
        ...thread,
        buildAgentMessage(
          buildNonSolverReply(intent, missing, solverResult, command),
          intent,
          preSteps,
          defaultActions,
        ),
      ]);
    },
    [
      activeProvider,
      inputParameters,
      providerStatuses,
      runAnalysis,
      runSliderCrankAnalysis,
      runSliderCrankSweep,
      runSweep,
      selectedMechanism,
      solverResult,
    ],
  );

  const selectProvider = useCallback(
    (provider: V2ProviderId) => {
      const providerState = providerStatuses.find(
        (item) => item.id === provider,
      );
      setActiveProvider(
        providerState?.status === "configured" || provider === "local"
          ? provider
          : "local",
      );
      appendActivity(
        setActivityLog,
        "provider",
        provider === "local"
          ? "Local Deterministic Agent selected."
          : providerState?.status === "configured"
            ? `${providerState.label} selected for advisory model output.`
            : `${providerState?.label ?? provider} is not configured. Add a Dev Cloud key or use BYOK in Settings.`,
        provider === "local" || providerState?.status === "configured"
          ? "success"
          : "warning",
      );
    },
    [providerStatuses],
  );
  const selectMechanism = useCallback((mechanism: MechanismType) => {
    setSelectedMechanism(mechanism);
    const label =
      mechanism === "four_bar" ? "Four-Bar Linkage" : "Slider-Crank";
    appendActivity(
      setActivityLog,
      "mechanism",
      `Workspace switched to ${label}.`,
      "success",
    );
    setMessages((thread) => [
      ...thread,
      buildAgentMessage(
        `Workspace switched to ${label}.`,
        "help",
        [completeStep("Mechanism selected", label)],
        defaultActions,
        "local",
        "completed",
        mechanism,
      ),
    ]);
  }, []);

  return (
    <main className={`${v2ThemeClass[resolvedTheme]} ${v2Tokens.shell}`}>
      {restoreBannerOpen ? (
        <div className="fixed left-1/2 top-3 z-[60] flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-amber-600/40 bg-[#0d0c0b] px-4 py-3 text-xs text-v2-text shadow-2xl">
          <span>Previous V2 workspace restored from this browser.</span>
          <button
            onClick={clearSavedSession}
            className="font-bold text-amber-500 hover:text-amber-400"
          >
            Clear session
          </button>
          <button
            onClick={() => setRestoreBannerOpen(false)}
            className="text-v2-muted hover:text-v2-text"
          >
            Dismiss
          </button>
        </div>
      ) : null}
      <div className="relative z-10 grid min-h-screen gap-3 p-2 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)_390px]">
        <div className="fixed left-3 top-3 z-40 lg:hidden">
          <button
            onClick={() => setSidebarOpen((value) => !value)}
            className="rounded-xl border border-v2-border bg-[#080807] px-3 py-2 text-sm text-v2-text"
          >
            Missions
          </button>
        </div>
        <V2MissionSidebar
          active={active}
          onSelect={setActive}
          open={sidebarOpen}
        />
        <V2FirstRunOverlay
          open={guideOpen}
          onClose={closeGuide}
          onStartTemplate={startMissionTemplate}
        />
        <V2MissionCenter
          active={active}
          activeArtifact={activeArtifact}
          state={mechanismState}
          messages={messages}
          activeTask={activeTask}
          onCommand={runAgentCommand}
          onNavigate={setActive}
          onOpenArtifact={setActiveArtifact}
          onCloseArtifact={() => setActiveArtifact(null)}
          theme={theme}
          onThemeChange={setTheme}
          activeProvider={activeProvider}
          providers={providerStatuses}
          onProviderSelect={selectProvider}
          onMechanismSelect={selectMechanism}
          onStartTemplate={startMissionTemplate}
          onOpenGuide={() => setGuideOpen(true)}
          onResetMission={resetMissionState}
        />
        <V2OperationsPanel
          state={mechanismState}
          activeTask={activeTask}
          onOpenReports={() => setActive("Reports")}
          activeArtifact={activeArtifact}
          onOpenArtifact={(kind) => {
            setActive("Workspace");
            setActiveArtifact(kind);
          }}
          onCloseArtifact={() => setActiveArtifact(null)}
          onCommand={runAgentCommand}
          activeProvider={activeProvider}
          providers={providerStatuses}
          activityLog={activityLog}
          latestError={latestError}
          messages={messages}
          sessionStatus={sessionStatus}
          lastSavedAt={lastSavedAt}
          onSaveSession={saveSessionNow}
          onRestoreSession={restoreSavedSession}
          onClearSession={clearSavedSession}
          onResetWorkspace={resetMissionState}
        />
      </div>
    </main>
  );
}

const defaultActions = [
  { label: "Run analysis", command: "Run analysis" },
  { label: "Run simulation", command: "Run simulation" },
  { label: "Generate report", command: "Generate report" },
  { label: "Recommend improvement", command: "Recommend improvement" },
  { label: "Open results", command: "Open results" },
];

function buildUserMessage(text: string): V2AgentMessage {
  return { id: crypto.randomUUID(), role: "user", text };
}
function buildAgentMessage(
  text: string,
  intent?: V2AgentIntent,
  steps?: V2AgentStep[],
  actions = defaultActions,
  source: V2ProviderId = "local",
  status: V2AgentMessage["status"] = "completed",
  mechanism?: MechanismType,
): V2AgentMessage {
  return {
    id: crypto.randomUUID(),
    role: "agent",
    text,
    intent,
    steps,
    actions,
    source,
    status,
    mechanism,
  };
}
function completeStep(label: string, detail: string): V2AgentStep {
  return { label, detail, status: "complete" };
}
function detectIntent(command: string): V2AgentIntent {
  const normalized = command.toLowerCase();
  if (normalized.includes("sweep") || normalized.includes("simulate"))
    return "simulate";
  if (normalized.includes("report")) return "report";
  if (
    normalized.includes("recommend") ||
    normalized.includes("improve") ||
    normalized.includes("synthesize")
  )
    return "synthesize";
  if (normalized.includes("validate")) return "validate";
  if (/\b(explain|interpret|summari[sz]e)\b/.test(normalized)) return "help";
  if (normalized.includes("missing")) return "missing_parameters";
  if (normalized.includes("help")) return "help";
  return "analyze";
}
function findMissingInputs(
  _mechanism: MechanismType,
  inputParameters: Record<string, unknown>,
) {
  return Object.entries(inputParameters)
    .filter(([, value]) => typeof value !== "number" || Number.isNaN(value))
    .map(([key]) => key);
}
function buildPreflightSteps(
  intent: V2AgentIntent,
  missing: string[],
  hasResult: boolean,
): V2AgentStep[] {
  return [
    completeStep("Intent detected", intent),
    {
      label: "Parameter check",
      status: missing.length ? "blocked" : "complete",
      detail: missing.length
        ? `Missing or invalid: ${missing.join(", ")}`
        : "All required numeric fields are present.",
    },
    {
      label: "Tool selected",
      status:
        intent === "analyze" || intent === "simulate" ? "pending" : "complete",
      detail:
        intent === "analyze" || intent === "simulate"
          ? "Awaiting deterministic solver call."
          : "No solver call required for this command.",
    },
    {
      label: "Interpretation",
      status: hasResult ? "complete" : "pending",
      detail: hasResult
        ? "Existing deterministic result is available for summary and reporting."
        : "No solver result is available yet.",
    },
  ];
}
function buildNonSolverReply(
  intent: V2AgentIntent,
  missing: string[],
  solverResult: Record<string, unknown> | null,
  command = "",
) {
  if (intent === "missing_parameters")
    return missing.length
      ? `Missing or invalid parameters: ${missing.join(", ")}.`
      : "No required numeric parameters appear to be missing.";
  if (intent === "report")
    return /supervisor|academic|project|copy report markdown/i.test(command)
      ? "Opening Supervisor Submission Mode. The academic report preview will use deterministic solver evidence where available and mark missing evidence clearly."
      : solverResult
        ? "Opening the report builder with the available deterministic result context."
        : "Opening Reports. Run an analysis first for report-ready numerical content.";
  if (intent === "synthesize")
    return solverResult
      ? "Open Results and use synthesis recommendations to suggest iteration direction from solver output."
      : "Run analysis or simulation first; synthesis recommendations need deterministic result context.";
  if (intent === "validate")
    return "Opening validation context. This documents solver boundaries and source-of-truth rules.";
  if (/\b(explain|interpret|summari[sz]e)\b/i.test(command))
    return solverResult
      ? "I can explain the existing deterministic solver result as advisory interpretation. Solver values remain the numerical source of truth."
      : "No deterministic result exists yet. Run deterministic analysis first.";
  return "I can run analysis, run a sweep simulation, generate a report, recommend improvement direction after deterministic results exist, or list missing parameters. Unknown commands are preflighted instead of treated as solved.";
}

function summarizeDeterministicOutput(result: Record<string, unknown> | null) {
  if (!result)
    return "No deterministic result was returned; check the inspector error state.";
  const fields = [
    "valid",
    "theta2_deg",
    "theta3_deg",
    "theta4_deg",
    "theta_deg",
    "slider_position",
    "transmission_angle_deg",
    "sample_count",
    "valid_sample_count",
    "invalid_sample_count",
    "classification",
    "grashof_status",
  ];
  const parts = fields
    .filter((field) => result[field] !== undefined && result[field] !== null)
    .map((field) => `${field}: ${String(result[field])}`);
  return parts.length
    ? `Deterministic output summary — ${parts.join("; ")}.`
    : "Deterministic backend response stored; no compact scalar summary fields were present.";
}

function buildActivity(
  type: string,
  message: string,
  status: V2ActivityEvent["status"],
): V2ActivityEvent {
  return {
    id: crypto.randomUUID(),
    at: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    type,
    message,
    status,
  };
}
function appendActivity(
  setter: React.Dispatch<React.SetStateAction<V2ActivityEvent[]>>,
  type: string,
  message: string,
  status: V2ActivityEvent["status"],
) {
  setter((items) =>
    [buildActivity(type, message, status), ...items].slice(0, 12),
  );
}
