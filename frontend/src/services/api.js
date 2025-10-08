export const API_URL = 'http://localhost:4000';

export async function api(path, options = {}){
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type':'application/json', ...(options.headers||{}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json().catch(()=>({})) : await res.text();
  if(!res.ok){
    const message = typeof data === 'object' ? (data.message || 'Error') : (data || 'Error');
    throw new Error(message);
  }
  return data;
}