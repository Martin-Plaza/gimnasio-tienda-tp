export const API_URL = 'http://127.0.0.1:4000';

export async function api(path, options = {}) {
  const token = localStorage.getItem('token');

  // merge headers sin perder Authorization
  const baseHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
  const mergedHeaders = { ...baseHeaders, ...(options.headers || {}) };

  const res = await fetch(`${API_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: mergedHeaders,
    body: options.body, // no tocar si no lo enviaste
  });

  if (!res.ok) {
    const txt = await res.text();
    let msg = res.statusText;
    try { msg = JSON.parse(txt).message || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}