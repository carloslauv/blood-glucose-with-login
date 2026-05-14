const API_BASE = "http://localhost:8000";

function getToken() {
  return localStorage.getItem("bg_token");
}

function setToken(token) {
  localStorage.setItem("bg_token", token);
}

function clearToken() {
  localStorage.removeItem("bg_token");
}

function logout() {
  clearToken();
  window.location.href = "/index.html";
}

function authHeaders() {
  return {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  };
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });

  if (res.status === 401) {
    logout();
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }

  return res.json();
}

function requireAuth() {
  if (!getToken()) {
    window.location.href = "/index.html";
  }
}
