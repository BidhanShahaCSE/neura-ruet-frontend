import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import API from '../utils/api/apiClient';
import {
  AUTH_TOKEN_STORAGE_KEY,
  AUTH_TOKEN_KIND_STORAGE_KEY,
  AUTH_ROLE_STORAGE_KEY,
  AUTH_FULL_NAME_STORAGE_KEY,
  REFRESH_TOKEN_STORAGE_KEY,
  REFRESH_TOKEN_ID_STORAGE_KEY,
  LAST_ACCESS_TOKEN_STORAGE_KEY,
} from '../utils/api/apiConfig';

export type UserRole = 'student' | 'teacher' | 'cr';
export type AuthStatus = 'loading' | 'unauthenticated' | 'setup' | 'authenticated';

interface AuthContextValue {
  status: AuthStatus;
  role: UserRole | null;
  profile: { fullName: string } | null;
  clearAllAuth: () => void;
  setAuthenticated: (params: { role: UserRole; accessToken: string }) => void;
  refreshProfile: (roleOverride?: UserRole) => Promise<string | null>;
  completeSetup: (data: {
    accessToken: string;
    refreshToken: string;
    refreshTokenId: string;
    role: UserRole;
    fullName: string;
  }) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEYS = [
  AUTH_TOKEN_STORAGE_KEY,
  AUTH_TOKEN_KIND_STORAGE_KEY,
  AUTH_ROLE_STORAGE_KEY,
  AUTH_FULL_NAME_STORAGE_KEY,
  REFRESH_TOKEN_STORAGE_KEY,
  REFRESH_TOKEN_ID_STORAGE_KEY,
  LAST_ACCESS_TOKEN_STORAGE_KEY,
];

function getProfileMeEndpoint(role: string) {
  if (role === 'teacher') return '/api/v1/teachers/profile-setup/me';
  if (role === 'cr') return '/api/v1/crs/profile-setup/me';
  return '/api/v1/students/profile-setup/me';
}

function getRefreshEndpoint(role: string) {
  if (role === 'teacher') return '/api/v1/teachers/refresh';
  if (role === 'cr') return '/api/v1/crs/refresh';
  return '/api/v1/students/refresh';
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [role, setRole] = useState<UserRole | null>(null);
  const [profile, setProfile] = useState<{ fullName: string } | null>(null);

  const clearAllAuth = useCallback(() => {
    STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
    delete API.defaults.headers.common.Authorization;
    setRole(null);
    setProfile(null);
    setStatus('unauthenticated');
  }, []);

  const setAuthenticated = useCallback(({ role: nextRole, accessToken }: { role: UserRole; accessToken: string }) => {
    API.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    setRole(nextRole);
    setStatus('authenticated');
  }, []);

  const completeSetup = useCallback((data: {
    accessToken: string;
    refreshToken: string;
    refreshTokenId: string;
    role: UserRole;
    fullName: string;
  }) => {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, data.accessToken);
    localStorage.setItem(LAST_ACCESS_TOKEN_STORAGE_KEY, data.accessToken);
    localStorage.setItem(AUTH_TOKEN_KIND_STORAGE_KEY, 'access');
    localStorage.setItem(AUTH_ROLE_STORAGE_KEY, data.role);
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, data.refreshToken);
    localStorage.setItem(REFRESH_TOKEN_ID_STORAGE_KEY, data.refreshTokenId);
    localStorage.setItem(AUTH_FULL_NAME_STORAGE_KEY, data.fullName);

    API.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
    setRole(data.role);
    setProfile({ fullName: data.fullName });
    setStatus('authenticated');
  }, []);

  const refreshProfile = useCallback(async (roleOverride?: UserRole) => {
    const effectiveRole = roleOverride || role;
    if (!effectiveRole) return null;

    try {
      const response = await API.get(getProfileMeEndpoint(effectiveRole));
      const fullName = typeof response?.data?.full_name === 'string' ? response.data.full_name.trim() : '';
      setProfile({ fullName });
      localStorage.setItem(AUTH_FULL_NAME_STORAGE_KEY, fullName);
      return fullName;
    } catch {
      const cached = localStorage.getItem(AUTH_FULL_NAME_STORAGE_KEY);
      if (cached) {
        setProfile({ fullName: cached.trim() });
        return cached.trim();
      }
      return null;
    }
  }, [role]);

  // Bootstrap auth on mount
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
        const tokenKind = localStorage.getItem(AUTH_TOKEN_KIND_STORAGE_KEY);
        const storedRole = localStorage.getItem(AUTH_ROLE_STORAGE_KEY) as UserRole | null;

        if (!token || !storedRole) {
          setStatus('unauthenticated');
          return;
        }

        setRole(storedRole);

        if (tokenKind === 'setup') {
          API.defaults.headers.common.Authorization = `Bearer ${token}`;
          setStatus('setup');
          return;
        }

        // Token kind is 'access' — try refreshing
        try {
          const refreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
          const refreshTokenId = localStorage.getItem(REFRESH_TOKEN_ID_STORAGE_KEY);
          const lastAccessToken = localStorage.getItem(LAST_ACCESS_TOKEN_STORAGE_KEY) || token;

          if (refreshToken && refreshTokenId) {
            const endpoint = getRefreshEndpoint(storedRole);
            const response = await API.post(endpoint, {}, {
              skipAuth: true,
              __isRefreshRequest: true,
              headers: {
                Authorization: `Bearer ${refreshToken}`,
                'X-Refresh-Id': refreshTokenId,
                'X-Access-Token': lastAccessToken,
              },
            } as any);

            const newAccessToken = response?.data?.access_token;
            if (newAccessToken) {
              localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, newAccessToken);
              localStorage.setItem(LAST_ACCESS_TOKEN_STORAGE_KEY, newAccessToken);
              localStorage.setItem(AUTH_TOKEN_KIND_STORAGE_KEY, 'access');

              if (response?.data?.refresh_token) {
                localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, response.data.refresh_token);
              }
              if (response?.data?.refresh_token_id) {
                localStorage.setItem(REFRESH_TOKEN_ID_STORAGE_KEY, response.data.refresh_token_id);
              }

              API.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
              setStatus('authenticated');

              // Fetch profile
              const cachedName = localStorage.getItem(AUTH_FULL_NAME_STORAGE_KEY);
              if (cachedName) setProfile({ fullName: cachedName.trim() });

              return;
            }
          }
        } catch {
          // Refresh failed
        }

        // Fallback: try using existing token
        API.defaults.headers.common.Authorization = `Bearer ${token}`;
        const cachedName = localStorage.getItem(AUTH_FULL_NAME_STORAGE_KEY);
        if (cachedName) setProfile({ fullName: cachedName.trim() });
        setStatus('authenticated');
      } catch {
        setStatus('unauthenticated');
      }
    };

    bootstrap();
  }, []);

  const value = useMemo(() => ({
    status,
    role,
    profile,
    clearAllAuth,
    setAuthenticated,
    refreshProfile,
    completeSetup,
  }), [status, role, profile, clearAllAuth, setAuthenticated, refreshProfile, completeSetup]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
