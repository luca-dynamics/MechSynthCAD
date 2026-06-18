"use client";

import { useEffect, useState } from "react";
import type { V2ProviderId, V2ProviderStatus } from "@/components/v2/types";

export const defaultProviderStatuses: V2ProviderStatus[] = [
  {
    id: "local",
    label: "Local Deterministic Agent",
    defaultModel: "backend deterministic solver",
    status: "local",
    keySource: "Local deterministic",
    message: "Default numerical source of truth.",
  },
  {
    id: "openai",
    label: "ChatGPT / OpenAI",
    defaultModel: "gpt-4o-mini",
    status: "not_configured",
    keySource: "not connected",
    message:
      "OpenAI is not configured. Add a Dev Cloud key or use BYOK in Settings.",
  },
  {
    id: "anthropic",
    label: "Claude / Anthropic",
    defaultModel: "claude-3-5-haiku-20241022",
    status: "not_configured",
    keySource: "not connected",
    message:
      "Anthropic is not configured. Add a Dev Cloud key or use BYOK in Settings.",
  },
  {
    id: "gemini",
    label: "Gemini / Google AI",
    defaultModel: "gemini-1.5-flash",
    status: "not_configured",
    keySource: "not connected",
    message:
      "Gemini is not configured. Add a Dev Cloud key or use BYOK in Settings.",
  },
];

export function useV2ProviderStatus() {
  const [providerStatuses, setProviderStatuses] = useState<V2ProviderStatus[]>(
    defaultProviderStatuses,
  );

  useEffect(() => {
    fetch("/api/v2/models/connect")
      .then((r) => r.json())
      .then(
        (json: {
          providers?: Array<{
            id: string;
            label: string;
            defaultModel: string;
            devCloudConfigured: boolean;
            authUrl: string | null;
          }>;
        }) =>
          setProviderStatuses([
            defaultProviderStatuses[0],
            ...(json.providers ?? []).map((p) => ({
              id: p.id as V2ProviderId,
              label: p.label,
              defaultModel: p.defaultModel,
              status: p.devCloudConfigured
                ? ("configured" as const)
                : ("not_configured" as const),
              keySource: p.devCloudConfigured
                ? ("Dev Cloud key" as const)
                : ("not connected" as const),
              authUrlAvailable: Boolean(p.authUrl),
              message: p.devCloudConfigured
                ? `${p.label} is configured via Dev Cloud key.`
                : `${p.label} is not configured. Add a Dev Cloud key or use BYOK in Settings.`,
            })),
          ]),
      )
      .catch(() =>
        setProviderStatuses((items) =>
          items.map((p) =>
            p.id === "local"
              ? p
              : {
                  ...p,
                  status: "connection_failed",
                  message: "Provider status endpoint unavailable.",
                },
          ),
        ),
      );
  }, []);

  return { providerStatuses };
}
