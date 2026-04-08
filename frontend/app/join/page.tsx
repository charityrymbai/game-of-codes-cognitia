"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { joinContest } from "@/lib/api";
import { setSession } from "@/lib/auth";

const ROLL_NO_REGEX = /^[A-Z][0-9]{2}[A-Z]{2}[0-9]{3}$/;
const CONTEST_ID_REGEX = /^[0-9]{4}$/;

export default function JoinPage() {
  const router = useRouter();
  const [contestId, setContestId] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ contestId?: string; rollNo?: string }>({});

  const validate = (): boolean => {
    const newErrors: { contestId?: string; rollNo?: string } = {};

    if (!CONTEST_ID_REGEX.test(contestId)) {
      newErrors.contestId = "Contest ID must be a 4-digit code";
    }

    const upperRoll = rollNo.toUpperCase();
    if (!ROLL_NO_REGEX.test(upperRoll)) {
      newErrors.rollNo = "Invalid format (e.g. A12CD345)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const upperRoll = rollNo.toUpperCase();
      const result = await joinContest(contestId, upperRoll);

      setSession({
        token: result.token,
        contestId,
        rollNo: upperRoll,
        sessionId: result.sessionId,
        isSubmitted: false,
      });

      toast.success("Joined successfully! Redirecting to lobby...");
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } catch (err) {
        console.error("Fullscreen request failed:", err);
      }
      router.push(`/${contestId}/lobby`);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to join contest");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950/40 via-background to-indigo-950/30" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-float" />
      <div
        className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-float"
        style={{ animationDelay: "3s" }}
      />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(139,92,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 mb-4 animate-pulse-glow">
            <span className="text-2xl font-bold text-white">&lt;/&gt;</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
            Game of Codes
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Enter the arena. Prove your skills.
          </p>
        </div>

        {/* Join Card */}
        <form onSubmit={handleJoin} className="glass rounded-2xl p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="contestId" className="text-sm font-medium text-purple-300">
              Contest Code
            </Label>
            <Input
              id="contestId"
              placeholder="e.g. 1234"
              value={contestId}
              onChange={(e) => {
                setContestId(e.target.value);
                setErrors((prev) => ({ ...prev, contestId: undefined }));
              }}
              maxLength={4}
              className="text-black bg-background/50 border-border/50 focus:border-purple-500 transition-colors h-12 text-lg tracking-widest text-center font-mono"
            />
            {errors.contestId && (
              <p className="text-xs text-red-400">{errors.contestId}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="rollNo" className="text-sm font-medium text-purple-300">
              Roll Number
            </Label>
            <Input
              id="rollNo"
              placeholder="e.g. A12CD345"
              value={rollNo}
              onChange={(e) => {
                setRollNo(e.target.value.toUpperCase());
                setErrors((prev) => ({ ...prev, rollNo: undefined }));
              }}
              maxLength={8}
              className="text-black bg-background/50 border-border/50 focus:border-purple-500 transition-colors h-12 text-lg tracking-wider text-center font-mono uppercase"
            />
            {errors.rollNo && (
              <p className="text-xs text-red-400">{errors.rollNo}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-base transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Joining...
              </span>
            ) : (
              "Enter Contest →"
            )}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-6">
          By joining, you agree to the contest rules and anti-cheat policy.
        </p>
      </div>
    </div>
  );
}
