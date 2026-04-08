"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  adminListGames,
  adminAddGame,
  adminGetUsers,
  adminStartContest,
} from "@/lib/api";
import { getAdminToken, clearAdminToken } from "@/lib/auth";

interface Game {
  id: string;
  title: string;
  description: string;
}

interface User {
  sessionId: string;
  rollNo: string;
  isCheater: boolean;
  isSubmitted: boolean;
}

export default function AdminContestPage() {
  const router = useRouter();
  const params = useParams();
  const contestId = params.id as string;

  const [tab, setTab] = useState<"games" | "users">("games");
  const [games, setGames] = useState<Game[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  // Add game form
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [adding, setAdding] = useState(false);

  const token = typeof window !== "undefined" ? getAdminToken() : null;

  useEffect(() => {
    if (!token) {
      router.replace("/admin");
    }
  }, [token, router]);

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const [gamesResult, usersResult] = await Promise.all([
        adminListGames(contestId, token),
        adminGetUsers(contestId, token),
      ]);
      setGames(gamesResult.games);
      setUsers(usersResult.users);
    } catch (error: unknown) {
      if (error instanceof Error && 'status' in error && (error as { status: number }).status === 401) {
        clearAdminToken();
        router.replace("/admin");
      }
      toast.error(error instanceof Error ? error.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [contestId, token, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newTitle || !newDesc) return;

    setAdding(true);
    try {
      await adminAddGame(contestId, newTitle, newDesc, token);
      toast.success("Game added!");
      setNewTitle("");
      setNewDesc("");
      fetchData();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to add game");
    } finally {
      setAdding(false);
    }
  };

  const handleStart = async () => {
    if (!token) return;
    setStarting(true);
    try {
      await adminStartContest(contestId, token);
      toast.success("Contest started! 🚀");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to start");
    } finally {
      setStarting(false);
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
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950/30 via-background to-indigo-950/20" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/admin/dashboard")}
              className="text-muted-foreground"
            >
              ← Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Contest{" "}
                <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                  {contestId}
                </span>
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {games.length} games • {users.length} participants
              </p>
            </div>
          </div>
          <Button
            onClick={handleStart}
            disabled={starting}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold px-6"
          >
            {starting ? "Starting..." : "🚀 Start Contest"}
          </Button>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 mb-6 bg-background/30 rounded-xl p-1 w-fit">
          <button
            onClick={() => setTab("games")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === "games"
                ? "bg-purple-600/80 text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Games ({games.length})
          </button>
          <button
            onClick={() => setTab("users")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === "users"
                ? "bg-purple-600/80 text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Users ({users.length})
          </button>
        </div>

        {tab === "games" && (
          <div className="space-y-6">
            {/* Add game form */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Add Challenge
              </h2>
              <form onSubmit={handleAddGame} className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Title</Label>
                  <Input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Build a Navbar"
                    className="bg-background/50 border-border/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Description
                  </Label>
                  <textarea
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Create a responsive navigation bar with a hamburger menu for mobile..."
                    rows={4}
                    className="w-full rounded-lg bg-background/50 border border-border/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-purple-500 focus:outline-none transition-colors resize-none"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={adding}
                  className="bg-purple-600 hover:bg-purple-500 text-white px-6"
                >
                  {adding ? "Adding..." : "+ Add Game"}
                </Button>
              </form>
            </div>

            {/* Games list */}
            <div className="space-y-3">
              {games.map((game, i) => (
                <div key={game.id} className="glass-card rounded-2xl p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-xs mt-0.5">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">
                        {game.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {game.description}
                      </p>
                      <p className="text-xs text-muted-foreground/50 mt-2 font-mono">
                        ID: {game.id}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "users" && (
          <div className="glass rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left text-xs text-muted-foreground font-medium px-5 py-3">
                    #
                  </th>
                  <th className="text-left text-xs text-muted-foreground font-medium px-5 py-3">
                    Roll Number
                  </th>
                  <th className="text-left text-xs text-muted-foreground font-medium px-5 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs text-muted-foreground font-medium px-5 py-3">
                    Cheater
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, i) => (
                  <tr
                    key={user.sessionId}
                    className="border-b border-border/10 hover:bg-muted/10 transition-colors"
                  >
                    <td className="px-5 py-3 text-sm text-muted-foreground">
                      {i + 1}
                    </td>
                    <td className="px-5 py-3 text-sm font-mono text-foreground">
                      {user.rollNo}
                    </td>
                    <td className="px-5 py-3">
                      <Badge
                        className={
                          user.isSubmitted
                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                        }
                      >
                        {user.isSubmitted ? "Submitted" : "In Progress"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      {user.isCheater ? (
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                          ⛔ Flagged
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-10 text-muted-foreground text-sm"
                    >
                      No participants yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
