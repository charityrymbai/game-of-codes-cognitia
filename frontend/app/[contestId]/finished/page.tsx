"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { getSession, updateSession } from "@/lib/auth";

export default function FinishedPage() {
  const params = useParams();
  const contestId = params.contestId as string;

  useEffect(() => {
    // Mark session as submitted in localStorage
    updateSession({ isSubmitted: true });

    // Block back navigation by replacing history
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
    };
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const session = typeof window !== "undefined" ? getSession() : null;

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-950/30 via-background to-emerald-950/20" />
      <div className="absolute top-1/3 -left-48 w-[500px] h-[500px] bg-green-600/8 rounded-full blur-3xl animate-float" />
      <div
        className="absolute bottom-1/3 -right-48 w-[500px] h-[500px] bg-emerald-600/8 rounded-full blur-3xl animate-float"
        style={{ animationDelay: "3s" }}
      />

      <div className="relative z-10 text-center max-w-lg mx-4">
        <div className="glass rounded-3xl p-12 space-y-6" style={{ borderColor: "rgba(34,197,94,0.2)" }}>
          {/* Success icon */}
          <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center border-2 border-green-500/30">
            <svg
              className="w-12 h-12 text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-green-400 mb-2">
              Submission Complete!
            </h1>
            <p className="text-muted-foreground">
              Your code has been submitted successfully for Contest{" "}
              <span className="text-green-400 font-mono font-bold">{contestId}</span>.
            </p>
          </div>

          {session && (
            <div className="bg-background/30 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Roll Number</span>
                <span className="text-foreground font-mono">{session.rollNo}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Contest</span>
                <span className="text-foreground font-mono">{session.contestId}</span>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-border/20">
            <p className="text-xs text-muted-foreground">
              🔒 You can safely close this window. Your submission is locked in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
