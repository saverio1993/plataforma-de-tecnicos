// ============================================================
// ACADEMIA JOTA RUBIO — Navbar update on auth state
// Reemplaza el bloque "navbar-actions" según el usuario esté
// logueado o no. Usado en TODAS las páginas internas.
// ============================================================

(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const actions = document.querySelector('.navbar-actions');
    if (!actions) return;

    // No tocar el navbar del login/register (que tienen otra estructura)
    if (document.body.classList.contains('auth-page') || window.location.pathname.includes('login') || window.location.pathname.includes('register')) return;

    const user = Auth.getCurrentUser();

    if (user) {
      // Mostrar avatar + nombre + menú
      const initials = (user.fullName || user.username || 'U').split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();
      const planBadge = user.plan === 'pro' ? '⚡ Pro' : user.plan === 'premium' ? '👑 Premium' : 'Gratis';
      const planColor = user.plan === 'pro' ? 'var(--accent)' : user.plan === 'premium' ? 'var(--warning)' : 'var(--text-muted)';

      actions.innerHTML = `
        <a href="dashboard.html" class="btn btn-ghost btn-sm" title="Dashboard">📊</a>
        <div class="navbar-user" id="navbarUser" style="position: relative;">
          <button class="navbar-user-trigger" style="display: flex; align-items: center; gap: 8px; padding: 4px 8px 4px 4px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 999px; cursor: pointer; transition: all var(--t-fast);">
            <div style="width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, var(--accent), var(--success)); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">${initials}</div>
            <span style="font-size: 13px; color: var(--text-primary); font-weight: 500;">${user.fullName.split(' ')[0]}</span>
            <span style="font-size: 10px; color: ${planColor}; font-weight: 600;">${planBadge}</span>
            <span style="font-size: 10px; color: var(--text-muted);">▼</span>
          </button>
          <div class="navbar-user-menu" id="navbarUserMenu" style="display: none; position: absolute; top: calc(100% + 8px); right: 0; min-width: 240px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: var(--radius-md); box-shadow: var(--shadow-lg); padding: var(--sp-2); z-index: 100;">
            <div style="padding: var(--sp-3); border-bottom: 1px solid var(--border); margin-bottom: var(--sp-2);">
              <div style="font-weight: 600; color: var(--text-primary); font-size: var(--fs-sm);">${user.fullName}</div>
              <div style="font-size: 11px; color: var(--text-muted);">@${user.username}</div>
              <div style="font-size: 11px; color: ${planColor}; margin-top: 4px;">Plan ${planBadge}</div>
            </div>
            <a href="dashboard.html" style="display: flex; align-items: center; gap: var(--sp-2); padding: var(--sp-2) var(--sp-3); border-radius: var(--radius-sm); color: var(--text-primary); font-size: var(--fs-sm); text-decoration: none;">
              <span>📊</span> Dashboard
            </a>
            <a href="perfil.html" style="display: flex; align-items: center; gap: var(--sp-2); padding: var(--sp-2) var(--sp-3); border-radius: var(--radius-sm); color: var(--text-primary); font-size: var(--fs-sm); text-decoration: none;">
              <span>👤</span> Mi perfil
            </a>
            <a href="account.html" style="display: flex; align-items: center; gap: var(--sp-2); padding: var(--sp-2) var(--sp-3); border-radius: var(--radius-sm); color: var(--text-primary); font-size: var(--fs-sm); text-decoration: none;">
              <span>⚙️</span> Configuración
            </a>
            ${user.plan === 'free' ? `
            <a href="planes.html" style="display: flex; align-items: center; gap: var(--sp-2); padding: var(--sp-2) var(--sp-3); border-radius: var(--radius-sm); color: var(--warning); font-size: var(--fs-sm); text-decoration: none; font-weight: 600;">
              <span>⚡</span> Mejorar a Pro
            </a>
            ` : ''}
            <div style="height: 1px; background: var(--border); margin: var(--sp-2) 0;"></div>
            <button id="navbarLogout" style="display: flex; align-items: center; gap: var(--sp-2); padding: var(--sp-2) var(--sp-3); border-radius: var(--radius-sm); color: var(--danger); font-size: var(--fs-sm); background: none; border: none; cursor: pointer; width: 100%; text-align: left;">
              <span>🚪</span> Cerrar sesión
            </button>
          </div>
        </div>
        <button class="navbar-toggle" id="navbarToggle">☰</button>
      `;

      // Toggle menu
      const trigger = actions.querySelector('.navbar-user-trigger');
      const menu = document.getElementById('navbarUserMenu');
      if (trigger && menu) {
        trigger.addEventListener('click', (e) => {
          e.stopPropagation();
          menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
        });
        document.addEventListener('click', (e) => {
          if (!actions.contains(e.target)) menu.style.display = 'none';
        });
      }

      // Logout
      const logoutBtn = document.getElementById('navbarLogout');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
          Auth.logout();
          showToast('Sesión cerrada', 'info');
          setTimeout(() => window.location.href = 'index.html', 600);
        });
      }
    } else {
      // No logueado: mostrar botones de login
      actions.innerHTML = `
        <a href="login.html" class="btn btn-ghost btn-sm">Ingresar</a>
        <a href="register.html" class="btn btn-primary btn-sm">Empezar ahora</a>
        <button class="navbar-toggle" id="navbarToggle">☰</button>
      `;
    }

    // Re-attach mobile toggle
    const toggle = document.getElementById('navbarToggle');
    const menu = document.getElementById('navbarMenu');
    if (toggle && menu) {
      toggle.addEventListener('click', () => {
        menu.classList.toggle('open');
        toggle.textContent = menu.classList.contains('open') ? '✕' : '☰';
      });
    }
  });
})();
