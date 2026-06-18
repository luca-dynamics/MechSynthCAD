import type {
  FourBarAnalysisResult,
  FourBarForm,
  FourBarSweepResponse,
  MechanismType,
  SliderCrankAnalysisResult,
  SliderCrankForm,
  SliderCrankSweepForm,
  SliderCrankSweepResponse,
  SweepForm,
  SynthesisResponse,
} from "@/types";
import type {
  V2ActivityEvent,
  V2AgentMessage,
  V2ArtifactKind,
  V2NavItem,
  V2ProviderId,
  V2Theme,
} from "@/components/v2/types";

export const V2_SESSION_STORAGE_KEY = "mechsynthcad:v2:workspace-session";
export const V2_SESSION_VERSION = 1;
export const V2_SESSION_MESSAGE_LIMIT = 30;
export const V2_SESSION_ACTIVITY_LIMIT = 50;

export type V2WorkspaceSession = {
  version: 1;
  savedAt: string;
  selectedMechanism: MechanismType;
  activeProvider: V2ProviderId;
  active: V2NavItem;
  activeArtifact: V2ArtifactKind | null;
  fourBar: {
    form: FourBarForm;
    sweepForm: SweepForm;
    result: FourBarAnalysisResult | null;
    sweepResult: FourBarSweepResponse | null;
    selectedSampleIndex: number;
  };
  sliderCrank: {
    form: SliderCrankForm;
    sweepForm: SliderCrankSweepForm;
    result: SliderCrankAnalysisResult | null;
    sweepResult: SliderCrankSweepResponse | null;
    selectedSampleIndex: number;
  };
  latestSynthesisRecommendations: SynthesisResponse | null;
  messages: V2AgentMessage[];
  activityLog: V2ActivityEvent[];
  theme: V2Theme;
};

export type V2SessionLoadResult =
  | { status: "restored"; session: V2WorkspaceSession }
  | { status: "missing"; session: null }
  | { status: "invalid"; session: null; error: string };

export function saveV2Session(session: V2WorkspaceSession): void {
  window.localStorage.setItem(
    V2_SESSION_STORAGE_KEY,
    JSON.stringify(normalizeV2Session(session)),
  );
}

export function loadV2Session(): V2SessionLoadResult {
  const raw = window.localStorage.getItem(V2_SESSION_STORAGE_KEY);
  if (!raw) return { status: "missing", session: null };
  try {
    const parsed = JSON.parse(raw) as unknown;
    const session = migrateV2Session(parsed);
    return session
      ? { status: "restored", session }
      : {
          status: "invalid",
          session: null,
          error: "Saved session shape is not supported.",
        };
  } catch (error) {
    return {
      status: "invalid",
      session: null,
      error:
        error instanceof Error
          ? error.message
          : "Unable to parse saved session.",
    };
  }
}

export function clearV2Session(): void {
  window.localStorage.removeItem(V2_SESSION_STORAGE_KEY);
}

export function normalizeV2Session(
  session: V2WorkspaceSession,
): V2WorkspaceSession {
  return {
    ...session,
    version: V2_SESSION_VERSION,
    messages: session.messages
      .slice(-V2_SESSION_MESSAGE_LIMIT)
      .map(trimMessage),
    activityLog: session.activityLog
      .slice(0, V2_SESSION_ACTIVITY_LIMIT)
      .map(trimActivity),
    fourBar: {
      ...session.fourBar,
      sweepResult: trimSweep(session.fourBar.sweepResult),
    },
    sliderCrank: {
      ...session.sliderCrank,
      sweepResult: trimSweep(session.sliderCrank.sweepResult),
    },
  };
}

function migrateV2Session(value: unknown): V2WorkspaceSession | null {
  if (!isRecord(value) || value.version !== V2_SESSION_VERSION) return null;
  if (
    !isMechanism(value.selectedMechanism) ||
    !isProvider(value.activeProvider) ||
    !isNav(value.active) ||
    !isTheme(value.theme)
  )
    return null;
  if (!(value.activeArtifact === null || isArtifact(value.activeArtifact)))
    return null;
  if (
    !isRecord(value.fourBar) ||
    !isRecord(value.sliderCrank) ||
    typeof value.savedAt !== "string"
  )
    return null;
  const messages = Array.isArray(value.messages)
    ? value.messages.filter(isMessage)
    : [];
  const activityLog = Array.isArray(value.activityLog)
    ? value.activityLog.filter(isActivity)
    : [];
  return normalizeV2Session({
    ...(value as V2WorkspaceSession & { version: 1 }),
    messages,
    activityLog,
  });
}

function trimMessage(message: V2AgentMessage): V2AgentMessage {
  return {
    ...message,
    text: trimString(message.text, 4000),
    steps: message.steps?.map((step) => ({
      ...step,
      detail: trimString(step.detail, 1200),
    })),
  };
}

function trimActivity(event: V2ActivityEvent): V2ActivityEvent {
  return { ...event, message: trimString(event.message, 1000) };
}
function trimString(value: string, limit: number) {
  return value.length > limit ? `${value.slice(0, limit)}…` : value;
}
function trimSweep<T extends { samples?: unknown[] } | null>(sweep: T): T {
  if (!sweep?.samples || sweep.samples.length <= 240) return sweep;
  return { ...sweep, samples: sweep.samples.slice(0, 240) } as T;
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
function isMechanism(value: unknown): value is MechanismType {
  return value === "four_bar" || value === "slider_crank";
}
function isProvider(value: unknown): value is V2ProviderId {
  return (
    value === "local" ||
    value === "openai" ||
    value === "anthropic" ||
    value === "gemini"
  );
}
function isNav(value: unknown): value is V2NavItem {
  return [
    "Overview",
    "Workspace",
    "Results",
    "Agent",
    "Reports",
    "Validation",
    "Settings",
  ].includes(String(value));
}
function isArtifact(value: unknown): value is V2ArtifactKind {
  return [
    "canvas",
    "parameters",
    "result",
    "simulation",
    "report",
    "validation",
    "synthesis",
  ].includes(String(value));
}
function isTheme(value: unknown): value is V2Theme {
  return value === "dark" || value === "light" || value === "system";
}
function isMessage(value: unknown): value is V2AgentMessage {
  return (
    isRecord(value) &&
    (value.role === "user" || value.role === "agent") &&
    typeof value.text === "string" &&
    typeof value.id === "string"
  );
}
function isActivity(value: unknown): value is V2ActivityEvent {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.at === "string" &&
    typeof value.type === "string" &&
    typeof value.message === "string"
  );
}
