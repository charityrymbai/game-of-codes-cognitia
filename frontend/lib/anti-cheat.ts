"use client";

import { useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { reportViolation } from "./api";
import { getSession } from "./auth";

interface UseAntiCheatOptions {
  onViolation: () => void;
  enabled?: boolean;
}

const parsedDebounceMs = Number(process.env.NEXT_PUBLIC_ANTI_CHEAT_DEBOUNCE_MS || "2000");
const ANTI_CHEAT_DEBOUNCE_MS = Number.isFinite(parsedDebounceMs) && parsedDebounceMs >= 0
  ? parsedDebounceMs
  : 2000;

export function useAntiCheat({ onViolation, enabled = true }: UseAntiCheatOptions) {
  const violationCount = useRef(0);

  const handleViolation = useCallback(async () => {
    violationCount.current += 1;

    if (violationCount.current === 1) {
      toast.warning("⚠️ Warning: Tab switching detected!", {
        description:
          "Leaving this page again will flag you for cheating and disqualify you.",
        duration: 5000,
      });
    } else if (violationCount.current >= 2) {
      // Report violation to backend
      const session = getSession();
      if (session) {
        try {
          await reportViolation(session.sessionId, session.token);
        } catch {
          // Already navigating away
        }
      }
      onViolation();
    }
  }, [onViolation]);

  useEffect(() => {
    if (!enabled) return;

    // Reset count on mount
    violationCount.current = 0;

    let violationTimer: number | null = null;

    const clearPendingViolation = () => {
      if (violationTimer) {
        window.clearTimeout(violationTimer);
        violationTimer = null;
      }
    };

    const scheduleViolationCheck = () => {
      clearPendingViolation();
      violationTimer = window.setTimeout(() => {
        violationTimer = null;

        if (document.visibilityState === "hidden") {
          handleViolation();
          return;
        }

        if (document.hasFocus()) {
          return;
        }

        const activeElement = document.activeElement;
        const isAllowedIframeFocus =
          activeElement instanceof HTMLIFrameElement &&
          activeElement.dataset.allowAntiCheatFocus === "true";

        if (isAllowedIframeFocus) {
          return;
        }

        handleViolation();
      }, ANTI_CHEAT_DEBOUNCE_MS);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        scheduleViolationCheck();
      } else {
        clearPendingViolation();
      }
    };

    const handleBlur = () => {
      scheduleViolationCheck();
    };

    const handleFocus = () => {
      clearPendingViolation();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      clearPendingViolation();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, [enabled, handleViolation]);
}
