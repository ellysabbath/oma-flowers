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

interface AuthContextType {
  user: User | null;
  distributor: Distributor | null;
  userType: string | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<any>; // ← returns the API response
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

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        // Prefer explicit user_type in localStorage; fall back to user object
        const storedType =
          localStorage.getItem('user_type') ||
          userData.user_type ||
          null;
        setUserType(storedType);

        if (storedType === 'distributor') {
          const storedDistributor = localStorage.getItem('distributor');
          if (storedDistributor) {
            setDistributor(JSON.parse(storedDistributor));
          }
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_type');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authAPI.login(credentials);

      localStorage.setItem('access_token', response.access);
      localStorage.setItem('refresh_token', response.refresh);
      localStorage.setItem('user', JSON.stringify(response.user));
      // Persist role so refresh + redirect logic stays consistent
      if (response.user_type) {
        localStorage.setItem('user_type', response.user_type);
      }

      setUser(response.user);
      setUserType(response.user_type);

      if (response.distributor) {
        setDistributor(response.distributor);
        localStorage.setItem(
          'distributor',
          JSON.stringify(response.distributor)
        );
      }

      // Return the full response so callers can route based on user_type
      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await authAPI.register(data);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await authAPI.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      localStorage.removeItem('distributor');
      localStorage.removeItem('user_type');
      setUser(null);
      setDistributor(null);
      setUserType(null);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
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