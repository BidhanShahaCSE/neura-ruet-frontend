import axios from 'axios';
import {
  BASE_URL,
  REQUEST_TIMEOUT_MS,
  AUTH_TOKEN_STORAGE_KEY,
  AUTH_TOKEN_KIND_STORAGE_KEY,
  AUTH_ROLE_STORAGE_KEY,
  REFRESH_TOKEN_STORAGE_KEY,
  REFRESH_TOKEN_ID_STORAGE_KEY,
  LAST_ACCESS_TOKEN_STORAGE_KEY,
} from './apiConfig';

const API = axios.create({
  baseURL: BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

function getRefreshEndpoint(role: string) {
  if (role === 'teacher') return '/api/v1/teachers/refresh';
  if (role === 'cr') return '/api/v1/crs/refresh';
  return '/api/v1/students/refresh';
}

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const role = localStorage.getItem(AUTH_ROLE_STORAGE_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
  const refreshTokenId = localStorage.getItem(REFRESH_TOKEN_ID_STORAGE_KEY);
  const lastAccessToken = localStorage.getItem(LAST_ACCESS_TOKEN_STORAGE_KEY);

  if (!role || !refreshToken || !refreshTokenId || !lastAccessToken) {
    throw new Error('Missing refresh credentials');
  }

  const endpoint = getRefreshEndpoint(role.trim().toLowerCase());
  const response = await axios.post(
    `${BASE_URL}${endpoint}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
        'X-Refresh-Id': refreshTokenId,
        'X-Access-Token': lastAccessToken,
      },
    }
  );

  const newAccessToken = response?.data?.access_token;
  const newRefreshToken = response?.data?.refresh_token;
  const newRefreshTokenId = response?.data?.refresh_token_id;

  if (!newAccessToken) throw new Error('Refresh did not return access token');

  localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, newAccessToken);
  localStorage.setItem(LAST_ACCESS_TOKEN_STORAGE_KEY, newAccessToken);
  localStorage.setItem(AUTH_TOKEN_KIND_STORAGE_KEY, 'access');

  if (newRefreshToken) localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, newRefreshToken);
  if (newRefreshTokenId) localStorage.setItem(REFRESH_TOKEN_ID_STORAGE_KEY, newRefreshTokenId);

  API.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
  return newAccessToken;
}

// Request interceptor: attach JWT
API.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  if (token && !(config as any).skipAuth) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 with refresh
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !(originalRequest as any).__isRefreshRequest
    ) {
      originalRequest._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
        }
        const newToken = await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return API(originalRequest);
      } catch {
        // Refresh failed — clear auth
        localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
        localStorage.removeItem(AUTH_TOKEN_KIND_STORAGE_KEY);
        localStorage.removeItem(AUTH_ROLE_STORAGE_KEY);
        localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
        localStorage.removeItem(REFRESH_TOKEN_ID_STORAGE_KEY);
        localStorage.removeItem(LAST_ACCESS_TOKEN_STORAGE_KEY);
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    // Format error for consistency
    const detail = error.response?.data?.detail;
    const message = typeof detail === 'string'
      ? detail
      : Array.isArray(detail)
        ? detail.map((d: any) => d?.msg || String(d)).join(', ')
        : error.message || 'Network error';

    const formatted = {
      status: error.response?.status || 0,
      data: error.response?.data || {},
      message,
    };
    return Promise.reject(formatted);
  }
);

export default API;
