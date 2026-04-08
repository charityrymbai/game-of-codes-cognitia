"use client";

import { useEffect } from "react";

export default function ViolationPage() {
  useEffect(() => {
    // Lock all navigation
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
    };
    window.addEventListener("popstate", handlePopState);

    // Prevent keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block F5, Ctrl+R, Ctrl+L, Alt+Left/Right
      if (
        e.key === "F5" ||
        (e.ctrlKey && e.key === "r") ||
        (e.ctrlKey && e.key === "l") ||
        (e.altKey && (e.key === "ArrowLeft" || e.key === "ArrowRight"))
      ) {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden select-none">
      {/* Background — red threat tone */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-950/40 via-background to-rose-950/30" />
      <div className="absolute top-1/3 -left-48 w-[500px] h-[500px] bg-red-600/8 rounded-full blur-3xl animate-float" />
      <div
        className="absolute bottom-1/3 -right-48 w-[500px] h-[500px] bg-rose-600/8 rounded-full blur-3xl animate-float"
        style={{ animationDelay: "3s" }}
      />

      <div className="relative z-10 text-center max-w-lg mx-4">
        <div
          className="glass rounded-3xl p-12 space-y-6"
          style={{ borderColor: "rgba(239,68,68,0.25)" }}
        >
          {/* Warning icon */}
          <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-red-500/20 to-rose-500/20 flex items-center justify-center border-2 border-red-500/30">
            <svg
              className="w-12 h-12 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-red-400 mb-2">Disqualified</h1>
            <p className="text-muted-foreground leading-relaxed">
              You have been flagged for violating the contest rules. Tab switching
              or leaving the contest window is not allowed.
            </p>
          </div>

          <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-4">
            <p className="text-sm text-red-300/80">
              ⛔ This decision is final and cannot be reversed. Your session has
              been permanently flagged.
            </p>
          </div>

          <div className="pt-4 border-t border-border/20">
            <p className="text-xs text-muted-foreground">
              If you believe this was an error, contact the contest administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
