"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { V2ActivityEvent } from "@/components/v2/types";
import {
  clearV2Session,
  loadV2Session,
  saveV2Session,
  type V2WorkspaceSession,
} from "@/components/v2/v2SessionPersistence";

export type V2SessionStatus =
  | "Local session"
  | "Saving…"
  | "Saved"
  | "Restored";

export type UseV2SessionPersistenceResult = {
  sessionStatus: V2SessionStatus;
  lastSavedAt: string | null;
  restoreBannerOpen: boolean;
  setRestoreBannerOpen: (open: boolean) => void;
  saveSessionNow: () => void;
  restoreSavedSession: () => void;
  clearSavedSession: () => void;
};

type AppendActivity = (
  type: string,
  message: string,
  status: V2ActivityEvent["status"],
) => void;

export function useV2SessionPersistence({
  buildSession,
  restoreSession,
  appendActivity,
  ready = true,
}: {
  buildSession: () => V2WorkspaceSession;
  restoreSession: (session: V2WorkspaceSession) => void;
  appendActivity: AppendActivity;
  ready?: boolean;
}): UseV2SessionPersistenceResult {
  const [sessionStatus, setSessionStatus] =
    useState<V2SessionStatus>("Local session");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [restoreBannerOpen, setRestoreBannerOpen] = useState(false);
  const hasLoadedSession = useRef(false);
  const skipNextAutoSave = useRef(false);
  const saveTimer = useRef<number | null>(null);

  const persistSession = useCallback(
    (status: V2SessionStatus = "Saved") => {
      try {
        const session = buildSession();
        saveV2Session(session);
        setLastSavedAt(session.savedAt);
        setSessionStatus(status);
      } catch {
        appendActivity(
          "session",
          "Session could not be saved because browser storage is full.",
          "warning",
        );
        setSessionStatus("Local session");
      }
    },
    [appendActivity, buildSession],
  );

  useEffect(() => {
    const loaded = loadV2Session();
    if (loaded.status === "restored") {
      restoreSession(loaded.session);
      setSessionStatus("Restored");
      setLastSavedAt(loaded.session.savedAt);
      setRestoreBannerOpen(true);
      appendActivity(
        "session",
        "Previous V2 workspace session restored.",
        "success",
      );
    } else {
      appendActivity(
        "session",
        loaded.status === "invalid"
          ? "Saved V2 workspace session was invalid; safe defaults loaded."
          : "No saved V2 workspace session found.",
        loaded.status === "invalid" ? "warning" : "info",
      );
      if (loaded.status === "invalid") clearV2Session();
    }
    hasLoadedSession.current = true;
  }, [appendActivity, restoreSession]);

  useEffect(() => {
    if (!ready || !hasLoadedSession.current) return;
    if (skipNextAutoSave.current) {
      skipNextAutoSave.current = false;
      return;
    }
    setSessionStatus("Saving…");
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => persistSession("Saved"), 700);
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [persistSession, ready]);

  const saveSessionNow = useCallback(() => {
    persistSession("Saved");
    appendActivity(
      "session",
      "V2 workspace session saved manually.",
      "success",
    );
  }, [appendActivity, persistSession]);

  const restoreSavedSession = useCallback(() => {
    const loaded = loadV2Session();
    if (loaded.status === "restored") {
      restoreSession(loaded.session);
      setLastSavedAt(loaded.session.savedAt);
      setSessionStatus("Restored");
      setRestoreBannerOpen(true);
      appendActivity(
        "session",
        "Previous V2 workspace session restored.",
        "success",
      );
    } else {
      appendActivity(
        "session",
        "No saved V2 workspace session found.",
        "warning",
      );
    }
  }, [appendActivity, restoreSession]);

  const clearSavedSession = useCallback(() => {
    skipNextAutoSave.current = true;
    clearV2Session();
    setLastSavedAt(null);
    setSessionStatus("Local session");
    setRestoreBannerOpen(false);
    appendActivity(
      "session",
      "Saved V2 workspace session cleared from this browser.",
      "success",
    );
  }, [appendActivity]);

  return {
    sessionStatus,
    lastSavedAt,
    restoreBannerOpen,
    setRestoreBannerOpen,
    saveSessionNow,
    restoreSavedSession,
    clearSavedSession,
  };
}
