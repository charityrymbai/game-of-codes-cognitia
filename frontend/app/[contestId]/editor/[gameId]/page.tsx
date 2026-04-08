"use client";

import dynamic from "next/dynamic";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { saveCode, restoreCode, getGames } from "@/lib/api";
import { getSession, getLocalCode, setLocalCode } from "@/lib/auth";
import { useAntiCheat } from "@/lib/anti-cheat";
import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";

type TabType = "html" | "css" | "js";
type RightPanel = "preview" | "description" 
// | "docs";

// const DocsPanel = dynamic(() => import("@/components/docs-panel"), {
//   loading: () => (
//     <div className="flex items-center justify-center h-full">
//       <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
//     </div>
//   ),
//   ssr: false,
// });

export default function EditorPage() {
  const router = useRouter();
  const params = useParams();
  const contestId = params.contestId as string;
  const gameId = params.gameId as string;

  const [activeTab, setActiveTab] = useState<TabType>("html");
  const [rightPanel, setRightPanel] = useState<RightPanel>("preview");
  const [code, setCode] = useState({ html: "", css: "", js: "" });
  const [gameTitle, setGameTitle] = useState("");
  const [gameDescription, setGameDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const editorContainerRef = useRef<HTMLDivElement>(null);
  const editorViewRef = useRef<EditorView | null>(null);
  const codeRef = useRef(code);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Keep codeRef in sync
  useEffect(() => {
    codeRef.current = code;
  }, [code]);

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

  // Fetch game info
  useEffect(() => {
    const fetchGame = async () => {
      const session = getSession();
      if (!session) return;
      try {
        const result = await getGames(contestId, session.token);
        const game = result.games.find((g) => g.id === gameId);
        if (game) {
          setGameTitle(game.title);
          setGameDescription(game.description);
        }
      } catch {
        // Silent
      }
    };
    fetchGame();
  }, [contestId, gameId]);

  // Restore code on load
  useEffect(() => {
    const restore = async () => {
      const session = getSession();
      if (!session) return;

      // Try localStorage first
      const local = getLocalCode(contestId, gameId);
      if (local && (local.html || local.css || local.js)) {
        setCode(local);
        setLoaded(true);
        return;
      }

      // Try server
      try {
        const serverCode = await restoreCode(session.sessionId, session.token);
        if (serverCode[gameId]) {
          setCode(serverCode[gameId]);
          setLocalCode(contestId, gameId, serverCode[gameId]);
        }
      } catch {
        // Start with empty
      }
      setLoaded(true);
    };
    restore();
  }, [contestId, gameId]);

  // Create/update CodeMirror editor when tab changes or code loads
  useEffect(() => {
    if (!loaded || !editorContainerRef.current) return;

    // Destroy previous
    if (editorViewRef.current) {
      editorViewRef.current.destroy();
    }

    const langExtension =
      activeTab === "html" ? html() : activeTab === "css" ? css() : javascript();

    const state = EditorState.create({
      doc: code[activeTab],
      extensions: [
        basicSetup,
        langExtension,
        oneDark,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const newValue = update.state.doc.toString();
            setCode((prev) => ({ ...prev, [activeTab]: newValue }));
          }
        }),
        EditorView.theme({
          "&": { height: "100%", backgroundColor: "transparent" },
          ".cm-scroller": { overflow: "auto" },
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: editorContainerRef.current,
    });

    editorViewRef.current = view;

    return () => {
      view.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, loaded]);

  // Auto-save to localStorage every 3 seconds
  useEffect(() => {
    if (!loaded) return;

    autoSaveTimerRef.current = setInterval(() => {
      setLocalCode(contestId, gameId, codeRef.current);
    }, 3000);

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [contestId, gameId, loaded]);

  // Manual save to server
  const handleSave = useCallback(async () => {
    const session = getSession();
    if (!session) return;

    setSaving(true);
    try {
      await saveCode(
        session.sessionId,
        gameId,
        codeRef.current.html,
        codeRef.current.css,
        codeRef.current.js,
        session.token
      );
      setLocalCode(contestId, gameId, codeRef.current);
      toast.success("Code saved successfully!");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }, [contestId, gameId]);

  // Keyboard shortcut: Ctrl+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  // Generate preview HTML
  const previewSrcDoc = `
    <!DOCTYPE html>
    <html>
      <head><style>${code.css}</style></head>
      <body>${code.html}<script>${code.js}<\/script></body>
    </html>
  `;

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: "html", label: "HTML", icon: "🟧" },
    { key: "css", label: "CSS", icon: "🟦" },
    { key: "js", label: "JS", icon: "🟨" },
  ];

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top bar */}
      <div className="h-14 border-b border-border/40 flex items-center justify-between px-4 glass">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/${contestId}/dashboard`)}
            className="text-muted-foreground hover:text-foreground"
          >
            ← Back
          </Button>
          <div className="w-px h-6 bg-border/50" />
          <h1 className="text-sm font-semibold text-foreground truncate max-w-[300px]">
            {gameTitle || "Loading..."}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Ctrl+S to save</span>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs px-4"
          >
            {saving ? "Saving..." : "💾 Save"}
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel — Code editors */}
        <div className="w-1/2 flex flex-col border-r border-border/30">
          {/* Tabs */}
          <div className="flex border-b border-border/30 bg-background/50">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-5 py-3 text-sm font-medium transition-all border-b-2 ${
                  activeTab === tab.key
                    ? "border-purple-500 text-purple-400 bg-purple-500/5"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
                }`}
              >
                <span className="text-xs">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Editor */}
          <div ref={editorContainerRef} className="flex-1 overflow-hidden" />
        </div>

        {/* Right panel — Preview / Description */}
        <div className="w-1/2 flex flex-col">
          {/* Panel toggle */}
          <div className="flex border-b border-border/30 bg-background/50">
            <button
              onClick={() => setRightPanel("preview")}
              className={`flex items-center gap-1.5 px-5 py-3 text-sm font-medium transition-all border-b-2 ${
                rightPanel === "preview"
                  ? "border-green-500 text-green-400 bg-green-500/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
            >
              ▶ Preview
            </button>
            <button
              onClick={() => setRightPanel("description")}
              className={`flex items-center gap-1.5 px-5 py-3 text-sm font-medium transition-all border-b-2 ${
                rightPanel === "description"
                  ? "border-blue-500 text-blue-400 bg-blue-500/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
            >
              📋 Problem
            </button>
            {/* <button
              onClick={() => setRightPanel("docs")}
              className={`flex items-center gap-1.5 px-5 py-3 text-sm font-medium transition-all border-b-2 ${
                rightPanel === "docs"
                  ? "border-amber-500 text-amber-400 bg-amber-500/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
            >
              📚 Docs
            </button> */}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {rightPanel === "preview" ? (
              <iframe
                srcDoc={previewSrcDoc}
                className="w-full h-full bg-white"
                sandbox="allow-scripts"
                title="Preview"
              />
            ) 
            // : rightPanel === "docs" ? (
            //   <DocsPanel />
            // )
             : (
              <div className="p-6 overflow-auto h-full">
                <h2 className="text-xl font-bold text-foreground mb-4">
                  {gameTitle}
                </h2>
                <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {gameDescription}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
