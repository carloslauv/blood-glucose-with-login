/* ============================================================
   Blood Glucose Tracker — app.js
   Handles: authentication (localStorage), glucose data CRUD,
   dashboard rendering and stats.
   ============================================================ */

'use strict';

/* ------------------------------------------------------------------
   Constants / helpers
   ------------------------------------------------------------------ */
const USERS_KEY    = 'bgt_users';
const SESSION_KEY  = 'bgt_session';
const READINGS_KEY = 'bgt_readings';

/** Return the stored users map { username -> hashedPassword } */
function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
}

/** Persist the users map */
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/** Simple (non-crypto) hash — good enough for a demo */
function simpleHash(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}

/** Return current session username or null */
function getSession() {
  return sessionStorage.getItem(SESSION_KEY) || null;
}

/** Start a session */
function setSession(username) {
  sessionStorage.setItem(SESSION_KEY, username);
}

/** End session */
function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

/** Return all readings for the given user */
function getReadings(username) {
  const all = JSON.parse(localStorage.getItem(READINGS_KEY) || '{}');
  return all[username] || [];
}

/** Persist readings for the given user */
function saveReadings(username, readings) {
  const all = JSON.parse(localStorage.getItem(READINGS_KEY) || '{}');
  all[username] = readings;
  localStorage.setItem(READINGS_KEY, JSON.stringify(all));
}

/** Determine glucose status label based on mg/dL value */
function glucoseStatus(value) {
  if (value < 70)  return { label: 'Low',       cls: 'status-low' };
  if (value <= 99) return { label: 'Normal',     cls: 'status-normal' };
  if (value <= 180) return { label: 'High',      cls: 'status-high' };
  return              { label: 'Very High',      cls: 'status-very-high' };
}

/** Format a datetime-local string for display */
function formatDateTime(dt) {
  if (!dt) return '—';
  const d = new Date(dt);
  return d.toLocaleString(undefined, {
    year:   'numeric', month: 'short', day: 'numeric',
    hour:   '2-digit', minute: '2-digit'
  });
}

/** Human-readable meal context */
function mealContextLabel(ctx) {
  const map = {
    fasting:     'Fasting',
    before_meal: 'Before Meal',
    after_meal:  'After Meal',
    bedtime:     'Bedtime',
    other:       'Other',
  };
  return map[ctx] || ctx;
}

/** Show an element */
function show(el) { el.classList.remove('hidden'); }
/** Hide an element */
function hide(el) { el.classList.add('hidden'); }

/* ------------------------------------------------------------------
   Seed demo account once (so the README hint works out-of-the-box)
   ------------------------------------------------------------------ */
(function seedDemoAccount() {
  const users = getUsers();
  if (!users['admin']) {
    users['admin'] = simpleHash('password123');
    saveUsers(users);
  }
})();

/* ------------------------------------------------------------------
   Login page logic
   ------------------------------------------------------------------ */
function initLoginPage() {
  // If already logged in, skip to dashboard
  if (getSession()) {
    window.location.href = 'dashboard.html';
    return;
  }

  const loginForm      = document.getElementById('login-form');
  const loginError     = document.getElementById('login-error');
  const registerPanel  = document.getElementById('register-panel');
  const registerForm   = document.getElementById('register-form');
  const registerError  = document.getElementById('register-error');
  const registerSuccess = document.getElementById('register-success');
  const registerLink   = document.getElementById('register-link');
  const loginLink      = document.getElementById('login-link');

  // Toggle between login and register panels
  registerLink.addEventListener('click', function (e) {
    e.preventDefault();
    hide(loginForm.closest('.auth-card'));
    show(registerPanel);
  });

  loginLink.addEventListener('click', function (e) {
    e.preventDefault();
    hide(registerPanel);
    show(loginForm.closest('.auth-card'));
  });

  // Login submit
  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    hide(loginError);

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (!username || !password) {
      loginError.textContent = 'Please enter both username and password.';
      show(loginError);
      return;
    }

    const users = getUsers();
    if (users[username] && users[username] === simpleHash(password)) {
      setSession(username);
      window.location.href = 'dashboard.html';
    } else {
      loginError.textContent = 'Invalid username or password.';
      show(loginError);
    }
  });

  // Register submit
  registerForm.addEventListener('submit', function (e) {
    e.preventDefault();
    hide(registerError);
    hide(registerSuccess);

    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value;

    if (!username || !password) {
      registerError.textContent = 'Please fill in all fields.';
      show(registerError);
      return;
    }

    if (username.length < 2) {
      registerError.textContent = 'Username must be at least 2 characters.';
      show(registerError);
      return;
    }

    if (password.length < 6) {
      registerError.textContent = 'Password must be at least 6 characters.';
      show(registerError);
      return;
    }

    const users = getUsers();
    if (users[username]) {
      registerError.textContent = 'That username is already taken.';
      show(registerError);
      return;
    }

    users[username] = simpleHash(password);
    saveUsers(users);

    registerSuccess.textContent = 'Account created! You can now sign in.';
    show(registerSuccess);
    registerForm.reset();

    // Auto-switch back to login after a moment
    setTimeout(() => {
      hide(registerPanel);
      show(loginForm.closest('.auth-card'));
      document.getElementById('username').value = username;
    }, 1500);
  });
}

/* ------------------------------------------------------------------
   Dashboard page logic
   ------------------------------------------------------------------ */
function initDashboardPage() {
  // Guard: must be logged in
  const username = getSession();
  if (!username) {
    window.location.href = 'index.html';
    return;
  }

  // Display username in nav
  document.getElementById('nav-username').textContent = username;

  // Logout
  document.getElementById('logout-btn').addEventListener('click', function () {
    clearSession();
    window.location.href = 'index.html';
  });

  // Pre-fill datetime to now
  const datetimeInput = document.getElementById('glucose-datetime');
  const now = new Date();
  // Format: YYYY-MM-DDTHH:MM
  const pad = (n) => String(n).padStart(2, '0');
  datetimeInput.value = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;

  // Glucose form submit
  const glucoseForm    = document.getElementById('glucose-form');
  const glucoseError   = document.getElementById('glucose-error');
  const glucoseSuccess = document.getElementById('glucose-success');

  glucoseForm.addEventListener('submit', function (e) {
    e.preventDefault();
    hide(glucoseError);
    hide(glucoseSuccess);

    const valueRaw  = document.getElementById('glucose-value').value;
    const datetime  = document.getElementById('glucose-datetime').value;
    const mealCtx   = document.getElementById('meal-context').value;
    const notes     = document.getElementById('glucose-notes').value.trim();

    const value = parseFloat(valueRaw);

    if (!valueRaw || isNaN(value)) {
      glucoseError.textContent = 'Please enter a valid blood glucose value.';
      show(glucoseError);
      return;
    }

    if (value < 20 || value > 600) {
      glucoseError.textContent = 'Value must be between 20 and 600 mg/dL.';
      show(glucoseError);
      return;
    }

    if (!datetime) {
      glucoseError.textContent = 'Please select a date and time.';
      show(glucoseError);
      return;
    }

    if (!mealCtx) {
      glucoseError.textContent = 'Please select a meal context.';
      show(glucoseError);
      return;
    }

    const reading = {
      id:       Date.now().toString(36) + Math.random().toString(36).slice(2),
      value:    value,
      datetime: datetime,
      mealCtx:  mealCtx,
      notes:    notes,
    };

    const readings = getReadings(username);
    readings.unshift(reading);   // newest first
    saveReadings(username, readings);

    glucoseSuccess.textContent = 'Reading saved!';
    show(glucoseSuccess);
    glucoseForm.reset();

    // Re-fill datetime
    datetimeInput.value = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;

    setTimeout(() => hide(glucoseSuccess), 3000);

    renderReadings(username);
  });

  // Clear all
  document.getElementById('clear-all-btn').addEventListener('click', function () {
    if (confirm('Are you sure you want to delete ALL readings? This cannot be undone.')) {
      saveReadings(username, []);
      renderReadings(username);
    }
  });

  // Delete modal
  let pendingDeleteId = null;
  const modal          = document.getElementById('confirm-modal');
  const confirmCancel  = document.getElementById('confirm-cancel');
  const confirmDelete  = document.getElementById('confirm-delete');

  document.getElementById('readings-tbody').addEventListener('click', function (e) {
    const btn = e.target.closest('[data-delete-id]');
    if (!btn) return;
    pendingDeleteId = btn.dataset.deleteId;
    show(modal);
  });

  confirmCancel.addEventListener('click', function () {
    pendingDeleteId = null;
    hide(modal);
  });

  modal.addEventListener('click', function (e) {
    if (e.target === modal) {
      pendingDeleteId = null;
      hide(modal);
    }
  });

  confirmDelete.addEventListener('click', function () {
    if (!pendingDeleteId) return;
    const readings = getReadings(username).filter(r => r.id !== pendingDeleteId);
    saveReadings(username, readings);
    pendingDeleteId = null;
    hide(modal);
    renderReadings(username);
  });

  // Initial render
  renderReadings(username);
}

/* ------------------------------------------------------------------
   Render readings table + stats
   ------------------------------------------------------------------ */
function renderReadings(username) {
  const readings = getReadings(username);

  const noReadings    = document.getElementById('no-readings');
  const tableWrapper  = document.getElementById('readings-table-wrapper');
  const tbody         = document.getElementById('readings-tbody');

  // Stats
  updateStats(readings);

  if (readings.length === 0) {
    show(noReadings);
    hide(tableWrapper);
    return;
  }

  hide(noReadings);
  show(tableWrapper);

  tbody.innerHTML = '';

  readings.forEach(function (r) {
    const status = glucoseStatus(r.value);
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td data-label="Date &amp; Time">${formatDateTime(r.datetime)}</td>
      <td data-label="Value (mg/dL)"><strong>${r.value}</strong></td>
      <td data-label="Status"><span class="status-badge ${status.cls}">${status.label}</span></td>
      <td data-label="Meal Context"><span class="context-pill">${mealContextLabel(r.mealCtx)}</span></td>
      <td data-label="Notes">${r.notes ? escapeHtml(r.notes) : '<span style="color:var(--color-text-muted)">—</span>'}</td>
      <td data-label="Actions">
        <button class="btn-icon" data-delete-id="${r.id}" title="Delete reading" aria-label="Delete reading">&#128465;</button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

/* ------------------------------------------------------------------
   Update stats cards
   ------------------------------------------------------------------ */
function updateStats(readings) {
  const countEl = document.getElementById('stat-count');
  const avgEl   = document.getElementById('stat-avg');
  const minEl   = document.getElementById('stat-min');
  const maxEl   = document.getElementById('stat-max');

  if (readings.length === 0) {
    countEl.textContent = '0';
    avgEl.innerHTML  = '-- <span class="stat-unit">mg/dL</span>';
    minEl.innerHTML  = '-- <span class="stat-unit">mg/dL</span>';
    maxEl.innerHTML  = '-- <span class="stat-unit">mg/dL</span>';
    return;
  }

  const values = readings.map(r => r.value);
  const avg    = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  const min    = Math.min(...values);
  const max    = Math.max(...values);

  countEl.textContent = readings.length;
  avgEl.innerHTML  = `${avg} <span class="stat-unit">mg/dL</span>`;
  minEl.innerHTML  = `${min} <span class="stat-unit">mg/dL</span>`;
  maxEl.innerHTML  = `${max} <span class="stat-unit">mg/dL</span>`;
}

/* ------------------------------------------------------------------
   Utility: escape HTML to prevent XSS from user notes
   ------------------------------------------------------------------ */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ------------------------------------------------------------------
   Router: detect which page we're on and initialise accordingly
   ------------------------------------------------------------------ */
(function router() {
  const path = window.location.pathname;
  if (path.endsWith('dashboard.html')) {
    initDashboardPage();
  } else {
    // index.html or root
    initLoginPage();
  }
})();
