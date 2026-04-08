const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface FetchOptions extends RequestInit {
  token?: string;
}

class ApiError extends Error {
  status: number;
  details?: string[];

  constructor(message: string, status: number, details?: string[]) {
    super(message);
    this.status = status;
    this.details = details;
    this.name = "ApiError";
  }
}

async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error || "An error occurred",
      response.status,
      data.details
    );
  }

  return data as T;
}

// ─── Contest APIs ──────────────────────────────────────────

export async function joinContest(contestId: string, rollNo: string) {
  return fetchApi<{ token: string; sessionId: string }>("/contests/join", {
    method: "POST",
    body: JSON.stringify({ contestId, rollNo }),
  });
}

export async function getContestStatus(contestId: string) {
  return fetchApi<{ status: number }>(`/contests/${contestId}/status`);
}

export async function getGames(contestId: string, token: string) {
  return fetchApi<{
    games: Array<{ id: string; title: string; description: string }>;
  }>(`/contests/${contestId}/games`, { token });
}

// ─── Session APIs ──────────────────────────────────────────

export async function saveCode(
  sessionId: string,
  gameId: string,
  html: string,
  css: string,
  js: string,
  token: string
) {
  return fetchApi<{ success: boolean }>(`/sessions/${sessionId}/save`, {
    method: "POST",
    body: JSON.stringify({ gameId, html, css, js }),
    token,
  });
}

export async function submitSession(sessionId: string, token: string) {
  return fetchApi<{ success: boolean }>(`/sessions/${sessionId}/submit`, {
    method: "POST",
    token,
  });
}

export async function reportViolation(sessionId: string, token: string) {
  return fetchApi<{ success: boolean }>(`/sessions/${sessionId}/violation`, {
    method: "POST",
    token,
  });
}

export async function restoreCode(sessionId: string, token: string) {
  return fetchApi<Record<string, { html: string; css: string; js: string }>>(
    `/sessions/${sessionId}/restore`,
    { token }
  );
}

// ─── System APIs ───────────────────────────────────────────

export async function reportError(error: string, context?: string, stack?: string) {
  return fetchApi<{ received: boolean }>("/system/error", {
    method: "POST",
    body: JSON.stringify({ error, context, stack }),
  });
}

// ─── Admin APIs ────────────────────────────────────────────

export async function adminLogin(username: string, password: string) {
  return fetchApi<{ token: string }>("/admin/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function adminListContests(token: string) {
  return fetchApi<{
    contests: Array<{
      id: string;
      name: string;
      status: number;
      _count: { games: number; sessions: number };
    }>;
  }>("/admin/contests", { token });
}

export async function adminCreateContest(id: string, name: string, token: string) {
  return fetchApi<{ id: string; name: string }>("/admin/contests", {
    method: "POST",
    body: JSON.stringify({ id, name }),
    token,
  });
}

export async function adminListGames(contestId: string, token: string) {
  return fetchApi<{
    games: Array<{ id: string; title: string; description: string }>;
  }>(`/admin/contests/${contestId}/games`, { token });
}

export async function adminAddGame(
  contestId: string,
  title: string,
  description: string,
  token: string
) {
  return fetchApi<{ id: string; title: string }>(`/admin/contests/${contestId}/games`, {
    method: "POST",
    body: JSON.stringify({ title, description }),
    token,
  });
}

export async function adminGetUsers(contestId: string, token: string) {
  return fetchApi<{
    users: Array<{
      sessionId: string;
      rollNo: string;
      isCheater: boolean;
      isSubmitted: boolean;
    }>;
  }>(`/admin/contests/${contestId}/users`, { token });
}

export async function adminStartContest(contestId: string, token: string) {
  return fetchApi<{ success: boolean }>(`/admin/contests/${contestId}/start`, {
    method: "PATCH",
    token,
  });
}
