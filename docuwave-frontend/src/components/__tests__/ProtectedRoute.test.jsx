import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ProtectedRoute from '../auth/ProtectedRoute';
import { AuthContext } from '../../contexts/AuthContext';
import { MemoryRouter, useLocation } from '../../router/RouterProvider';

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

const createAuthValue = (overrides = {}) => ({
  user: null,
  token: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  login: jest.fn(),
  logout: jest.fn(),
  ...overrides
});

describe('ProtectedRoute', () => {
  it('redirects unauthenticated users to the login page', async () => {
    render(
      <AuthContext.Provider value={createAuthValue()}>
        <MemoryRouter initialEntries={[{ pathname: '/dashboard' }]}>
          <ProtectedRoute>
            <div>Secret Content</div>
          </ProtectedRoute>
          <LocationDisplay />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('location').textContent).toBe('/login');
    });
    expect(screen.queryByText('Secret Content')).toBeNull();
  });

  it('renders children when the user is authenticated', async () => {
    render(
      <AuthContext.Provider value={createAuthValue({ isAuthenticated: true })}>
        <MemoryRouter initialEntries={[{ pathname: '/dashboard' }]}>
          <ProtectedRoute>
            <div>Secret Content</div>
          </ProtectedRoute>
          <LocationDisplay />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Secret Content')).toBeTruthy();
    });
    expect(screen.getByTestId('location').textContent).toBe('/dashboard');
  });

  it('redirects authenticated users without required role', async () => {
    render(
      <AuthContext.Provider
        value={createAuthValue({ isAuthenticated: true, user: { roles: ['member'] } })}
      >
        <MemoryRouter initialEntries={[{ pathname: '/admin' }]}>
          <ProtectedRoute requiredRoles={['admin']}>
            <div>Admin Area</div>
          </ProtectedRoute>
          <LocationDisplay />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('location').textContent).toBe('/login');
    });
    expect(screen.queryByText('Admin Area')).toBeNull();
  });
});
