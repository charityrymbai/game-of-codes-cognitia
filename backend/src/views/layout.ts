export interface LayoutOptions {
  title: string;
  isLoggedIn?: boolean;
  content: string;
  flash?: { type: "error" | "success"; message: string } | null;
}

export function renderLayout({ title, isLoggedIn = false, content, flash }: LayoutOptions): string {
  const flashHtml = flash
    ? `<div class="flash flash--${flash.type}" role="alert">${escapeHtml(flash.message)}</div>`
    : "";

  const navHtml = isLoggedIn
    ? `<nav class="navbar">
        <a href="/admin/dashboard" class="navbar-brand">
          <span class="brand-icon">⚙</span>
          <span>Game of Codes</span>
          <span class="brand-tag">Admin</span>
        </a>
        <div class="navbar-links">
          <a href="/admin/dashboard" class="nav-link">Dashboard</a>
          <a href="/admin/logout" class="btn btn--danger btn--sm">Logout</a>
        </div>
      </nav>`
    : `<nav class="navbar">
        <a href="/admin" class="navbar-brand">
          <span class="brand-icon">⚙</span>
          <span>Game of Codes</span>
          <span class="brand-tag">Admin</span>
        </a>
      </nav>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)} — Game of Codes Admin</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
  <style>
    /* ── Reset & Base ── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg:          #0a0a12;
      --bg-card:     rgba(255,255,255,0.04);
      --bg-card-hover: rgba(255,255,255,0.07);
      --border:      rgba(255,255,255,0.08);
      --border-hover: rgba(139,92,246,0.5);
      --text:        #f1f0fb;
      --text-muted:  #8b8ba0;
      --purple:      #7c3aed;
      --purple-light:#a78bfa;
      --purple-glow: rgba(124,58,237,0.25);
      --green:       #22c55e;
      --red:         #ef4444;
      --orange:      #f97316;
      --yellow:      #eab308;
      --radius:      12px;
      --radius-lg:   18px;
      --shadow:      0 4px 24px rgba(0,0,0,0.4);
      --shadow-lg:   0 8px 40px rgba(0,0,0,0.6);
    }
    html, body {
      min-height: 100vh;
      background-color: var(--bg);
      background-image:
        radial-gradient(ellipse 80% 50% at 20% 0%, rgba(124,58,237,0.12) 0%, transparent 60%),
        radial-gradient(ellipse 60% 40% at 80% 100%, rgba(99,102,241,0.08) 0%, transparent 60%);
      color: var(--text);
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 15px;
      line-height: 1.6;
    }

    /* ── Scrollbar ── */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 999px; }

    /* ── Navbar ── */
    .navbar {
      position: sticky; top: 0; z-index: 100;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 24px; height: 60px;
      background: rgba(10,10,18,0.8);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border);
    }
    .navbar-brand {
      display: flex; align-items: center; gap: 10px;
      text-decoration: none; color: var(--text);
      font-weight: 700; font-size: 1rem; letter-spacing: -0.02em;
    }
    .brand-icon {
      display: inline-flex; align-items: center; justify-content: center;
      width: 32px; height: 32px; border-radius: 8px;
      background: linear-gradient(135deg, #f97316, #ef4444);
      font-size: 16px;
    }
    .brand-tag {
      font-size: 10px; font-weight: 600; letter-spacing: 0.08em;
      text-transform: uppercase; color: var(--purple-light);
      background: rgba(124,58,237,0.15); border: 1px solid rgba(124,58,237,0.3);
      padding: 2px 7px; border-radius: 999px;
    }
    .navbar-links { display: flex; align-items: center; gap: 12px; }
    .nav-link {
      color: var(--text-muted); text-decoration: none; font-size: 14px; font-weight: 500;
      transition: color 0.15s;
    }
    .nav-link:hover { color: var(--text); }

    /* ── Layout ── */
    .container {
      max-width: 1100px; margin: 0 auto; padding: 40px 24px;
    }
    .page-header { margin-bottom: 32px; }
    .page-title {
      font-size: 1.8rem; font-weight: 800; letter-spacing: -0.03em;
      background: linear-gradient(90deg, var(--text), var(--purple-light));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    .page-subtitle { color: var(--text-muted); font-size: 14px; margin-top: 4px; }

    /* ── Cards ── */
    .card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 24px;
      backdrop-filter: blur(8px);
      box-shadow: var(--shadow);
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .card:hover { border-color: var(--border-hover); box-shadow: 0 0 20px var(--purple-glow); }
    .card-title {
      font-size: 1.05rem; font-weight: 700; margin-bottom: 18px;
      color: var(--text); letter-spacing: -0.01em;
    }

    /* ── Grid ── */
    .grid { display: grid; gap: 20px; }
    .grid--2 { grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); }
    .grid--1-2 { grid-template-columns: 1fr 2fr; }

    /* ── Form elements ── */
    .form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
    .form-group:last-child { margin-bottom: 0; }
    label { font-size: 13px; font-weight: 600; color: var(--purple-light); letter-spacing: 0.02em; }
    input[type="text"], input[type="password"] {
      width: 100%;
      padding: 10px 14px;
      background: rgba(255,255,255,0.04);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      color: var(--text);
      font-family: inherit; font-size: 14px;
      outline: none; transition: border-color 0.15s, box-shadow 0.15s;
    }
    input[type="text"]:focus, input[type="password"]:focus {
      border-color: var(--purple);
      box-shadow: 0 0 0 3px var(--purple-glow);
    }
    input::placeholder { color: var(--text-muted); }

    /* ── Buttons ── */
    .btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      padding: 10px 20px; border: none; border-radius: var(--radius);
      font-family: inherit; font-size: 14px; font-weight: 600;
      cursor: pointer; text-decoration: none;
      transition: all 0.15s; white-space: nowrap;
    }
    .btn--primary {
      background: linear-gradient(135deg, var(--purple), #6d28d9);
      color: white; box-shadow: 0 2px 12px rgba(124,58,237,0.35);
    }
    .btn--primary:hover { filter: brightness(1.12); box-shadow: 0 4px 20px rgba(124,58,237,0.5); }
    .btn--danger {
      background: linear-gradient(135deg, #ef4444, #b91c1c);
      color: white; box-shadow: 0 2px 8px rgba(239,68,68,0.3);
    }
    .btn--danger:hover { filter: brightness(1.1); }
    .btn--ghost {
      background: transparent; color: var(--text-muted);
      border: 1px solid var(--border);
    }
    .btn--ghost:hover { background: var(--bg-card-hover); color: var(--text); border-color: var(--border-hover); }
    .btn--full { width: 100%; }
    .btn--sm { padding: 6px 14px; font-size: 13px; }
    .btn--lg { padding: 13px 28px; font-size: 15px; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; pointer-events: none; }

    /* ── Badges ── */
    .badge {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 3px 10px; border-radius: 999px;
      font-size: 12px; font-weight: 600; letter-spacing: 0.02em;
    }
    .badge--green  { background: rgba(34,197,94,0.12);  color: #4ade80; border: 1px solid rgba(34,197,94,0.25); }
    .badge--yellow { background: rgba(234,179,8,0.12);  color: #facc15; border: 1px solid rgba(234,179,8,0.25); }
    .badge--red    { background: rgba(239,68,68,0.12);  color: #f87171; border: 1px solid rgba(239,68,68,0.25); }
    .badge--purple { background: rgba(124,58,237,0.15); color: var(--purple-light); border: 1px solid rgba(124,58,237,0.3); }
    .badge--gray   { background: rgba(255,255,255,0.05); color: var(--text-muted); border: 1px solid var(--border); }

    /* ── Tables ── */
    .table-wrap { overflow-x: auto; border-radius: var(--radius); border: 1px solid var(--border); }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    thead tr { background: rgba(255,255,255,0.03); }
    th {
      padding: 12px 16px; text-align: left;
      font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
      color: var(--text-muted); border-bottom: 1px solid var(--border);
    }
    td { padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.04); vertical-align: middle; }
    tr:last-child td { border-bottom: none; }
    tbody tr { transition: background 0.12s; }
    tbody tr:hover { background: rgba(255,255,255,0.03); }
    .td-muted { color: var(--text-muted); font-size: 13px; }
    .empty-row td { padding: 40px; text-align: center; color: var(--text-muted); }

    /* ── Flash messages ── */
    .flash {
      padding: 12px 18px; border-radius: var(--radius);
      font-size: 14px; font-weight: 500; margin-bottom: 24px;
      animation: slideIn 0.2s ease;
    }
    .flash--error   { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: #f87171; }
    .flash--success { background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.3); color: #4ade80; }
    @keyframes slideIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:none; } }

    /* ── Stat cards ── */
    .stat { text-align: center; padding: 20px; }
    .stat-value { font-size: 2rem; font-weight: 800; color: var(--purple-light); letter-spacing: -0.04em; }
    .stat-label { font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; margin-top: 4px; }

    /* ── Contest card links ── */
    .contest-link {
      display: block; text-decoration: none; color: inherit;
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 20px 24px;
      transition: all 0.2s; position: relative; overflow: hidden;
    }
    .contest-link::before {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(135deg, var(--purple-glow), transparent);
      opacity: 0; transition: opacity 0.2s;
    }
    .contest-link:hover { border-color: var(--border-hover); transform: translateY(-2px); box-shadow: var(--shadow-lg); }
    .contest-link:hover::before { opacity: 1; }
    .contest-name { font-size: 1rem; font-weight: 700; margin-bottom: 8px; }
    .contest-id   { font-size: 13px; color: var(--text-muted); font-family: monospace; }
    .contest-meta { display: flex; gap: 10px; margin-top: 12px; flex-wrap: wrap; }

    /* ── Divider ── */
    .divider { height: 1px; background: var(--border); margin: 24px 0; }

    /* ── Responsive ── */
    @media (max-width: 700px) {
      .grid--1-2 { grid-template-columns: 1fr; }
      .container { padding: 20px 16px; }
    }
  </style>
</head>
<body>
  ${navHtml}
  <main class="container">
    ${flashHtml}
    ${content}
  </main>
</body>
</html>`;
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
