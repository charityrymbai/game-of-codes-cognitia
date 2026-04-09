import { renderLayout, escapeHtml } from "./layout";

interface Game {
  id: string;
  title: string;
  description: string;
  contestId: string;
}

interface Session {
  sessionId: string;
  rollNo: string;
  isCheater: boolean;
  isSubmitted: boolean;
}

interface Contest {
  id: string;
  name: string;
  status: number;
}

export function renderContestPage(
  contest: Contest,
  games: Game[],
  users: Session[],
  flash?: { type: "error" | "success"; message: string } | null
): string {
  const statusBadge =
    contest.status === 1
      ? `<span class="badge badge--green" style="font-size:13px;"><span>●</span> Active</span>`
      : `<span class="badge badge--yellow" style="font-size:13px;"><span>○</span> Waiting to Start</span>`;

  const gamesRows = games.length
    ? games
        .map(
          (g, i) => `
        <tr>
          <td style="color:var(--text-muted); font-size:13px;">${i + 1}</td>
          <td style="font-weight:600; color:var(--text);">${escapeHtml(g.title)}</td>
          <td class="td-muted" style="max-width:400px;">${escapeHtml(g.description)}</td>
          <td><span class="badge badge--gray" style="font-family:monospace; font-size:11px;">${escapeHtml(g.id.slice(0, 8))}…</span></td>
        </tr>`
        )
        .join("")
    : `<tr class="empty-row"><td colspan="4">No games yet. Add one below.</td></tr>`;

  const submittedCount = users.filter((u) => u.isSubmitted).length;
  const cheaterCount = users.filter((u) => u.isCheater).length;

  const usersRows = users.length
    ? users
        .map(
          (u) => `
        <tr>
          <td style="font-weight:600; font-family:monospace; letter-spacing:0.04em;">${escapeHtml(u.rollNo)}</td>
          <td>
            ${u.isSubmitted ? `<span class="badge badge--green">✓ Submitted</span>` : `<span class="badge badge--gray">Pending</span>`}
          </td>
          <td>
            ${u.isCheater ? `<span class="badge badge--red">⚠ Flagged</span>` : `<span class="badge badge--gray">Clean</span>`}
          </td>
          <td class="td-muted" style="font-size:11px; font-family:monospace;">${escapeHtml(u.sessionId.slice(0, 12))}…</td>
        </tr>`
        )
        .join("")
    : `<tr class="empty-row"><td colspan="4">No participants yet.</td></tr>`;

  const startButtonHtml =
    contest.status === 1
      ? `<button class="btn btn--ghost btn--sm" disabled>Contest Already Started</button>`
      : `<form method="POST" action="/admin/contests/${escapeHtml(contest.id)}/start" style="display:inline;">
           <button type="submit" class="btn btn--danger btn--sm"
             onclick="return confirm('Start contest ${escapeHtml(contest.name)}? This cannot be undone.')">
             🚀 Start Contest
           </button>
         </form>`;

  const content = `
    <!-- Breadcrumb -->
    <div style="margin-bottom:24px; font-size:13px; color:var(--text-muted);">
      <a href="/admin/dashboard" style="color:var(--purple-light); text-decoration:none;">Dashboard</a>
      <span style="margin:0 8px;">›</span>
      <span>${escapeHtml(contest.name)}</span>
    </div>

    <div class="page-header" style="display:flex; align-items:start; justify-content:space-between; flex-wrap:wrap; gap:16px;">
      <div>
        <div style="display:flex; align-items:center; gap:12px; margin-bottom:4px;">
          <h1 class="page-title">${escapeHtml(contest.name)}</h1>
          ${statusBadge}
        </div>
        <p class="page-subtitle">Contest ID: <code style="font-family:monospace; color:var(--purple-light);">${escapeHtml(contest.id)}</code></p>
      </div>
      <div style="display:flex; gap:10px; align-items:center;">
        ${startButtonHtml}
      </div>
    </div>

    <!-- Stats row -->
    <div class="grid" style="grid-template-columns:repeat(3,1fr); margin-bottom:32px;">
      <div class="card stat">
        <div class="stat-value">${games.length}</div>
        <div class="stat-label">Games</div>
      </div>
      <div class="card stat">
        <div class="stat-value">${users.length}</div>
        <div class="stat-label">Participants</div>
      </div>
      <div class="card stat">
        <div class="stat-value">${submittedCount}</div>
        <div class="stat-label">Submitted</div>
      </div>
    </div>

    <!-- Games section -->
    <div class="card" style="margin-bottom:24px;">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:18px;">
        <div class="card-title" style="margin-bottom:0;">🎮 Games (${games.length})</div>
      </div>

      <div class="table-wrap" style="margin-bottom:20px;">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Description</th>
              <th>ID</th>
            </tr>
          </thead>
          <tbody>${gamesRows}</tbody>
        </table>
      </div>

      <div class="divider"></div>

      <!-- Add game form -->
      <div style="font-size:14px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:14px;">Add Game</div>
      <form method="POST" action="/admin/contests/${escapeHtml(contest.id)}/games" style="display:grid; grid-template-columns:1fr 2fr auto; gap:12px; align-items:end;">
        <div class="form-group" style="margin-bottom:0;">
          <label for="gameTitle">Title</label>
          <input id="gameTitle" type="text" name="title" placeholder="e.g. Pixel Art" required />
        </div>
        <div class="form-group" style="margin-bottom:0;">
          <label for="gameDesc">Description</label>
          <input id="gameDesc" type="text" name="description" placeholder="Build a stunning landing page..." required />
        </div>
        <button type="submit" class="btn btn--primary">Add Game</button>
        <div class="form-group" style="grid-column:1 / -1; margin-bottom:0;">
          <label for="boilerplateHtml">Boilerplate HTML</label>
          <textarea id="boilerplateHtml" name="boilerplateHtml" placeholder="&lt;div class=\"app\"&gt;&lt;/div&gt;" rows="5" style="width:100%; border:1px solid var(--border); border-radius:12px; background:rgba(255,255,255,0.03); color:var(--text); padding:10px 12px; font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size:13px;"></textarea>
        </div>
        <div class="form-group" style="margin-bottom:0;">
          <label for="boilerplateCss">Boilerplate CSS</label>
          <textarea id="boilerplateCss" name="boilerplateCss" placeholder=".app {\n  display: flex;\n}" rows="5" style="width:100%; border:1px solid var(--border); border-radius:12px; background:rgba(255,255,255,0.03); color:var(--text); padding:10px 12px; font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size:13px;"></textarea>
        </div>
        <div class="form-group" style="margin-bottom:0; grid-column:span 2;">
          <label for="boilerplateJs">Boilerplate JS</label>
          <textarea id="boilerplateJs" name="boilerplateJs" placeholder="console.log('starter js');" rows="5" style="width:100%; border:1px solid var(--border); border-radius:12px; background:rgba(255,255,255,0.03); color:var(--text); padding:10px 12px; font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size:13px;"></textarea>
        </div>
      </form>
    </div>

    <!-- Participants section -->
    <div class="card">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:18px;">
        <div class="card-title" style="margin-bottom:0;">👥 Participants (${users.length})</div>
        <div style="display:flex; gap:8px;">
          ${submittedCount > 0 ? `<span class="badge badge--green">${submittedCount} submitted</span>` : ""}
          ${cheaterCount > 0 ? `<span class="badge badge--red">${cheaterCount} flagged</span>` : ""}
        </div>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Roll No</th>
              <th>Submission</th>
              <th>Integrity</th>
              <th>Session ID</th>
            </tr>
          </thead>
          <tbody>${usersRows}</tbody>
        </table>
      </div>
    </div>`;

  return renderLayout({ title: contest.name, isLoggedIn: true, content, flash: flash ?? null });
}
