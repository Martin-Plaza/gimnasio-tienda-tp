export const API_URL = 'http://127.0.0.1:4000';

export async function api(path, options = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}${path}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...options
  });

  if (!res.ok) {
    const txt = await res.text();
    let msg = res.statusText;
    try { msg = JSON.parse(txt).message || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}