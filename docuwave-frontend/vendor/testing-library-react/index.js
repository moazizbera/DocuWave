const ReactDOM = require('react-dom');
const { act } = require('react-dom/test-utils');

const mountedContainers = new Set();

const createMatcher = (text) => {
  if (text instanceof RegExp) {
    return (value) => text.test(value);
  }

  if (typeof text === 'function') {
    return text;
  }

  const normalized = String(text).trim();
  return (value) => String(value).trim() === normalized;
};

const queryByText = (container, text) => {
  const matcher = createMatcher(text);
  const elements = container.querySelectorAll('*');

  for (const element of elements) {
    if (matcher(element.textContent || '')) {
      return element;
    }
  }

  return null;
};

const getByText = (container, text) => {
  const element = queryByText(container, text);

  if (!element) {
    throw new Error(`Unable to find element with text: ${text}`);
  }

  return element;
};

const getByTestId = (container, testId) => {
  const element = container.querySelector(`[data-testid="${testId}"]`);

  if (!element) {
    throw new Error(`Unable to find element by data-testid: ${testId}`);
  }

  return element;
};

const cleanup = () => {
  mountedContainers.forEach((container) => {
    act(() => {
      ReactDOM.unmountComponentAtNode(container);
    });

    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });
  mountedContainers.clear();
};

if (typeof afterEach === 'function') {
  afterEach(() => {
    cleanup();
  });
}

const render = (ui) => {
  const container = document.createElement('div');
  document.body.appendChild(container);

  act(() => {
    ReactDOM.render(ui, container);
  });

  mountedContainers.add(container);

  return {
    container,
    unmount: () => {
      if (!mountedContainers.has(container)) {
        return;
      }

      act(() => {
        ReactDOM.unmountComponentAtNode(container);
      });

      mountedContainers.delete(container);

      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    },
    rerender: (nextUI) => {
      act(() => {
        ReactDOM.render(nextUI, container);
      });
    },
    getByText: (text) => getByText(container, text),
    queryByText: (text) => queryByText(container, text),
    getByTestId: (testId) => getByTestId(container, testId)
  };
};

const waitFor = (callback, { timeout = 1000, interval = 50 } = {}) => {
  const start = Date.now();

  return new Promise((resolve, reject) => {
    const check = () => {
      try {
        const result = callback();
        resolve(result);
      } catch (error) {
        if (Date.now() - start >= timeout) {
          reject(error);
        } else {
          setTimeout(check, interval);
        }
      }
    };

    check();
  });
};

const screen = {
  getByText: (text) => getByText(document.body, text),
  queryByText: (text) => queryByText(document.body, text),
  getByTestId: (testId) => getByTestId(document.body, testId)
};

module.exports = {
  act,
  cleanup,
  render,
  screen,
  waitFor,
  getByText,
  queryByText,
  getByTestId
};
