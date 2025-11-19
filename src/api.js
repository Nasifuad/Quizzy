const BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

async function safeJson(res) {
  const text = await res.text();
  try {
    return JSON.parse(text || "{}");
  } catch (e) {
    return { raw: text };
  }
}

async function refreshToken() {
  const res = await fetch(`${BASE}/api/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (data.token) localStorage.setItem("token", data.token);
  return data.token || null;
}

function parseJwt(token) {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(payload)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

export function getCurrentUser() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  const payload = parseJwt(token);
  if (!payload) return null;
  return { id: payload.id, role: payload.role };
}

export async function logout() {
  try {
    await fetch(`${BASE}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch (e) {
    // ignore
  }
  localStorage.removeItem("token");
  clearCachedUser();
}

export async function apiFetch(path, opts = {}, retry = true) {
  const token = localStorage.getItem("token");
  const headers = opts.headers || {};
  if (!headers["Content-Type"] && !(opts.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    ...opts,
    headers,
  });

  if (res.status === 401 && retry) {
    const newToken = await refreshToken();
    if (newToken) {
      return apiFetch(path, opts, false);
    }
  }

  const data = await safeJson(res);
  if (!res.ok) {
    const err = new Error(data.message || data.raw || "API error");
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}

export async function login(email, password) {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data.message || "Login failed");
  if (data.token) localStorage.setItem("token", data.token);
  return data;
}

export async function register(name, email, password) {
  const res = await fetch(`${BASE}/api/auth/register`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data.message || "Register failed");
  return data;
}

let _cachedUser = null;

export async function fetchCurrentUser(force = false) {
  if (_cachedUser && !force) return _cachedUser;
  try {
    const data = await apiFetch(`/api/auth/me`);
    _cachedUser = data;
    return data;
  } catch (e) {
    _cachedUser = null;
    return null;
  }
}

export function clearCachedUser() {
  _cachedUser = null;
}

export default { apiFetch, login, register };
