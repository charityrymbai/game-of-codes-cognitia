import { renderLayout, escapeHtml } from "./layout";

export function renderLoginPage(error?: string): string {
  const flash = error ? { type: "error" as const, message: error } : null;

  const content = `
    <div style="min-height:80vh; display:flex; align-items:center; justify-content:center;">
      <div style="width:100%; max-width:420px;">
        <div style="text-align:center; margin-bottom:32px;">
          <div style="display:inline-flex; align-items:center; justify-content:center;
                      width:64px; height:64px; border-radius:18px;
                      background:linear-gradient(135deg,#f97316,#ef4444);
                      font-size:28px; margin-bottom:16px; box-shadow:0 8px 24px rgba(239,68,68,0.3);">
            ⚙
          </div>
          <h1 style="font-size:1.8rem; font-weight:800; letter-spacing:-0.03em; margin-bottom:6px;">Admin Panel</h1>
          <p style="color:var(--text-muted); font-size:14px;">Game of Codes · Contest Management</p>
        </div>

        <form method="POST" action="/admin/login" class="card" style="padding:32px;">
          <div class="form-group">
            <label for="username">Username</label>
            <input id="username" type="text" name="username" placeholder="admin" required autocomplete="username" />
          </div>
          <div class="form-group" style="margin-bottom:24px;">
            <label for="password">Password</label>
            <input id="password" type="password" name="password" placeholder="••••••••" required autocomplete="current-password" />
          </div>
          <button type="submit" class="btn btn--primary btn--full btn--lg">Sign In</button>
        </form>

        <p style="text-align:center; margin-top:16px; font-size:12px; color:var(--text-muted);">
          Credentials are set via environment variables
        </p>
      </div>
    </div>`;

  return renderLayout({ title: "Admin Login", isLoggedIn: false, content, flash });
}
