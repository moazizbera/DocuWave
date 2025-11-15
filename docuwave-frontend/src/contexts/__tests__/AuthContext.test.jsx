import React from 'react';
import { render, act } from '@testing-library/react';
import { AuthProvider, AuthContext } from '../AuthContext';
import { apiService } from '../../services/api';

function CaptureAuth({ onValue }) {
  const context = React.useContext(AuthContext);
  React.useEffect(() => {
    onValue(context);
  }, [context, onValue]);
  return null;
}

describe('AuthContext', () => {
  const originalLogin = apiService.auth.login;

  beforeEach(() => {
    window.localStorage.clear();
    apiService.auth.login = jest.fn();
  });

  afterAll(() => {
    apiService.auth.login = originalLogin;
  });

  it('initializes state from persisted values', () => {
    window.localStorage.setItem('docuwave_token', 'stored-token');
    window.localStorage.setItem('docuwave_user', JSON.stringify({ id: 'user-1' }));

    const capture = jest.fn();

    render(
      <AuthProvider>
        <CaptureAuth onValue={capture} />
      </AuthProvider>
    );

    const latestContext = capture.mock.calls[capture.mock.calls.length - 1][0];

    expect(latestContext.token).toBe('stored-token');
    expect(latestContext.user).toEqual({ id: 'user-1' });
    expect(latestContext.isAuthenticated).toBe(true);
  });

  it('performs successful login and persists state', async () => {
    const user = { id: 'user-2', roles: ['admin'] };
    apiService.auth.login.mockResolvedValue({ token: 'new-token', user });

    const capture = jest.fn();

    render(
      <AuthProvider>
        <CaptureAuth onValue={capture} />
      </AuthProvider>
    );

    const contextBeforeLogin = capture.mock.calls[capture.mock.calls.length - 1][0];

    await act(async () => {
      await contextBeforeLogin.login({ email: 'user@example.com', password: 'secret' });
    });

    const contextAfterLogin = capture.mock.calls[capture.mock.calls.length - 1][0];

    expect(apiService.auth.login).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'secret'
    });
    expect(contextAfterLogin.token).toBe('new-token');
    expect(contextAfterLogin.user).toEqual(user);
    expect(contextAfterLogin.isAuthenticated).toBe(true);
    expect(window.localStorage.getItem('docuwave_token')).toBe('new-token');
    expect(window.localStorage.getItem('docuwave_user')).toBe(JSON.stringify(user));
  });

  it('captures login errors and clears state', async () => {
    const error = new Error('Invalid credentials');
    apiService.auth.login.mockRejectedValue(error);

    const capture = jest.fn();

    render(
      <AuthProvider>
        <CaptureAuth onValue={capture} />
      </AuthProvider>
    );

    const contextBeforeLogin = capture.mock.calls[capture.mock.calls.length - 1][0];

    await act(async () => {
      await expect(
        contextBeforeLogin.login({ email: 'user@example.com', password: 'wrong' })
      ).rejects.toThrow('Invalid credentials');
    });

    const contextAfterLogin = capture.mock.calls[capture.mock.calls.length - 1][0];

    expect(contextAfterLogin.token).toBeNull();
    expect(contextAfterLogin.user).toBeNull();
    expect(contextAfterLogin.error).toBe('Invalid credentials');
    expect(contextAfterLogin.isAuthenticated).toBe(false);
    expect(window.localStorage.getItem('docuwave_token')).toBeNull();
    expect(window.localStorage.getItem('docuwave_user')).toBeNull();
  });
});
