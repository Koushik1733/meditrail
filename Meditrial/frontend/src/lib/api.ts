const configuredUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1').replace(/\/$/, '');
const baseUrl = configuredUrl.startsWith('http://') || configuredUrl.startsWith('https://') ? configuredUrl : `https://${configuredUrl}`;

type ApiResult<T> = T;

async function request<T>(path: string, options: RequestInit = {}, token?: string | null): Promise<ApiResult<T>> {
  const headers = new Headers(options.headers);
  if (options.body) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, { ...options, headers });
  } catch {
    throw new Error('Cannot reach the MediTrail API. Check that the backend is running and VITE_API_URL is set.');
  }
  if (!response.ok) {
    let message = `API request failed (${response.status})`;
    try { const body = await response.json(); message = body.detail || body.error || message; } catch { /* Keep the status message. */ }
    throw new Error(message);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<ApiResult<T>>;
}

export const api = {
  register: (profile: unknown, password: string) => request<{ token: string; profile: any }>('/auth/register', { method: 'POST', body: JSON.stringify({ profile, password }) }),
  login: (identifier: string, password: string) => request<{ token: string; profile: any }>('/auth/login', { method: 'POST', body: JSON.stringify({ identifier, password }) }),
  logout: (token: string) => request<void>('/auth/logout', { method: 'POST' }, token),
  me: (token: string) => request<{ profile: any }>('/patients/me', {}, token),
  updateProfile: (profile: unknown, token: string) => request<{ profile: any }>('/patients/me', { method: 'PUT', body: JSON.stringify({ profile }) }, token),
  setRelationPassword: (relationId: string, username: string, password: string, token: string, currentPassword?: string) => request<{ success: boolean }>('/patients/me/relations/password', { method: 'PUT', body: JSON.stringify({ relation_id: relationId, username, password, ...(currentPassword ? { current_password: currentPassword } : {}) }) }, token),
  changePassword: (currentPassword: string, newPassword: string, token: string) => request<{ success: boolean }>('/patients/me/password', { method: 'PUT', body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }) }, token),
  searchPatient: (username: string, password: string) => request<{ profile: any }>('/patients/search', { method: 'POST', body: JSON.stringify({ username, password }) }),
};
