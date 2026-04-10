"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getContestStatus } from "@/lib/api";
import { getSession } from "@/lib/auth";

export default function LobbyPage() {
  const router = useRouter();
  const params = useParams();
  const contestId = params.contestId as string;
  const [status, setStatus] = useState<number>(0);
  const [dots, setDots] = useState("");

  // Validate session
  useEffect(() => {
    const session = getSession();
    if (!session || session.contestId !== contestId) {
      router.replace("/join");
    }
  }, [contestId, router]);

  // Poll for contest status
  const pollStatus = useCallback(async () => {
    try {
      const result = await getContestStatus(contestId);
      setStatus(result.status);
    } catch {
      // Silently retry
    }
  }, [contestId]);

  useEffect(() => {
    pollStatus();
    const interval = setInterval(pollStatus, 2000);
    return () => clearInterval(interval);
  }, [pollStatus]);

  // Loading dots animation
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handleEnter = async () => {
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.error("Fullscreen request failed:", err);
    }
    router.push(`/${contestId}/dashboard`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950/40 via-background to-indigo-950/30" />
      <div className="absolute top-1/3 -left-48 w-[500px] h-[500px] bg-purple-600/8 rounded-full blur-3xl animate-float" />
      <div
        className="absolute bottom-1/3 -right-48 w-[500px] h-[500px] bg-indigo-600/8 rounded-full blur-3xl animate-float"
        style={{ animationDelay: "3s" }}
      />

      <div className="relative z-10 text-center max-w-lg mx-4">
        <div className="glass rounded-3xl p-12 space-y-8">
          {/* Animated ring */}
          <div className="relative mx-auto w-32 h-32">
            <div className="absolute inset-0 rounded-full border-4 border-purple-500/20" />
            <div
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin"
              style={{ animationDuration: "2s" }}
            />
            <div
              className="absolute inset-3 rounded-full border-4 border-transparent border-b-indigo-500 animate-spin"
              style={{ animationDuration: "3s", animationDirection: "reverse" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                {contestId}
              </span>
            </div>
          </div>

          {status === 0 ? (
            <>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Waiting for Contest{dots}
                </h2>
                <p className="text-muted-foreground text-sm">
                  The host hasn&apos;t started the contest yet. Hang tight!
                </p>
              </div>

              {/* Participant info */}
              <div className="bg-background/30 rounded-xl p-4">
                <p className="text-xs text-muted-foreground">
                  You&apos;re registered as
                </p>
                <p className="text-purple-400 font-mono font-bold text-lg">
                  {getSession()?.rollNo || "---"}
                </p>
              </div>
            </>
          ) : (
            <>
              <div>
                <h2 className="text-2xl font-bold text-green-400 mb-2">
                  🚀 Contest is LIVE!
                </h2>
                <p className="text-muted-foreground text-sm">
                  The contest has started. Enter now!
                </p>
              </div>

              <Button
                onClick={handleEnter}
                className="w-full h-14 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold text-lg transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25 animate-pulse-glow"
              >
                Enter Contest →
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
