// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { LoginCredentials, RegisterData, User, UpdateProfileData } from '../types/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  updateUser: (userData: Partial<User>) => void;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  uploadProfilePicture: (file: File) => Promise<string>;
  resendVerification: (email: string) => Promise<void>;
  verifyAccount: (email: string, code: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  confirmPasswordReset: (email: string, code: string, password: string) => Promise<void>;
  getProfilePictureUrl: (avatar?: string) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default avatar generator
const getDefaultAvatar = (name: string): string => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=200&color=fff&bold=true`;
};

// Generate profile picture URL
const getProfilePictureUrl = (avatar?: string): string => {
  if (!avatar) return '';
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar;
  }
  // If it's a base64 or relative path, return as is
  if (avatar.startsWith('data:image') || avatar.startsWith('/')) {
    return avatar;
  }
  // Default avatar from ui-avatars
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(avatar)}&background=random&size=200&color=fff&bold=true`;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Ensure profile_picture is set
        if (!parsedUser.profile_picture && parsedUser.name) {
          parsedUser.profile_picture = getDefaultAvatar(parsedUser.name);
        }
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  // Login user
  const login = async (credentials: LoginCredentials): Promise<void> => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data with profile picture
      const userData: User = {
        id: 1,
        email: credentials.email,
        name: 'John Doe',
        firstName: 'John',
        lastName: 'Doe',
        isVerified: true,
        role: 'customer',
        profile_picture: 'https://ui-avatars.com/api/?name=John+Doe&background=random&size=200&color=fff&bold=true',
        avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=random&size=200&color=fff&bold=true',
        phone: '+1 234 567 8900',
        country: 'TZ',
        region: 'Dar es Salaam',
        city: 'Kinondoni',
        createdAt: new Date().toISOString(),
        emailVerified: true,
        status: 'active',
        bio: 'Welcome to my profile!',
        gender: 'male',
        preferredLanguage: 'en',
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', 'mock-jwt-token-' + Date.now());
    } catch (error) {
      throw new Error('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Register new user
  const register = async (data: RegisterData): Promise<void> => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate profile picture from name
      const profilePic = data.profile_picture || getDefaultAvatar(data.fullName);
      
      // Mock user data with profile picture
      const userData: User = {
        id: Date.now(),
        email: data.email,
        name: data.fullName,
        firstName: data.fullName.split(' ')[0] || '',
        lastName: data.fullName.split(' ').slice(1).join(' ') || '',
        phone: data.phone,
        country: data.country,
        region: data.region,
        city: data.city,
        isVerified: false,
        emailVerified: false,
        role: 'customer',
        profile_picture: profilePic,
        avatar: profilePic,
        createdAt: new Date().toISOString(),
        status: 'pending',
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', 'mock-jwt-token-' + Date.now());
    } catch (error) {
      throw new Error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = (): void => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // Update user data
  const updateUser = (userData: Partial<User>): void => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      // Ensure profile_picture is set
      if (!updatedUser.profile_picture && updatedUser.name) {
        updatedUser.profile_picture = getDefaultAvatar(updatedUser.name);
      }
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  // Update user profile
  const updateProfile = async (data: UpdateProfileData): Promise<void> => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (user) {
        const updatedUser = { 
          ...user, 
          ...data,
          // If name is updated, update both name and firstName/lastName if needed
          profile_picture: data.profile_picture || user.profile_picture,
        };
        
        // If name is provided, update firstName and lastName accordingly
        if (data.name) {
          const nameParts = data.name.split(' ');
          updatedUser.firstName = nameParts[0] || '';
          updatedUser.lastName = nameParts.slice(1).join(' ') || '';
        }
        
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      throw new Error('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Upload profile picture
  const uploadProfilePicture = async (file: File): Promise<string> => {
    try {
      // Simulate upload to server
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Convert file to base64 for preview (in real app, you'd get URL from server)
      const reader = new FileReader();
      const imageUrl = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      
      // Update user with new profile picture
      if (user) {
        const updatedUser = { 
          ...user, 
          profile_picture: imageUrl,
          avatar: imageUrl,
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      return imageUrl;
    } catch (error) {
      throw new Error('Failed to upload profile picture. Please try again.');
    }
  };

  // Resend verification code
  const resendVerification = async (email: string): Promise<void> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`Verification code sent to ${email}`);
    } catch (error) {
      throw new Error('Failed to resend verification code. Please try again.');
    }
  };

  // Verify account with code
  const verifyAccount = async (email: string, code: string): Promise<void> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      if (code.length !== 6) {
        throw new Error('Invalid verification code');
      }
      
      if (user) {
        const updatedUser = { 
          ...user, 
          isVerified: true, 
          emailVerified: true,
          status: 'active' 
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      throw new Error('Invalid verification code. Please try again.');
    }
  };

  // Send password reset email
  const resetPassword = async (email: string): Promise<void> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`Password reset link sent to ${email}`);
    } catch (error) {
      throw new Error('Failed to send password reset email. Please try again.');
    }
  };

  // Confirm password reset with code and new password
  const confirmPasswordReset = async (
    email: string, 
    code: string, 
    password: string
  ): Promise<void> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      if (code.length !== 6) {
        throw new Error('Invalid verification code');
      }
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }
      console.log(`Password reset successfully for ${email}`);
    } catch (error) {
      throw new Error('Failed to reset password. Please try again.');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        updateUser,
        updateProfile,
        uploadProfilePicture,
        resendVerification,
        verifyAccount,
        resetPassword,
        confirmPasswordReset,
        getProfilePictureUrl,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};