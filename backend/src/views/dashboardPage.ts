import { renderLayout, escapeHtml } from "./layout";

interface Contest {
  id: string;
  name: string;
  status: number;
  _count: { games: number; sessions: number };
}

export function renderDashboardPage(
  contests: Contest[],
  flash?: { type: "error" | "success"; message: string } | null
): string {
  const contestCards = contests.length
    ? contests
        .map(
          (c) => `
        <a href="/admin/contests/${escapeHtml(c.id)}" class="contest-link">
          <div style="display:flex; justify-content:space-between; align-items:start;">
            <div>
              <div class="contest-name">${escapeHtml(c.name)}</div>
              <div class="contest-id">#${escapeHtml(c.id)}</div>
            </div>
            ${
              c.status === 1
                ? `<span class="badge badge--green"><span>●</span> Active</span>`
                : `<span class="badge badge--yellow"><span>○</span> Waiting</span>`
            }
          </div>
          <div class="contest-meta">
            <span class="badge badge--purple">🎮 ${c._count.games} game${c._count.games !== 1 ? "s" : ""}</span>
            <span class="badge badge--gray">👥 ${c._count.sessions} participant${c._count.sessions !== 1 ? "s" : ""}</span>
          </div>
        </a>`
        )
        .join("")
    : `<div class="card" style="text-align:center; padding:48px; color:var(--text-muted);">
         <div style="font-size:2.5rem; margin-bottom:12px;">📭</div>
         <p>No contests yet. Create one below.</p>
       </div>`;

  const content = `
    <div class="page-header">
      <h1 class="page-title">Dashboard</h1>
      <p class="page-subtitle">Manage all contests, games, and participants</p>
    </div>

    <!-- Stats row -->
    <div class="grid grid--2" style="grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); margin-bottom:32px;">
      <div class="card stat">
        <div class="stat-value">${contests.length}</div>
        <div class="stat-label">Total Contests</div>
      </div>
      <div class="card stat">
        <div class="stat-value">${contests.filter((c) => c.status === 1).length}</div>
        <div class="stat-label">Active</div>
      </div>
      <div class="card stat">
        <div class="stat-value">${contests.reduce((a, c) => a + c._count.games, 0)}</div>
        <div class="stat-label">Total Games</div>
      </div>
      <div class="card stat">
        <div class="stat-value">${contests.reduce((a, c) => a + c._count.sessions, 0)}</div>
        <div class="stat-label">Participants</div>
      </div>
    </div>

    <div class="grid grid--1-2">
      <!-- Create contest form -->
      <div class="card">
        <div class="card-title">➕ Create Contest</div>
        <form method="POST" action="/admin/dashboard/contests">
          <div class="form-group">
            <label for="contestId">Contest ID <span style="color:var(--text-muted); font-weight:400;">(4 digits)</span></label>
            <input id="contestId" type="text" name="id" placeholder="e.g. 1234" maxlength="4" pattern="[0-9]{4}" required />
          </div>
          <div class="form-group">
            <label for="contestName">Contest Name</label>
            <input id="contestName" type="text" name="name" placeholder="e.g. Round 1" required />
          </div>
          <button type="submit" class="btn btn--primary btn--full" style="margin-top:8px;">Create Contest</button>
        </form>
      </div>

      <!-- Contests list -->
      <div>
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px;">
          <h2 style="font-size:1rem; font-weight:700; color:var(--text);">All Contests (${contests.length})</h2>
        </div>
        <div style="display:flex; flex-direction:column; gap:12px;">
          ${contestCards}
        </div>
      </div>
    </div>`;

  return renderLayout({ title: "Dashboard", isLoggedIn: true, content, flash: flash ?? null });
}
