import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const MDN_BASE = path.join(process.cwd(), "mdn-content", "files", "en-us", "web");

/** Strip YAML frontmatter delimited by --- */
function stripFrontmatter(content: string): string {
  const match = content.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  if (match) {
    return content.slice(match[0].length);
  }
  return content;
}

/** Resolve MDN macros to text instead of removing them entirely */
function resolveMacros(content: string): string {
  let result = content;

  // Handle common xref macros: {{jsxref("path", "display")}} or {{domxref("path")}}
  result = result.replace(
    /\{\{\s*(?:jsxref|domxref|cssxref|htmlattrxref|HTMLElement|MathMLElement)\s*\(\s*(?:"|')([^"']+)(?:"|')\s*(?:,\s*(?:"|')([^"']+)(?:"|'))?[^}]*\}\}/gi,
    (match, path, display) => {
      const text = display || path;
      if (match.toLowerCase().startsWith("{{htmlelement")) {
        return `\`<${text}>\``;
      }
      // Often the path has slashes, e.g. "Math/PI". If no display text, use the last part.
      const fallbackText = display ? display : path.split("/").pop();
      return `\`${fallbackText}\``;
    }
  );

  // Remove any remaining macros like {{APIRef}}, {{Compat}}, etc.
  result = result.replace(/\{\{[^}]*\}\}/g, "");

  return result;
}

/** Remove sections that aren't useful in-app */
function stripIrrelevantSections(content: string): string {
  const sectionsToRemove = [
    "## Specifications",
    "## Browser compatibility",
    "## See also",
  ];
  let result = content;
  for (const section of sectionsToRemove) {
    const idx = result.indexOf(section);
    if (idx !== -1) {
      // Find the next ## heading after this section
      const nextHeading = result.indexOf("\n## ", idx + section.length);
      if (nextHeading !== -1) {
        result = result.slice(0, idx) + result.slice(nextHeading);
      } else {
        // It's the last section — cut everything after
        result = result.slice(0, idx);
      }
    }
  }
  return result;
}

function cleanContent(raw: string): string {
  let content = stripFrontmatter(raw);
  content = resolveMacros(content);
  content = stripIrrelevantSections(content);
  return content.trim();
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const docPath = searchParams.get("path");

  if (!docPath) {
    return NextResponse.json({ error: "Missing 'path' query parameter" }, { status: 400 });
  }

  // Sanitize: prevent directory traversal
  const normalized = path.normalize(docPath).replace(/\.\./g, "");
  const fullPath = path.join(MDN_BASE, normalized);

  // Ensure the resolved path is within MDN_BASE
  if (!fullPath.startsWith(MDN_BASE)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  try {
    const raw = await fs.readFile(fullPath, "utf-8");
    const content = cleanContent(raw);

    return NextResponse.json(
      { content },
      {
        headers: {
          "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { error: "Document not found" },
      { status: 404 }
    );
  }
}
