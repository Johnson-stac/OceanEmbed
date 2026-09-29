import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'explorer' | 'researcher';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  affiliation?: string;
  avatarUrl?: string;
  isDemoAuth: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  loginAs: (role: UserRole, customName?: string) => void;
  loginWithGoogle: () => Promise<void>;
  setRole: (role: UserRole) => void;
  logout: () => void;
}

const STORAGE_KEY = 'oceanembed_auth_user';

const DEFAULT_USERS: Record<UserRole, UserProfile> = {
  researcher: {
    id: 'res-001',
    name: 'Dr. Alok Sharma',
    email: 'a.sharma@ocean-institute.org',
    role: 'researcher',
    affiliation: 'National Institute of Oceanography (NIO)',
    isDemoAuth: true,
  },
  explorer: {
    id: 'exp-001',
    name: 'Ocean Explorer',
    email: 'explorer@oceanembed.org',
    role: 'explorer',
    affiliation: 'Student / Enthusiast Access',
    isDemoAuth: true,
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse auth storage', e);
    }
    // Default to researcher demo for seamless developer experience
    return DEFAULT_USERS.researcher;
  });

  const role: UserRole = user?.role || 'explorer';

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const loginAs = (selectedRole: UserRole, customName?: string) => {
    const base = DEFAULT_USERS[selectedRole];
    setUser({
      ...base,
      name: customName || base.name,
      role: selectedRole,
    });
  };

  const loginWithGoogle = async () => {
    // In production with Google OAuth configured, window.google?.accounts.id.prompt() or redirect flow executes.
    // In demo environment, provide structured demo sign-in with clear disclosure:
    loginAs('researcher', 'Dr. Alok Sharma (Google Auth Demo)');
  };

  const setRole = (newRole: UserRole) => {
    if (user) {
      setUser({
        ...user,
        role: newRole,
      });
    } else {
      loginAs(newRole);
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: !!user,
        loginAs,
        loginWithGoogle,
        setRole,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
