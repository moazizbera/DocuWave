import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate } from '../router/RouterProvider';

function Login() {
  const { login, loading, error, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [formValues, setFormValues] = React.useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = React.useState({});
  const [formError, setFormError] = React.useState(null);
  const redirectPath = (location.state && location.state.from) || '/';

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectPath]);

  React.useEffect(() => {
    if (error) {
      setFormError(error);
    }
  }, [error]);

  React.useEffect(() => {
    if (location.state && location.state.unauthorized) {
      setFormError(
        'You do not have access to that area. Please sign in with a different account.'
      );
    }
  }, [location.state]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const errors = {};

    if (!formValues.email.trim()) {
      errors.email = 'Email address is required.';
    }

    if (!formValues.password) {
      errors.password = 'Password is required.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setFormError(null);

    try {
      await login({ email: formValues.email.trim(), password: formValues.password });
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setFormError(err?.message || 'Unable to sign in with the provided credentials.');
    }
  };

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
        <div className="text-gray-600" role="status">Redirecting...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-semibold mb-6 text-center">Sign in to DocuWave</h1>
        {formError && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {formError}
          </div>
        )}
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={formValues.email}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                fieldErrors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              aria-invalid={fieldErrors.email ? 'true' : 'false'}
            />
            {fieldErrors.email && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={formValues.password}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                fieldErrors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              aria-invalid={fieldErrors.password ? 'true' : 'false'}
            />
            {fieldErrors.password && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {fieldErrors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
