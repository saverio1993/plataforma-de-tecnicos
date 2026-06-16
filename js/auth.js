// ============================================================
// ACADEMIA JOTA RUBIO — Auth system (frontend-only)
// localStorage-based. Listo para migrar a backend real.
// ============================================================
//
// Storage keys:
//   jrubio_users    = [{id, username, email, fullName, passwordHash, salt,
//                       plan, planExpiresAt, bio, location, specialties,
//                       reputation, level, certificationsCount,
//                       createdAt, lastLoginAt, avatarUrl, isVerified}, ...]
//   jrubio_session  = {userId, token, createdAt, expiresAt}
//   jrubio_logged   = "1" cuando hay sesión (chequeo rápido)
//
// Password hashing: SHA-256 + salt (cliente). NO es para producción.
// En backend se usa bcrypt server-side. Esto es solo para que el
// frontend no guarde passwords en texto plano en localStorage.

const Auth = (() => {
  const USERS_KEY = 'jrubio_users';
  const SESSION_KEY = 'jrubio_session';
  const LOGGED_KEY = 'jrubio_logged';
  const SESSION_DAYS = 30;

  // ── Hash simple (SHA-256 + salt) ──────────────────────────
  async function hashPassword(password, salt = null) {
    const useSalt = salt || generateSalt();
    const enc = new TextEncoder();
    const data = enc.encode(useSalt + ':' + password);
    const buf = await crypto.subtle.digest('SHA-256', data);
    const hex = Array.from(new Uint8Array(buf))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    return { hash: hex, salt: useSalt };
  }

  function generateSalt(length = 16) {
    const arr = new Uint8Array(length);
    crypto.getRandomValues(arr);
    return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function generateId() {
    return 'usr_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
  }

  function generateToken() {
    const arr = new Uint8Array(24);
    crypto.getRandomValues(arr);
    return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // ── Storage helpers ───────────────────────────────────────
  function getUsers() {
    try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); }
    catch { return []; }
  }
  function setUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
  function getSession() {
    try {
      const s = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
      if (s && new Date(s.expiresAt) < new Date()) {
        logout();
        return null;
      }
      return s;
    } catch { return null; }
  }
  function setSession(session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    if (session) localStorage.setItem(LOGGED_KEY, '1');
    else localStorage.removeItem(LOGGED_KEY);
  }

  // ── Public API ────────────────────────────────────────────
  return {
    isLoggedIn() {
      return localStorage.getItem(LOGGED_KEY) === '1' && getSession() !== null;
    },

    getCurrentUser() {
      const session = getSession();
      if (!session) return null;
      const users = getUsers();
      return users.find(u => u.id === session.userId) || null;
    },

    async register({ username, email, password, fullName }) {
      // Validaciones
      const errors = [];
      if (!username || username.length < 3) errors.push('El usuario debe tener al menos 3 caracteres');
      if (!/^[a-zA-Z0-9_]+$/.test(username)) errors.push('El usuario solo puede tener letras, números y guiones bajos');
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Email inválido');
      if (!password || password.length < 6) errors.push('La contraseña debe tener al menos 6 caracteres');
      if (password && password.length > 0 && password.length < 6) errors.push('Contraseña muy corta');
      if (!fullName || fullName.length < 2) errors.push('Nombre completo requerido');

      if (errors.length) {
        return { ok: false, errors };
      }

      // Verificar duplicados
      const users = getUsers();
      if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        return { ok: false, errors: ['Este email ya está registrado'] };
      }
      if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
        return { ok: false, errors: ['Este nombre de usuario ya está en uso'] };
      }

      // Hashear
      const { hash, salt } = await hashPassword(password);

      // Crear usuario
      const newUser = {
        id: generateId(),
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        fullName: fullName.trim(),
        passwordHash: hash,
        passwordSalt: salt,
        plan: 'free',
        planExpiresAt: null,
        bio: '',
        location: '',
        specialties: '',
        reputation: 0,
        level: 1,
        certificationsCount: 0,
        yearsExperience: null,
        role: 'member',
        isVerified: false,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        avatarUrl: ''
      };

      users.push(newUser);
      setUsers(users);

      // Crear sesión
      const session = {
        userId: newUser.id,
        token: generateToken(),
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + SESSION_DAYS * 86400 * 1000).toISOString()
      };
      setSession(session);

      return { ok: true, user: newUser };
    },

    async login({ email, password }) {
      const users = getUsers();
      const user = users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
      if (!user) {
        return { ok: false, errors: ['Email o contraseña incorrectos'] };
      }

      const { hash } = await hashPassword(password, user.passwordSalt);
      if (hash !== user.passwordHash) {
        return { ok: false, errors: ['Email o contraseña incorrectos'] };
      }

      // Actualizar lastLogin
      user.lastLoginAt = new Date().toISOString();
      setUsers(users);

      // Crear sesión
      const session = {
        userId: user.id,
        token: generateToken(),
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + SESSION_DAYS * 86400 * 1000).toISOString()
      };
      setSession(session);

      return { ok: true, user };
    },

    logout() {
      setSession(null);
    },

    updateProfile(updates) {
      const session = getSession();
      if (!session) return null;
      const users = getUsers();
      const idx = users.findIndex(u => u.id === session.userId);
      if (idx === -1) return null;
      users[idx] = { ...users[idx], ...updates, updatedAt: new Date().toISOString() };
      setUsers(users);
      return users[idx];
    },

    changePassword(currentPw, newPw) {
      return this.login({ email: this.getCurrentUser()?.email, password: currentPw })
        .then(r => {
          if (!r.ok) return { ok: false, errors: ['Contraseña actual incorrecta'] };
          const session = getSession();
          const users = getUsers();
          const idx = users.findIndex(u => u.id === session.userId);
          if (idx === -1) return { ok: false, errors: ['Usuario no encontrado'] };
          return hashPassword(newPw).then(({ hash, salt }) => {
            users[idx].passwordHash = hash;
            users[idx].passwordSalt = salt;
            setUsers(users);
            return { ok: true };
          });
        });
    },

    upgradePlan(plan) {
      const user = this.getCurrentUser();
      if (!user) return null;
      const expires = new Date();
      expires.setMonth(expires.getMonth() + 1);
      return this.updateProfile({ plan, planExpiresAt: expires.toISOString() });
    },

    // Genera un usuario demo (para que pruebes sin registrarte)
    async createDemoUser() {
      const demoData = {
        username: 'demo',
        email: 'demo@jotarubio.com',
        password: 'demo1234',
        fullName: 'Usuario Demo'
      };
      // Si ya existe, no crear
      const users = getUsers();
      if (users.find(u => u.email === demoData.email)) {
        // Solo login
        return this.login({ email: demoData.email, password: demoData.password });
      }
      return this.register(demoData);
    },

    // Para mostrar info de demo
    hasUsers() {
      return getUsers().length > 0;
    }
  };
})();

// ============================================================
// UI helpers globales
// ============================================================
window.Auth = Auth;

function showToast(message, type = 'info', duration = 3500) {
  // Crear container si no existe
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span>${message}</span>
    <span class="toast-close" onclick="this.parentElement.remove()">×</span>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

window.showToast = showToast;

function requireAuth(redirectTo = 'login.html') {
  if (!Auth.isLoggedIn()) {
    showToast('Necesitás iniciar sesión', 'warning');
    setTimeout(() => window.location.href = redirectTo, 800);
    return false;
  }
  return true;
}
window.requireAuth = requireAuth;

function getRedirectParam() {
  const params = new URLSearchParams(window.location.search);
  return params.get('redirect');
}
window.getRedirectParam = getRedirectParam;
