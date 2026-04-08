const SESSION_KEY = "contest_session";

export interface ContestSession {
  token: string;
  contestId: string;
  rollNo: string;
  sessionId: string;
  isSubmitted: boolean;
}

export function getSession(): ContestSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ContestSession;
  } catch {
    return null;
  }
}

export function setSession(session: ContestSession): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
}

export function updateSession(updates: Partial<ContestSession>): void {
  const current = getSession();
  if (!current) return;
  setSession({ ...current, ...updates });
}

export function getToken(): string | null {
  const session = getSession();
  return session?.token ?? null;
}

// ─── Local code storage (auto-save) ───────────────────────

const CODE_KEY_PREFIX = "game_code_";

export interface GameCode {
  html: string;
  css: string;
  js: string;
}

export function getLocalCode(contestId: string, gameId: string): GameCode | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${CODE_KEY_PREFIX}${contestId}_${gameId}`);
    if (!raw) return null;
    return JSON.parse(raw) as GameCode;
  } catch {
    return null;
  }
}

export function setLocalCode(contestId: string, gameId: string, code: GameCode): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${CODE_KEY_PREFIX}${contestId}_${gameId}`, JSON.stringify(code));
}

export function clearLocalCode(contestId: string, gameId: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(`${CODE_KEY_PREFIX}${contestId}_${gameId}`);
}

// ─── Admin auth ────────────────────────────────────────────

const ADMIN_KEY = "admin_session";

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ADMIN_KEY);
}

export function setAdminToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ADMIN_KEY, token);
}

export function clearAdminToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ADMIN_KEY);
}
