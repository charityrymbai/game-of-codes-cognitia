"use client";

import { useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { reportViolation } from "./api";
import { getSession } from "./auth";

interface UseAntiCheatOptions {
  onViolation: () => void;
  enabled?: boolean;
}

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

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        handleViolation();
      }
    };

    const handleBlur = () => {
      handleViolation();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [enabled, handleViolation]);
}
