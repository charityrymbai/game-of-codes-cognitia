"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { docsCategories, DEFAULT_DOC_PATH, type DocEntry } from "@/lib/docs-map";

// Client-side cache so we don't re-fetch the same doc
const docCache = new Map<string, string>();

export default function DocsPanel() {
  const [selectedPath, setSelectedPath] = useState(DEFAULT_DOC_PATH);
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [contentSearch, setContentSearch] = useState("");
  const [showContentSearch, setShowContentSearch] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const contentSearchRef = useRef<HTMLInputElement>(null);

  const loadDoc = useCallback(async (docPath: string) => {
    // Check cache first
    if (docCache.has(docPath)) {
      setContent(docCache.get(docPath)!);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/docs?path=${encodeURIComponent(docPath)}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to load documentation");
      }
      const data = await res.json();
      docCache.set(docPath, data.content);
      setContent(data.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load documentation");
      setContent(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDoc(selectedPath);
  }, [selectedPath, loadDoc]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (dropdownOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    if (!dropdownOpen) setSearchQuery("");
  }, [dropdownOpen]);

  // Ctrl+F to toggle content search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        // Only intercept if the docs panel is in view
        const panel = dropdownRef.current?.closest(".flex.flex-col.h-full");
        if (panel) {
          e.preventDefault();
          setShowContentSearch(true);
          setTimeout(() => contentSearchRef.current?.focus(), 50);
        }
      }
      if (e.key === "Escape" && showContentSearch) {
        setShowContentSearch(false);
        setContentSearch("");
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showContentSearch]);

  const selectedEntry = docsCategories
    .flatMap((c) => c.entries)
    .find((e) => e.path === selectedPath);

  // Filter categories/entries by search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return docsCategories;
    const q = searchQuery.toLowerCase();
    return docsCategories
      .map((cat) => ({
        ...cat,
        entries: cat.entries.filter(
          (e) =>
            e.label.toLowerCase().includes(q) ||
            e.description.toLowerCase().includes(q)
        ),
      }))
      .filter((cat) => cat.entries.length > 0);
  }, [searchQuery]);

  // Count content search matches
  const contentMatchCount = useMemo(() => {
    if (!contentSearch.trim() || !content) return 0;
    const regex = new RegExp(contentSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    return (content.match(regex) || []).length;
  }, [contentSearch, content]);

  const handleSelect = (entry: DocEntry) => {
    setSelectedPath(entry.path);
    setDropdownOpen(false);
    setSearchQuery("");
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Topic Selector */}
      <div className="px-4 py-3 border-b border-border/30 bg-background/80 flex items-center gap-2" ref={dropdownRef}>
        <div className="relative flex-1">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg bg-muted/50 border border-border/40 hover:border-purple-500/40 transition-all text-sm text-foreground"
          >
            <span className="flex items-center gap-2 truncate">
              <span>{selectedEntry?.icon || "📖"}</span>
              <span className="font-medium truncate">{selectedEntry?.label || "Select topic"}</span>
            </span>
            <svg
              className={`w-4 h-4 text-muted-foreground transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-lg border border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl shadow-purple-500/10 max-h-80 overflow-hidden docs-dropdown flex flex-col">
              {/* Search input */}
              <div className="p-2 border-b border-border/30">
                <div className="relative">
                  <svg
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search topics…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-sm bg-muted/40 border border-border/30 rounded-md text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
                  />
                </div>
              </div>
              {/* Entries */}
              <div className="overflow-auto flex-1">
                {filteredCategories.length === 0 ? (
                  <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                    No topics matching &ldquo;{searchQuery}&rdquo;
                  </div>
                ) : (
                  filteredCategories.map((category) => (
                    <div key={category.label}>
                      <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30 sticky top-0">
                        {category.icon} {category.label}
                      </div>
                      {category.entries.map((entry) => (
                        <button
                          key={entry.path}
                          onClick={() => handleSelect(entry)}
                          className={`w-full text-left px-3 py-2.5 flex items-start gap-2.5 transition-all hover:bg-purple-500/10 ${
                            entry.path === selectedPath
                              ? "bg-purple-500/15 border-l-2 border-purple-500"
                              : "border-l-2 border-transparent"
                          }`}
                        >
                          <span className="text-sm mt-0.5">{entry.icon}</span>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-foreground truncate">{entry.label}</div>
                            <div className="text-xs text-muted-foreground truncate">{entry.description}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        <button
          onClick={() => {
            setShowContentSearch(!showContentSearch);
            if (!showContentSearch) {
              setTimeout(() => contentSearchRef.current?.focus(), 50);
            } else {
              setContentSearch("");
            }
          }}
          className={`flex-shrink-0 p-2.5 rounded-lg border transition-all ${
            showContentSearch
              ? "bg-purple-500/15 border-purple-500/40 text-purple-400"
              : "bg-muted/50 border-border/40 text-muted-foreground hover:border-purple-500/40 hover:text-foreground"
          }`}
          title="Search in document (Ctrl+F)"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>

      {/* Content Search Bar */}
      {showContentSearch && (
        <div className="px-4 py-2 border-b border-border/30 bg-background/80 flex items-center gap-2">
          <div className="relative flex-1">
            <svg
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={contentSearchRef}
              type="text"
              placeholder="Search in document…"
              value={contentSearch}
              onChange={(e) => setContentSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && (setShowContentSearch(false), setContentSearch(""))}
              className="w-full pl-8 pr-3 py-1.5 text-sm bg-muted/40 border border-border/30 rounded-md text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
            />
          </div>
          {contentSearch && (
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {contentMatchCount} {contentMatchCount === 1 ? "match" : "matches"}
            </span>
          )}
          <button
            onClick={() => { setShowContentSearch(false); setContentSearch(""); }}
            className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-auto px-5 py-4">
        {loading && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-muted-foreground">Loading documentation…</span>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-xl">⚠️</div>
            <p className="text-sm text-destructive">{error}</p>
            <button
              onClick={() => loadDoc(selectedPath)}
              className="text-xs text-purple-400 hover:text-purple-300 underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && content && (
          <article className="docs-prose prose prose-invert prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </article>
        )}
      </div>
    </div>
  );
}
