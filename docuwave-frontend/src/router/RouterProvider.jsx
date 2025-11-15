import React from 'react';

const RouterContext = React.createContext(null);

const ensureLeadingSlash = (value) => {
  if (!value) {
    return '/';
  }

  return value.startsWith('/') ? value : `/${value}`;
};

const normalizeEntry = (entry) => {
  if (typeof entry === 'string') {
    return { pathname: ensureLeadingSlash(entry), state: null };
  }

  if (entry && typeof entry === 'object') {
    const pathname = ensureLeadingSlash(entry.pathname || '/');
    return { pathname, state: entry.state ?? null };
  }

  return { pathname: '/', state: null };
};

export function RouterProvider({ children, initialEntries }) {
  const isMemoryRouter = Array.isArray(initialEntries) && initialEntries.length > 0;

  const [location, setLocation] = React.useState(() => {
    if (isMemoryRouter) {
      const initial = initialEntries[initialEntries.length - 1];
      return normalizeEntry(initial);
    }

    if (typeof window !== 'undefined') {
      const pathname = ensureLeadingSlash(window.location?.pathname || '/');
      const state = (typeof window.history !== 'undefined' && window.history.state) || null;
      return { pathname, state };
    }

    return { pathname: '/', state: null };
  });

  const navigate = React.useCallback(
    (to, options = {}) => {
      const { replace = false, state: nextState } = options;
      const normalizedTarget = normalizeEntry(to);
      const updatedLocation = {
        pathname: normalizedTarget.pathname,
        state:
          typeof nextState !== 'undefined' ? nextState : normalizedTarget.state ?? null
      };

      if (isMemoryRouter) {
        setLocation(updatedLocation);
        return;
      }

      if (typeof window !== 'undefined' && typeof window.history !== 'undefined') {
        const url = updatedLocation.pathname || '/';
        if (replace) {
          window.history.replaceState(updatedLocation.state, '', url);
        } else {
          window.history.pushState(updatedLocation.state, '', url);
        }
      }

      setLocation(updatedLocation);
    },
    [isMemoryRouter]
  );

  React.useEffect(() => {
    if (isMemoryRouter || typeof window === 'undefined') {
      return undefined;
    }

    const handlePopState = (event) => {
      const pathname = ensureLeadingSlash(window.location?.pathname || '/');
      setLocation({ pathname, state: event.state || null });
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isMemoryRouter]);

  const contextValue = React.useMemo(
    () => ({
      location,
      navigate,
      replace: (to, options = {}) => navigate(to, { ...options, replace: true })
    }),
    [location, navigate]
  );

  return <RouterContext.Provider value={contextValue}>{children}</RouterContext.Provider>;
}

export function MemoryRouter({ children, initialEntries = ['/'] }) {
  return (
    <RouterProvider initialEntries={initialEntries}>
      {children}
    </RouterProvider>
  );
}

export const useRouter = () => {
  const context = React.useContext(RouterContext);

  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }

  return context;
};

export const useLocation = () => useRouter().location;

export const useNavigate = () => useRouter().navigate;

export function Navigate({ to, replace = false, state }) {
  const navigate = useNavigate();

  React.useEffect(() => {
    navigate(to, { replace, state });
  }, [navigate, to, replace, state]);

  return null;
}

export default RouterProvider;
