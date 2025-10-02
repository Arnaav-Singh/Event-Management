export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api';

export async function apiRequest(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const defaultHeaders = { 'Content-Type': 'application/json' };
  const res = await fetch(url, {
    credentials: 'include',
    headers: { ...defaultHeaders, ...(options.headers || {}) },
    ...options,
  });
  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json() : await res.text();
  if (!res.ok) {
    const message = data?.message || res.statusText;
    throw new Error(message);
  }
  return data;
}


