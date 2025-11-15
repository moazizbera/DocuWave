import React from 'react';
import { apiService } from '../services/api';

const AUTH_TOKEN_KEY = 'docuwave_token';
const AUTH_USER_KEY = 'docuwave_user';

const safeStorage = {
  get(key) {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }

    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      console.warn('Unable to access localStorage for key', key, error);
      return null;
    }
  },
  set(key, value) {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }

    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      console.warn('Unable to persist localStorage value for key', key, error);
    }
  },
  remove(key) {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }

    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.warn('Unable to remove localStorage value for key', key, error);
    }
  }
};

const readStoredUser = () => {
  const raw = safeStorage.get(AUTH_USER_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn('Stored user data is invalid JSON, ignoring value', error);
    return null;
  }
};

export const AuthContext = React.createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = React.useState(() => safeStorage.get(AUTH_TOKEN_KEY));
  const [user, setUser] = React.useState(() => readStoredUser());
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const persistToken = React.useCallback((value) => {
    if (!value) {
      safeStorage.remove(AUTH_TOKEN_KEY);
      return;
    }

    safeStorage.set(AUTH_TOKEN_KEY, value);
  }, []);

  const persistUser = React.useCallback((value) => {
    if (!value) {
      safeStorage.remove(AUTH_USER_KEY);
      return;
    }

    safeStorage.set(AUTH_USER_KEY, JSON.stringify(value));
  }, []);

  React.useEffect(() => {
    persistToken(token);
  }, [token, persistToken]);

  React.useEffect(() => {
    persistUser(user);
  }, [user, persistUser]);

  const login = React.useCallback(async (credentials) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.auth.login(credentials);

      if (!response || !response.token) {
        throw new Error('Login response did not include an access token.');
      }

      setToken(String(response.token));
      setUser(response.user || null);
      setError(null);

      return response;
    } catch (err) {
      const message = err?.message || 'Unable to sign in with the provided credentials.';
      setToken(null);
      setUser(null);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = React.useCallback(() => {
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  const value = React.useMemo(
    () => ({
      user,
      token,
      loading,
      error,
      isAuthenticated: Boolean(token),
      login,
      logout
    }),
    [user, token, loading, error, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = React.useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export default AuthProvider;
