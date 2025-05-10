'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from './ToastContext';

// Create the context
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { showError, showSuccess } = useToast();

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if there's a token in localStorage
        const token = localStorage.getItem('authToken');
        
        if (token) {
          // For now, just consider having a token as being logged in
          // In a real app, you would validate the token with your backend
          setUser({ id: 'temp-user-id', token });
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      
      // In a real app, you would call your API here
      // For now, we'll simulate a successful login
      const mockUser = { id: 'user-123', email, name: 'Test User' };
      const mockToken = 'mock-jwt-token';
      
      // Store the token
      localStorage.setItem('authToken', mockToken);
      
      // Update state
      setUser(mockUser);
      showSuccess('Login successful');
      
      return { success: true };
    } catch (error) {
      showError(error.message || 'Login failed');
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    router.push('/login');
    showSuccess('Logged out successfully');
  };

  // Register function
  const register = async (name, email, password) => {
    try {
      setLoading(true);
      
      // In a real app, you would call your API here
      // For now, we'll simulate a successful registration
      
      showSuccess('Registration successful! Please log in.');
      router.push('/login');
      
      return { success: true };
    } catch (error) {
      showError(error.message || 'Registration failed');
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}