/**
 * Utility function to make authenticated API calls
 * Automatically includes the access token from localStorage
 */

export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  if (typeof window === 'undefined') {
    throw new Error('authenticatedFetch can only be used in browser environment');
  }

  let token = localStorage.getItem('accessToken');

  if (!token) {
    try {
      const refreshRes = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        token = data.accessToken;
        if (token) {
          localStorage.setItem('accessToken', token);
        }
      }
    } catch {}
  }

  if (!token) {
    localStorage.removeItem('userData');
    return new Response(
      JSON.stringify({ error: 'Authentication required' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${token}`);
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    try {
      const refreshRes = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        const newToken = data.accessToken;
        if (newToken) {
          localStorage.setItem('accessToken', newToken);
          const retryHeaders = new Headers(options.headers || {});
          retryHeaders.set('Authorization', `Bearer ${newToken}`);
          if (options.body && !retryHeaders.has('Content-Type')) {
            retryHeaders.set('Content-Type', 'application/json');
          }
          response = await fetch(url, {
            ...options,
            headers: retryHeaders,
          });
        }
      }
    } catch {}
  }

  if (response.status === 401) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userData');
  }

  return response;
}

/**
 * Helper to parse JSON response and handle errors
 */
export async function apiRequest<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await authenticatedFetch(url, options);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  return response.json();
}

