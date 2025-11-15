import React from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { OrgProvider } from './contexts/OrgContext';
import { AuthProvider } from './contexts/AuthContext';
import { RouterProvider, useLocation } from './router/RouterProvider';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './pages/Login';
import DocuWaveSystem from './DocuWaveSystem';

/**
 * 🎯 ROOT APP COMPONENT
 * =====================
 * Wraps the entire application with context providers in correct hierarchy:
 *
 * AuthProvider (outermost)
 *   └─ ThemeProvider
 *       └─ LanguageProvider
 *           └─ OrgProvider
 *               └─ RouterProvider
 *                   └─ Route-aware content (Login, DocuWaveSystem, etc.)
 *
 * This ensures all contexts are available throughout the app
 *
 * @component
 */

function AppProviders({ children }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LanguageProvider>
          <OrgProvider>{children}</OrgProvider>
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

function AppRoutes() {
  const location = useLocation();

  if (location.pathname === '/login') {
    return <Login />;
  }

  return (
    <ProtectedRoute>
      <DocuWaveSystem />
    </ProtectedRoute>
  );
}

function App() {
  return (
    <AppProviders>
      <RouterProvider>
        <AppRoutes />
      </RouterProvider>
    </AppProviders>
  );
}

export default App;