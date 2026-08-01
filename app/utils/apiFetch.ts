import { getAccessToken } from './auth';

/**
 * A wrapper around the native fetch API that automatically injects
 * the Authorization header using the in-memory access token.
 */
export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const token = getAccessToken();
  
  // Construct new headers (merging any existing headers passed in)
  const headers = new Headers(init?.headers);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(input, {
    ...init,
    headers,
  });
}
