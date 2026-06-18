"use client";

import { useEffect, useState } from "react";

type ProviderId = "openai" | "anthropic" | "gemini";
type ProviderStatus = "idle" | "checking" | "connected" | "error";

type ProviderInfo = {
  id: ProviderId;
  label: string;
  defaultModel: string;
  devCloudConfigured: boolean;
  authUrl: string | null;
};

type Connection = { status: ProviderStatus; message: string; key: string; source?: string; model?: string };

const fallbackProviders: ProviderInfo[] = [
  { id: "openai", label: "ChatGPT / OpenAI", defaultModel: "gpt-4o-mini", devCloudConfigured: false, authUrl: null },
  { id: "anthropic", label: "Claude / Anthropic", defaultModel: "claude-3-5-haiku-20241022", devCloudConfigured: false, authUrl: null },
  { id: "gemini", label: "Gemini / Google AI", defaultModel: "gemini-1.5-flash", devCloudConfigured: false, authUrl: null },
];

export function V2ModelSettingsPanel() {
  const [providers, setProviders] = useState<ProviderInfo[]>(fallbackProviders);
  const [connections, setConnections] = useState<Record<ProviderId, Connection>>({
    openai: { status: "idle", message: "Not connected", key: "" },
    anthropic: { status: "idle", message: "Not connected", key: "" },
    gemini: { status: "idle", message: "Not connected", key: "" },
  });

  useEffect(() => {
    fetch("/api/v2/models/connect")
      .then((response) => response.json())
      .then((json: { providers?: ProviderInfo[] }) => { if (json.providers?.length) { setProviders(json.providers); setConnections((current) => Object.fromEntries(json.providers!.map((provider) => [provider.id, { ...current[provider.id], status: provider.devCloudConfigured ? "connected" : "idle", source: provider.devCloudConfigured ? "dev-cloud" : undefined, model: provider.defaultModel, message: provider.devCloudConfigured ? "Configured via Dev Cloud key" : "Not connected · Dev Cloud key missing · BYOK can be verified for this session only" }])) as Record<ProviderId, Connection>); } })
      .catch(() => undefined);
  }, []);

  async function connect(provider: ProviderId, apiKey?: string) {
    setConnections((current) => ({ ...current, [provider]: { ...current[provider], status: "checking", message: "Verifying live provider…" } }));
    try {
      const response = await fetch("/api/v2/models/connect", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ provider, apiKey }) });
      const json = await response.json() as { ok: boolean; error?: string; source?: string; model?: string; account?: string };
      if (!response.ok || !json.ok) throw new Error(json.error ?? "Connection failed");
      setConnections((current) => ({ ...current, [provider]: { ...current[provider], status: "connected", source: json.source, model: json.model, message: `${json.account ?? "Connected"} · ${json.source === "byok" ? "BYOK" : "Dev Cloud"}` } }));
    } catch (error) {
      setConnections((current) => ({ ...current, [provider]: { ...current[provider], status: "error", message: error instanceof Error ? error.message : "Connection failed" } }));
    }
  }

  return <section className="rounded-[1.25rem] border border-v2-border bg-[#0d0c0b] p-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-500">Models + BYOK</p><h3 className="mt-2 text-lg font-semibold">Live model connections</h3></div>
      <span className="rounded-full border border-amber-600/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-500">server-routed calls</span>
    </div>
    <p className="mt-3 text-sm leading-6 text-v2-muted">Use Dev Cloud keys from environment variables or paste a BYOK key for a live verification. BYOK keys are sent only to the local Next API route for this request and are not stored in this UI.</p>
    <div className="mt-4 grid gap-3 xl:grid-cols-3">{providers.map((provider) => {
      const state = connections[provider.id] ?? { status: "idle", message: "Not connected", key: "" };
      return <div key={provider.id} className="rounded-2xl border border-v2-border bg-[#080807] p-4">
        <div className="flex items-start justify-between gap-2"><div><p className="font-semibold">{provider.label}</p><p className="mt-1 text-[11px] text-v2-muted">Default: {state.model ?? provider.defaultModel}</p><p className="mt-1 text-[11px] text-v2-muted">Key source: {state.source === "dev-cloud" ? "Dev Cloud key" : state.source === "byok" ? "BYOK session key" : "not connected"}</p><p className="mt-1 text-[11px] text-v2-muted">Auth URL: {provider.authUrl ? "available" : "unavailable"}</p></div><StatusBadge status={state.status} /></div>
        <div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => connect(provider.id)} className="rounded-full border border-v2-border bg-[#121110] px-3 py-1.5 text-[11px] font-semibold text-v2-muted hover:border-amber-600/40 hover:text-amber-500">Test connection</button>{provider.authUrl ? <a href={provider.authUrl} className="rounded-full border border-v2-border bg-[#121110] px-3 py-1.5 text-[11px] font-semibold text-v2-muted hover:border-amber-600/40 hover:text-amber-500">Connect account</a> : <span className="rounded-full border border-v2-border px-3 py-1.5 text-[11px] text-stone-600">OAuth URL not set</span>}</div>
        <div className="mt-3 flex gap-2"><input value={state.key} onChange={(event) => setConnections((current) => ({ ...current, [provider.id]: { ...state, key: event.target.value } }))} placeholder="Paste BYOK API key" type="password" className="min-w-0 flex-1 rounded-xl border border-v2-border bg-[#121110] px-3 py-2 text-xs text-v2-text outline-none focus:border-amber-600/50" /><button type="button" onClick={() => connect(provider.id, state.key)} className="rounded-xl bg-amber-600 px-3 py-2 text-xs font-bold text-black hover:bg-amber-500">Verify</button></div>
        <p className={`mt-3 text-xs ${state.status === "error" ? "text-red-400" : state.status === "connected" ? "text-amber-500" : "text-v2-muted"}`}>{state.message}{state.model ? ` · ${state.model}` : ""}</p>
      </div>;
    })}</div>
  </section>;
}

function StatusBadge({ status }: { status: ProviderStatus }) {
  const label = status === "connected" ? "configured" : status === "checking" ? "checking" : status === "error" ? "failed" : "not configured";
  const tone = status === "connected" ? "border-amber-600/30 bg-amber-500/10 text-amber-500" : status === "error" ? "border-red-500/30 bg-red-500/10 text-red-400" : "border-v2-border bg-[#121110] text-v2-muted";
  return <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${tone}`}>{label}</span>;
}
