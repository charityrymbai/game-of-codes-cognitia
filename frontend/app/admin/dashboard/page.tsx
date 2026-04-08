"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { adminListContests, adminCreateContest } from "@/lib/api";
import { getAdminToken, clearAdminToken } from "@/lib/auth";

interface Contest {
  id: string;
  name: string;
  status: number;
  _count: { games: number; sessions: number };
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [newId, setNewId] = useState("");
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  const token = typeof window !== "undefined" ? getAdminToken() : null;

  useEffect(() => {
    if (!token) {
      router.replace("/admin");
    }
  }, [token, router]);

  const fetchContests = useCallback(async () => {
    if (!token) return;
    try {
      const result = await adminListContests(token);
      setContests(result.contests);
    } catch (error: unknown) {
      if (error instanceof Error && 'status' in error && (error as { status: number }).status === 401) {
        clearAdminToken();
        router.replace("/admin");
      }
      toast.error(error instanceof Error ? error.message : "Failed to load contests");
    } finally {
      setLoading(false);
    }
  }, [token, router]);

  useEffect(() => {
    fetchContests();
  }, [fetchContests]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newId || !newName) return;

    setCreating(true);
    try {
      await adminCreateContest(newId, newName, token);
      toast.success(`Contest ${newId} created!`);
      setNewId("");
      setNewName("");
      fetchContests();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to create contest");
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = () => {
    clearAdminToken();
    router.push("/admin");
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
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage your coding contests
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        {/* Create Contest Form */}
        <div className="glass rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Create New Contest
          </h2>
          <form onSubmit={handleCreate} className="flex gap-3 items-end">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Contest ID (4 digits)</Label>
              <Input
                value={newId}
                onChange={(e) => setNewId(e.target.value)}
                maxLength={4}
                placeholder="1234"
                className="bg-background/50 border-border/50 w-32 font-mono"
              />
            </div>
            <div className="flex-1 space-y-1.5">
              <Label className="text-xs text-muted-foreground">Contest Name</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Web Dev Challenge 2026"
                className="bg-background/50 border-border/50"
              />
            </div>
            <Button
              type="submit"
              disabled={creating}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-6"
            >
              {creating ? "Creating..." : "+ Create"}
            </Button>
          </form>
        </div>

        {/* Contests List */}
        <div className="space-y-3">
          {contests.map((contest) => (
            <div
              key={contest.id}
              className="glass-card rounded-2xl p-5 flex items-center justify-between cursor-pointer"
              onClick={() => router.push(`/admin/contests/${contest.id}`)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center text-purple-400 font-bold font-mono text-sm border border-purple-500/20">
                  {contest.id}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{contest.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {contest._count.games} games • {contest._count.sessions} participants
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  className={
                    contest.status === 1
                      ? "bg-green-500/20 text-green-400 border-green-500/30"
                      : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                  }
                >
                  {contest.status === 1 ? "🟢 Live" : "⏳ Waiting"}
                </Badge>
                <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}

          {contests.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-lg">No contests yet.</p>
              <p className="text-sm mt-1">Create your first contest above.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
