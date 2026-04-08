"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getGames, restoreCode, submitSession } from "@/lib/api";
import { getSession, getLocalCode } from "@/lib/auth";
import { useAntiCheat } from "@/lib/anti-cheat";

interface Game {
  id: string;
  title: string;
  description: string;
}

type GameStatus = "not_started" | "draft" | "saved";

export default function DashboardPage() {
  const router = useRouter();
  const params = useParams();
  const contestId = params.contestId as string;
  const [games, setGames] = useState<Game[]>([]);
  const [gameStatuses, setGameStatuses] = useState<Record<string, GameStatus>>({});
  const [expandedGame, setExpandedGame] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Anti-cheat
  useAntiCheat({
    onViolation: () => router.replace("/violation"),
    enabled: true,
  });

  // Auth check
  useEffect(() => {
    const session = getSession();
    if (!session || session.contestId !== contestId) {
      router.replace("/join");
      return;
    }
    if (session.isSubmitted) {
      router.replace(`/${contestId}/finished`);
    }
  }, [contestId, router]);

  // Fetch games and code status
  const fetchData = useCallback(async () => {
    const session = getSession();
    if (!session) return;

    try {
      const [gamesResult, savedCode] = await Promise.all([
        getGames(contestId, session.token),
        restoreCode(session.sessionId, session.token),
      ]);

      setGames(gamesResult.games);

      // Determine status per game
      const statuses: Record<string, GameStatus> = {};
      for (const game of gamesResult.games) {
        const serverCode = savedCode[game.id];
        const localCode = getLocalCode(contestId, game.id);

        if (serverCode && (serverCode.html || serverCode.css || serverCode.js)) {
          statuses[game.id] = "saved";
        } else if (localCode && (localCode.html || localCode.css || localCode.js)) {
          statuses[game.id] = "draft";
        } else {
          statuses[game.id] = "not_started";
        }
      }
      setGameStatuses(statuses);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to load games");
    } finally {
      setLoading(false);
    }
  }, [contestId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async () => {
    const session = getSession();
    if (!session) return;

    setSubmitting(true);
    try {
      await submitSession(session.sessionId, session.token);
      toast.success("Submitted successfully!");
      router.push(`/${contestId}/finished`);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: GameStatus) => {
    switch (status) {
      case "saved":
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30">
            ✓ Saved
          </Badge>
        );
      case "draft":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30">
            ✎ Draft
          </Badge>
        );
      default:
        return (
          <Badge className="bg-muted/50 text-muted-foreground border-border/50 hover:bg-muted">
            Not Started
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950/30 via-background to-indigo-950/20" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Challenges
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Contest {contestId} • {games.length} challenges
            </p>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold px-6 transition-all hover:shadow-lg hover:shadow-green-500/20"
          >
            {submitting ? "Submitting..." : "Submit All →"}
          </Button>
        </div>

        {/* Games Grid */}
        <div className="space-y-4">
          {games.map((game, index) => (
            <div
              key={game.id}
              className="glass-card rounded-2xl overflow-hidden"
            >
              <div
                className="p-6 cursor-pointer flex items-center justify-between"
                onClick={() =>
                  setExpandedGame(expandedGame === game.id ? null : game.id)
                }
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center text-purple-400 font-bold text-sm border border-purple-500/20">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {game.title}
                    </h3>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(gameStatuses[game.id] || "not_started")}
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/${contestId}/editor/${game.id}`);
                    }}
                    className="bg-purple-600/80 hover:bg-purple-500 text-white text-xs px-4"
                  >
                    Open Editor
                  </Button>
                  <svg
                    className={`w-5 h-5 text-muted-foreground transition-transform ${
                      expandedGame === game.id ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              {expandedGame === game.id && (
                <div className="px-6 pb-6 border-t border-border/30">
                  <div className="pt-4 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {game.description}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {games.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">No challenges available yet.</p>
            <p className="text-sm mt-2">Check back in a moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
