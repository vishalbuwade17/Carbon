import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('ecotrack_token') || null);
  const [loading, setLoading] = useState(true);
  const [authModal, setAuthModal] = useState({ isOpen: false, tab: 'login' });

  // Fetch current user details on boot if token exists
  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          // Token expired or invalid
          logout();
        }
      } catch (err) {
        console.error('Failed to load user profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }

    localStorage.setItem('ecotrack_token', data.token);
    setToken(data.token);
    setUser(data.user);
    closeAuthModal();
    return data.user;
  };

  const signup = async (name, email, password) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    localStorage.setItem('ecotrack_token', data.token);
    setToken(data.token);
    setUser(data.user);
    closeAuthModal();
    return data.user;
  };

  const googleSignIn = async (name, email) => {
    const res = await fetch('/api/auth/google-signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Google sign-in failed');
    }

    localStorage.setItem('ecotrack_token', data.token);
    setToken(data.token);
    setUser(data.user);
    closeAuthModal();
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('ecotrack_token');
    setToken(null);
    setUser(null);
  };

  const openAuthModal = (tab = 'login') => {
    setAuthModal({ isOpen: true, tab });
  };

  const closeAuthModal = () => {
    setAuthModal({ isOpen: false, tab: 'login' });
  };

  const updateUserLocal = (updatedFields) => {
    setUser(prev => {
      if (!prev) return null;
      return { ...prev, ...updatedFields };
    });
  };

  const value = {
    user,
    token,
    loading,
    authModal,
    login,
    signup,
    googleSignIn,
    logout,
    openAuthModal,
    closeAuthModal,
    updateUserLocal
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
