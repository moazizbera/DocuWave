const DEFAULT_API_BASE_URL =
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) ||
  'https://localhost:7095/api';

const defaultTokenProvider = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      return window.localStorage.getItem('docuwave_token');
    } catch (error) {
      console.warn('Unable to read auth token from localStorage', error);
    }
  }
  return null;
};

const isFormData = (value) =>
  typeof FormData !== 'undefined' && value instanceof FormData;

const isPlainObject = (value) =>
  Object.prototype.toString.call(value) === '[object Object]';

export class APIError extends Error {
  constructor(message, { status, statusText, body } = {}) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.statusText = statusText;
    this.body = body;
  }
}

export class APIService {
  constructor({ baseURL = DEFAULT_API_BASE_URL, tokenProvider = defaultTokenProvider, fetchImpl } = {}) {
    this.baseURL = this.#normalizeBaseURL(baseURL);
    this.tokenProvider = tokenProvider;
    const fetchContext =
      typeof window !== 'undefined'
        ? window
        : typeof global !== 'undefined'
        ? global
        : undefined;

    this.fetch = fetchImpl || (typeof fetch !== 'undefined' ? fetch.bind(fetchContext) : null);

    if (!this.fetch) {
      throw new Error('A fetch implementation must be provided to APIService.');
    }
  }

  documents = {
    list: () => this.request('/document'),
    upload: (file, { schemeId, language = 'en', ocrEngine = 'Tesseract' } = {}) => {
      if (typeof FormData === 'undefined') {
        throw new Error('File uploads require FormData support.');
      }

      if (!schemeId) {
        throw new Error('schemeId is required to upload a document.');
      }

      const formData = new FormData();
      formData.append('file', file);

      const query = new URLSearchParams({
        schemeId: String(schemeId),
        language,
        ocrEngine
      }).toString();

      return this.request(`/document/upload?${query}`, {
        method: 'POST',
        body: formData
      });
    },
    remove: (id) => this.request(`/document/${id}`, { method: 'DELETE' })
  };

  workflows = {
    list: () => this.request('/workflow'),
    get: (id) => this.request(`/workflow/${id}`),
    trigger: (id, payload = {}) =>
      this.request(`/workflow/${id}/trigger`, {
        method: 'POST',
        body: payload
      })
  };

  organization = {
    getProfile: () => this.request('/organization'),
    updateProfile: (payload) =>
      this.request('/organization', {
        method: 'PUT',
        body: payload
      })
  };

  analytics = {
    overview: () => this.request('/analytics/overview'),
    documents: () => this.request('/analytics/documents'),
    workflows: () => this.request('/analytics/workflows')
  };

  async request(path, options = {}) {
    if (!path) {
      throw new Error('A request path must be provided.');
    }

    const { headers: customHeaders = {}, body, ...rest } = options;
    const headers = this.#buildHeaders(customHeaders, body);
    const url = this.#buildURL(path);
    const requestBody = this.#prepareBody(body, headers);

    const response = await this.fetch(url, {
      ...rest,
      headers,
      body: requestBody
    });

    const parsedBody = await this.#parseResponseBody(response);

    if (!response.ok) {
      const message = (parsedBody && parsedBody.message) || response.statusText || 'Request failed';
      throw new APIError(message, {
        status: response.status,
        statusText: response.statusText,
        body: parsedBody
      });
    }

    return parsedBody;
  }

  #buildHeaders(initialHeaders = {}, body) {
    const headers = { ...initialHeaders };

    if (!headers.Accept && !headers.accept) {
      headers.Accept = 'application/json';
    }

    if (body && !headers['Content-Type'] && !headers['content-type'] && !isFormData(body)) {
      headers['Content-Type'] = 'application/json';
    }

    const token = this.tokenProvider ? this.tokenProvider() : null;
    if (token && !headers.Authorization && !headers.authorization) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  #prepareBody(body, headers) {
    if (!body) {
      return undefined;
    }

    if (
      isFormData(body) ||
      typeof body === 'string' ||
      (typeof Blob !== 'undefined' && body instanceof Blob)
    ) {
      return body;
    }

    if (isPlainObject(body)) {
      const contentType = headers['Content-Type'] || headers['content-type'];
      if (contentType && String(contentType).includes('application/json')) {
        return JSON.stringify(body);
      }
      return body;
    }

    return body;
  }

  async #parseResponseBody(response) {
    if (!response || typeof response.text !== 'function') {
      return null;
    }

    const raw = await response.text();

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw);
    } catch (error) {
      return raw;
    }
  }

  #buildURL(path) {
    if (/^https?:\/\//i.test(path)) {
      return path;
    }

    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.baseURL}${normalizedPath}`;
  }

  #normalizeBaseURL(url) {
    if (!url) {
      return '';
    }
    return url.replace(/\/?$/, '');
  }
}

export const apiService = new APIService();

export default apiService;
