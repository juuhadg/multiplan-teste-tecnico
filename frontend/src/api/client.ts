import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { jwtDecode } from 'jwt-decode';
import { tokenStorage } from './tokens';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export const api = axios.create({ baseURL });

function isTokenExpired(token: string, bufferSeconds = 30): boolean {
  try {
    const { exp } = jwtDecode<{ exp: number }>(token);
    if (!exp) return true;
    return exp * 1000 < Date.now() + bufferSeconds * 1000;
  } catch {
    return true;
  }
}

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStorage.getRefresh();
  if (!refreshToken) return null;

  try {
    const { data } = await axios.post<{ accessToken: string }>(
      `${baseURL}/auth/refresh`,
      { refreshToken },
    );
    tokenStorage.setAccess(data.accessToken);
    return data.accessToken;
  } catch {
    tokenStorage.clear();
    return null;
  }
}

api.interceptors.request.use(async (config) => {
  if (config.url?.startsWith('/auth/')) return config;

  let token = tokenStorage.getAccess();

  if (token && isTokenExpired(token)) {
    refreshInFlight ??= refreshAccessToken().finally(() => {
      refreshInFlight = null;
    });
    token = await refreshInFlight;

    if (!token) {
      window.location.href = '/login';
      return Promise.reject(new Error('Session expired'));
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    if (!original || error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    // Do not try to refresh on auth endpoints themselves.
    if (original.url?.startsWith('/auth/')) {
      return Promise.reject(error);
    }

    original._retry = true;
    refreshInFlight ??= refreshAccessToken().finally(() => {
      refreshInFlight = null;
    });

    const newToken = await refreshInFlight;
    if (!newToken) {
      window.location.href = '/login';
      return Promise.reject(error);
    }

    original.headers.Authorization = `Bearer ${newToken}`;
    return api(original);
  },
);
