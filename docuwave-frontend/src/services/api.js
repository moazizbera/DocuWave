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

const defaultTenantProvider = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      return window.localStorage.getItem('docuwave_tenant');
    } catch (error) {
      console.warn('Unable to read tenant from localStorage', error);
    }
  }
  return null;
};

const emitToast = (message, type = 'error') => {
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(
      new CustomEvent('api-toast', {
        detail: { message, type }
      })
    );
  }
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
  constructor({
    baseURL = DEFAULT_API_BASE_URL,
    tokenProvider = defaultTokenProvider,
    tenantProvider = defaultTenantProvider,
    fetchImpl
  } = {}) {
    this.baseURL = this.#normalizeBaseURL(baseURL);
    this.tokenProvider = tokenProvider;
    this.tenantProvider = tenantProvider;
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

  auth = {
    login: (credentials = {}) =>
      this.request('/auth/login', {
        method: 'POST',
        body: credentials
      })
  };

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

  /**
   * Get tenants list.
   * @returns {Promise<any>} Tenants payload.
   */
  async getTenants() {
    return this.request('/tenants');
  }

  /**
   * Create tenant.
   * @param {object} payload Tenant payload.
   * @returns {Promise<any>} Created tenant.
   */
  async createTenant(payload) {
    return this.request('/tenants', { method: 'POST', body: payload });
  }

  /**
   * Get schemes list.
   * @returns {Promise<any>} Schemes payload.
   */
  async getSchemes() {
    return this.request('/schemes');
  }

  /**
   * Create scheme.
   * @param {object} payload Scheme payload.
   * @returns {Promise<any>} Created scheme.
   */
  async createScheme(payload) {
    return this.request('/schemes', { method: 'POST', body: payload });
  }

  /**
   * Get documents list.
   * @returns {Promise<any>} Documents payload.
   */
  async getDocuments() {
    return this.request('/document');
  }

  /**
   * Upload documents.
   * @param {File|File[]} files Files to upload.
   * @param {object} options Upload options.
   * @returns {Promise<any>} Upload response.
   */
  async uploadDocuments(files, options = {}) {
    const { schemeId, language = 'en', ocrEngine = 'Tesseract' } = options;
    const payload = Array.isArray(files) ? files : [files];
    if (typeof FormData === 'undefined') {
      throw new Error('File uploads require FormData support.');
    }
    const formData = new FormData();
    payload.forEach((file) => formData.append('files', file));
    const query = new URLSearchParams({
      schemeId: String(schemeId || ''),
      language,
      ocrEngine
    }).toString();
    return this.request(`/document/upload?${query}`, { method: 'POST', body: formData });
  }

  /**
   * Delete document by id.
   * @param {string|number} documentId Document identifier.
   * @returns {Promise<any>} Delete response.
   */
  async deleteDocument(documentId) {
    return this.request(`/document/${documentId}`, { method: 'DELETE' });
  }

  /**
   * Get document content.
   * @param {string|number} documentId Document identifier.
   * @returns {Promise<any>} Document content.
   */
  async getDocumentContent(documentId) {
    return this.request(`/document/${documentId}/content`);
  }

  /**
   * Get annotations for a document.
   * @param {string|number} documentId Document identifier.
   * @returns {Promise<any>} Annotation collection.
   */
  async getAnnotations(documentId) {
    return this.request(`/document/${documentId}/annotations`);
  }

  /**
   * Create annotation for a document.
   * @param {string|number} documentId Document identifier.
   * @param {object} payload Annotation payload.
   * @returns {Promise<any>} Created annotation.
   */
  async createAnnotation(documentId, payload) {
    return this.request(`/document/${documentId}/annotations`, { method: 'POST', body: payload });
  }

  /**
   * Update annotation.
   * @param {string|number} documentId Document identifier.
   * @param {string|number} annotationId Annotation identifier.
   * @param {object} payload Annotation payload.
   * @returns {Promise<any>} Updated annotation.
   */
  async updateAnnotation(documentId, annotationId, payload) {
    return this.request(`/document/${documentId}/annotations/${annotationId}`, {
      method: 'PUT',
      body: payload
    });
  }

  /**
   * Delete annotation.
   * @param {string|number} documentId Document identifier.
   * @param {string|number} annotationId Annotation identifier.
   * @returns {Promise<any>} Delete response.
   */
  async deleteAnnotation(documentId, annotationId) {
    return this.request(`/document/${documentId}/annotations/${annotationId}`, { method: 'DELETE' });
  }

  /**
   * Get AI settings.
   * @returns {Promise<any>} AI settings payload.
   */
  async getAISettings() {
    return this.request('/ai/settings');
  }

  /**
   * Update AI settings.
   * @param {object} payload Settings payload.
   * @returns {Promise<any>} Updated settings.
   */
  async updateAISettings(payload) {
    return this.request('/ai/settings', { method: 'PUT', body: payload });
  }

  /**
   * Test AI settings.
   * @param {object} payload Settings payload.
   * @returns {Promise<any>} Test result.
   */
  async testAISettings(payload) {
    return this.request('/ai/settings/test', { method: 'POST', body: payload });
  }

  /**
   * Get repositories.
   * @returns {Promise<any>} Repository list.
   */
  async getRepositories() {
    return this.request('/repositories');
  }

  /**
   * Create repository.
   * @param {object} payload Repository payload.
   * @returns {Promise<any>} Created repository.
   */
  async createRepository(payload) {
    return this.request('/repositories', { method: 'POST', body: payload });
  }

  /**
   * Test repository connection.
   * @param {object} payload Repository payload.
   * @returns {Promise<any>} Test response.
   */
  async testRepository(payload) {
    return this.request('/repositories/test', { method: 'POST', body: payload });
  }

  /**
   * Get analytics documents data.
   * @returns {Promise<any>} Document analytics.
   */
  async getAnalyticsDocuments() {
    return this.request('/analytics/documents');
  }

  /**
   * Get analytics workflows data.
   * @returns {Promise<any>} Workflow analytics.
   */
  async getAnalyticsWorkflows() {
    return this.request('/analytics/workflows');
  }

  /**
   * Get analytics users data.
   * @returns {Promise<any>} User analytics.
   */
  async getAnalyticsUsers() {
    return this.request('/analytics/users');
  }

  /**
   * Export analytics dataset.
   * @returns {Promise<any>} Export payload.
   */
  async exportAnalytics() {
    return this.request('/analytics/export');
  }

  /**
   * Get workflows.
   * @returns {Promise<any>} Workflow list.
   */
  async getWorkflows() {
    return this.request('/workflow');
  }

  /**
   * Create workflow.
   * @param {object} payload Workflow payload.
   * @returns {Promise<any>} Created workflow.
   */
  async createWorkflow(payload) {
    return this.request('/workflow', { method: 'POST', body: payload });
  }

  /**
   * Publish workflow.
   * @param {string|number} workflowId Workflow identifier.
   * @returns {Promise<any>} Publish response.
   */
  async publishWorkflow(workflowId) {
    return this.request(`/workflow/${workflowId}/publish`, { method: 'POST' });
  }

  /**
   * Get workflow instances.
   * @returns {Promise<any>} Workflow instance list.
   */
  async getWorkflowInstances() {
    return this.request('/workflow/instances');
  }

  /**
   * Start workflow instance.
   * @param {object} payload Instance payload.
   * @returns {Promise<any>} Start response.
   */
  async startWorkflowInstance(payload) {
    return this.request('/workflow/instances', { method: 'POST', body: payload });
  }

  /**
   * Pause workflow instance.
   * @param {string|number} instanceId Instance identifier.
   * @returns {Promise<any>} Pause response.
   */
  async pauseWorkflowInstance(instanceId) {
    return this.request(`/workflow/instances/${instanceId}/pause`, { method: 'POST' });
  }

  /**
   * Resume workflow instance.
   * @param {string|number} instanceId Instance identifier.
   * @returns {Promise<any>} Resume response.
   */
  async resumeWorkflowInstance(instanceId) {
    return this.request(`/workflow/instances/${instanceId}/resume`, { method: 'POST' });
  }

  /**
   * Cancel workflow instance.
   * @param {string|number} instanceId Instance identifier.
   * @returns {Promise<any>} Cancel response.
   */
  async cancelWorkflowInstance(instanceId) {
    return this.request(`/workflow/instances/${instanceId}/cancel`, { method: 'POST' });
  }

  /**
   * Get forms.
   * @returns {Promise<any>} Form list.
   */
  async getForms() {
    return this.request('/forms');
  }

  /**
   * Create form.
   * @param {object} payload Form payload.
   * @returns {Promise<any>} Created form.
   */
  async createForm(payload) {
    return this.request('/forms', { method: 'POST', body: payload });
  }

  /**
   * Publish form.
   * @param {string|number} formId Form identifier.
   * @returns {Promise<any>} Publish response.
   */
  async publishForm(formId) {
    return this.request(`/forms/${formId}/publish`, { method: 'POST' });
  }

  /**
   * Get organization structure.
   * @returns {Promise<any>} Organization structure.
   */
  async getOrgStructure() {
    return this.request('/organization/structure');
  }

  /**
   * Import organization structure.
   * @param {object} payload Structure payload.
   * @returns {Promise<any>} Import response.
   */
  async importOrgStructure(payload) {
    return this.request('/organization/structure/import', { method: 'POST', body: payload });
  }

  /**
   * Get notifications.
   * @returns {Promise<any>} Notifications list.
   */
  async getNotifications() {
    return this.request('/notifications');
  }

  /**
   * Mark notification as read.
   * @param {string|number} notificationId Notification identifier.
   * @returns {Promise<any>} Mark response.
   */
  async markNotificationRead(notificationId) {
    return this.request(`/notifications/${notificationId}/read`, { method: 'POST' });
  }

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
      emitToast(message, 'error');
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

    const tenantId = this.tenantProvider ? this.tenantProvider() : null;
    if (tenantId && !headers['X-Tenant-Id']) {
      headers['X-Tenant-Id'] = tenantId;
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
