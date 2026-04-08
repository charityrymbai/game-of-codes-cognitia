export interface DocEntry {
  label: string;
  path: string;
  description: string;
  icon: string;
}

export interface DocCategory {
  label: string;
  icon: string;
  entries: DocEntry[];
}

export const docsCategories: DocCategory[] = [
  {
    label: "Game Development",
    icon: "🎮",
    entries: [
      {
        label: "Game Loop (requestAnimationFrame)",
        path: "api/window/requestanimationframe/index.md",
        description: "Core animation loop for smooth 60fps rendering",
        icon: "🔄",
      },
      {
        label: "Canvas API",
        path: "api/canvas_api/index.md",
        description: "Drawing graphics via JavaScript and HTML <canvas>",
        icon: "🎨",
      },
      {
        label: "Canvas Element",
        path: "html/element/canvas/index.md",
        description: "The HTML <canvas> element",
        icon: "🖼️",
      },
      {
        label: "CanvasRenderingContext2D",
        path: "api/canvasrenderingcontext2d/index.md",
        description: "The 2D rendering context for <canvas>",
        icon: "✏️",
      },
    ],
  },
  {
    label: "Events & Input",
    icon: "⌨️",
    entries: [
      {
        label: "Keyboard Events",
        path: "api/keyboardevent/index.md",
        description: "Handle keyboard input for game controls",
        icon: "⌨️",
      },
      {
        label: "EventTarget",
        path: "api/eventtarget/index.md",
        description: "Base interface for event handling",
        icon: "🎯",
      },
    ],
  },
  {
    label: "DOM",
    icon: "🌐",
    entries: [
      {
        label: "Document",
        path: "api/document/index.md",
        description: "Entry point to the DOM tree",
        icon: "📄",
      },
      {
        label: "Element",
        path: "api/element/index.md",
        description: "Base class for all DOM elements",
        icon: "🧱",
      },
    ],
  },
];

/** Flat map for quick lookup by path */
export const docsMap: Record<string, DocEntry> = {};
docsCategories.forEach((cat) =>
  cat.entries.forEach((entry) => {
    docsMap[entry.path] = entry;
  })
);

/** Default doc to show */
export const DEFAULT_DOC_PATH = "api/window/requestanimationframe/index.md";
