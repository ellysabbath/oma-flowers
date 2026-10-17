// src/context/AuthContext.tsx
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  type ReactNode,
} from 'react';
import { authAPI } from '../api/auth';
import type {
  User,
  Distributor,
  LoginCredentials,
  RegisterData,
} from '../types';

/* ------------------------------------------------------------------ */
/* Safe localStorage helpers                                           */
/* ------------------------------------------------------------------ */

/**
 * Persist a value to localStorage without ever throwing.
 * localStorage is a *cache*, not a source of truth — a quota failure
 * must never take down the app.
 */
const safeSetItem = (key: string, value: string): boolean => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err) {
    console.warn(
      `[AuthContext] localStorage.setItem("${key}") failed ` +
        `(likely quota exceeded). Skipping cache.`,
      err
    );
    // Best-effort: drop the offending entry so other writes can succeed.
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
    return false;
  }
};

const safeRemoveItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
};

const safeGetItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

/**
 * Persist only a minimal user "stub" so the UI can hydrate quickly on
 * refresh without bloating localStorage. Full profile is re-fetched
 * from the API on demand.
 */
const buildUserStub = (u: User) => ({
  id: u.id,
  username: u.username,
  email: u.email,
  first_name: u.first_name,
  last_name: u.last_name,
  full_name: u.full_name,
  user_type: u.user_type,
  status: u.status,
  profile_picture: u.profile_picture,
  email_verified: u.email_verified,
});

const persistUser = (u: User | null): void => {
  if (!u) {
    safeRemoveItem('user');
    safeRemoveItem('user_type');
    return;
  }
  const ok = safeSetItem('user', JSON.stringify(buildUserStub(u)));
  if (ok) {
    if (u.user_type) safeSetItem('user_type', u.user_type);
  }
};

/* ------------------------------------------------------------------ */
/* Context                                                             */
/* ------------------------------------------------------------------ */

interface AuthContextType {
  user: User | null;
  distributor: Distributor | null;
  userType: string | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<any>;
  register: (data: RegisterData) => Promise<any>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  isAuthenticated: boolean;
  isDistributor: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [distributor, setDistributor] = useState<Distributor | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /* ---------- Hydrate from localStorage on mount ---------- */
  useEffect(() => {
    const token = safeGetItem('access_token');
    const storedUser = safeGetItem('user');

    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);

        const storedType =
          safeGetItem('user_type') || userData?.user_type || null;
        setUserType(storedType);

        if (storedType === 'distributor') {
          const storedDistributor = safeGetItem('distributor');
          if (storedDistributor) {
            try {
              setDistributor(JSON.parse(storedDistributor));
            } catch (e) {
              console.warn('Failed to parse stored distributor', e);
              safeRemoveItem('distributor');
            }
          }
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        safeRemoveItem('user');
        safeRemoveItem('access_token');
        safeRemoveItem('refresh_token');
        safeRemoveItem('user_type');
        safeRemoveItem('distributor');
      }
    }
    setIsLoading(false);
  }, []);

  /* ---------- Login ---------- */
  const login = async (credentials: LoginCredentials) => {
    // Throwing here is correct — login *is* the critical path.
    const response = await authAPI.login(credentials);

    // Token storage is small; safe to set. But guard anyway.
    safeSetItem('access_token', response.access);
    safeSetItem('refresh_token', response.refresh);

    // User payload may be huge (e.g. admin) — persist a stub only.
    persistUser(response.user);

    setUser(response.user);
    setUserType(response.user_type ?? response.user?.user_type ?? null);

    if (response.distributor) {
      setDistributor(response.distributor);
      safeSetItem('distributor', JSON.stringify(response.distributor));
    }

    return response;
  };

  /* ---------- Register ---------- */
  const register = async (data: RegisterData) => {
    return await authAPI.register(data);
  };

  /* ---------- Logout ---------- */
  const logout = async () => {
    try {
      const refreshToken = safeGetItem('refresh_token');
      if (refreshToken) {
        await authAPI.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      safeRemoveItem('access_token');
      safeRemoveItem('refresh_token');
      safeRemoveItem('user');
      safeRemoveItem('distributor');
      safeRemoveItem('user_type');
      setUser(null);
      setDistributor(null);
      setUserType(null);
    }
  };

  /* ---------- updateUser ---------- */
  /**
   * Update React state immediately; then try to cache.
   * A cache failure (quota) must NEVER throw — the app can operate
   * entirely from in-memory state.
   */
  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    persistUser(updatedUser); // safe, never throws
  };

  const value: AuthContextType = {
    user,
    distributor,
    userType,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isDistributor: userType === 'distributor',
    isAdmin: userType === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};