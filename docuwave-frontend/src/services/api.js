import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

export const API_BASE_URL = (process.env.REACT_APP_API_URL || 'https://localhost:7095').replace(/\/$/, '');

let authContext = {
  tenantId: null,
  token: null
};

/**
 * Update the current tenant and token used for all API calls.
 * @param {{tenantId?: string|null, token?: string|null}} context
 */
export const setAuthContext = ({ tenantId, token }) => {
  authContext = {
    tenantId: tenantId || null,
    token: token || null
  };
  if (typeof window !== 'undefined' && window.localStorage) {
    if (tenantId) {
      window.localStorage.setItem('docuwave_tenant', tenantId);
    }
    if (token) {
      window.localStorage.setItem('docuwave_token', token);
    }
  }
};

const buildHeaders = (custom = {}, isForm = false) => {
  const headers = { ...custom };
  if (!isForm) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }
  if (authContext.tenantId) {
    headers['X-Tenant-Id'] = authContext.tenantId;
  }
  if (authContext.token) {
    headers.Authorization = `Bearer ${authContext.token}`;
  }
  return headers;
};

const toQueryString = (params = {}) => {
  const search = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.append(key, value);
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : '';
};

const handleResponse = async (response, parseAsBlob = false) => {
  if (!response.ok) {
    let message = response.statusText;
    try {
      const data = await response.json();
      message = data?.message || data?.error || JSON.stringify(data) || message;
    } catch {
      // ignore json parse errors
    }
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(
        new CustomEvent('api-toast', {
          detail: { message, type: 'error' }
        })
      );
    }
    throw new Error(message);
  }

  if (parseAsBlob) {
    return response.blob();
  }
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const request = async (path, { method = 'GET', headers = {}, body, params, parseAsBlob } = {}) => {
  const isForm = body instanceof FormData;
  const url = `${API_BASE_URL}${path}${toQueryString(params)}`;
  const response = await fetch(url, {
    method,
    headers: buildHeaders(headers, isForm),
    body: body && !isForm && typeof body === 'object' ? JSON.stringify(body) : body
  });
  return handleResponse(response, parseAsBlob);
};

const createHubConnection = (path, options = {}) => {
  const connection = new HubConnectionBuilder()
    .withUrl(`${API_BASE_URL}${path}`, {
      ...options,
      accessTokenFactory: () => authContext.token || '',
      headers: {
        ...(options.headers || {}),
        ...(authContext.tenantId ? { 'X-Tenant-Id': authContext.tenantId } : {})
      }
    })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Information)
    .build();
  return connection;
};

const apiService = {
  /** Get tenants */
  async getTenants(params) {
    return request('/api/tenants', { params });
  },
  /** Create tenant */
  async createTenant(payload) {
    return request('/api/tenants', { method: 'POST', body: payload });
  },
  /** Get schemes */
  async getSchemes(params) {
    return request('/api/schemes', { params });
  },
  /** Create scheme */
  async createScheme(payload) {
    return request('/api/schemes', { method: 'POST', body: payload });
  },
  /** Get documents */
  async getDocuments(params) {
    return request('/api/documents', { params });
  },
  /** Upload documents */
  async uploadDocuments({ files = [], schemeId, extra = {} }) {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    if (schemeId) {
      formData.append('schemeId', schemeId);
    }
    Object.entries(extra || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    return request('/api/documents/upload', { method: 'POST', body: formData });
  },
  /** Delete document */
  async deleteDocument(id) {
    return request(`/api/documents/${id}`, { method: 'DELETE' });
  },
  /** Bulk document action */
  async bulkDocumentAction(payload) {
    return request('/api/documents/bulk', { method: 'POST', body: payload });
  },
  /** Get document */
  async getDocument(id) {
    return request(`/api/documents/${id}`);
  },
  /** Get document content */
  async getDocumentContent(id, rendition) {
    return request(`/api/documents/${id}/content`, {
      params: rendition ? { rendition } : undefined,
      parseAsBlob: true
    });
  },
  /** Get annotations */
  async getAnnotations(documentId) {
    return request(`/api/documents/${documentId}/annotations`);
  },
  /** Create annotation */
  async createAnnotation(documentId, payload) {
    return request(`/api/documents/${documentId}/annotations`, { method: 'POST', body: payload });
  },
  /** Update annotation */
  async updateAnnotation(documentId, annotationId, payload) {
    return request(`/api/documents/${documentId}/annotations/${annotationId}`, {
      method: 'PUT',
      body: payload
    });
  },
  /** Delete annotation */
  async deleteAnnotation(documentId, annotationId) {
    return request(`/api/documents/${documentId}/annotations/${annotationId}`, { method: 'DELETE' });
  },
  /** Get AI settings */
  async getAISettings() {
    return request('/api/ai/settings');
  },
  /** Update AI settings */
  async updateAISettings(payload) {
    return request('/api/ai/settings', { method: 'PUT', body: payload });
  },
  /** Test AI settings */
  async testAISettings() {
    return request('/api/ai/settings/test', { method: 'POST' });
  },
  /** Get repositories */
  async getRepositories(params) {
    return request('/api/repositories', { params });
  },
  /** Create repository */
  async createRepository(payload) {
    return request('/api/repositories', { method: 'POST', body: payload });
  },
  /** Test repository */
  async testRepository(id) {
    return request(`/api/repositories/${id}/test`, { method: 'POST' });
  },
  /** Get repository jobs */
  async getRepositoryJobs(params) {
    return request('/api/repositories/jobs', { params });
  },
  /** Get analytics documents */
  async getAnalyticsDocuments(params) {
    return request('/api/analytics/documents', { params });
  },
  /** Get analytics workflows */
  async getAnalyticsWorkflows(params) {
    return request('/api/analytics/workflows', { params });
  },
  /** Get analytics users */
  async getAnalyticsUsers(params) {
    return request('/api/analytics/users', { params });
  },
  /** Export analytics */
  async exportAnalytics(payload) {
    return request('/api/analytics/export', { method: 'POST', body: payload });
  },
  /** Get workflow templates */
  async getWorkflowTemplates(params) {
    return request('/api/workflow/templates', { params });
  },
  /** Import workflow template */
  async importWorkflowTemplate(payload) {
    return request('/api/workflow/templates/import', { method: 'POST', body: payload });
  },
  /** Get workflow definitions */
  async getWorkflowDefinitions(params) {
    return request('/api/workflow/definitions', { params });
  },
  /** Create workflow definition */
  async createWorkflowDefinition(payload) {
    return request('/api/workflow/definitions', { method: 'POST', body: payload });
  },
  /** Publish workflow definition */
  async publishWorkflowDefinition(id) {
    return request(`/api/workflow/definitions/${id}/publish`, { method: 'POST' });
  },
  /** Get workflow instances */
  async getWorkflowInstances(params) {
    return request('/api/workflow/instances', { params });
  },
  /** Start workflow instance */
  async startWorkflowInstance(payload) {
    return request('/api/workflow/instances', { method: 'POST', body: payload });
  },
  /** Pause workflow instance */
  async pauseWorkflowInstance(id) {
    return request(`/api/workflow/instances/${id}:pause`, { method: 'POST' });
  },
  /** Resume workflow instance */
  async resumeWorkflowInstance(id) {
    return request(`/api/workflow/instances/${id}:resume`, { method: 'POST' });
  },
  /** Reassign workflow instance */
  async reassignWorkflowInstance(id, payload) {
    return request(`/api/workflow/instances/${id}:reassign`, { method: 'POST', body: payload });
  },
  /** Cancel workflow instance */
  async cancelWorkflowInstance(id) {
    return request(`/api/workflow/instances/${id}:cancel`, { method: 'POST' });
  },
  /** Get forms */
  async getForms(params) {
    return request('/api/forms', { params });
  },
  /** Create form */
  async createForm(payload) {
    return request('/api/forms', { method: 'POST', body: payload });
  },
  /** Publish form */
  async publishForm(id) {
    return request(`/api/forms/${id}/publish`, { method: 'POST' });
  },
  /** Get org structure */
  async getOrgStructure() {
    return request('/api/org/structure');
  },
  /** Import org structure */
  async importOrgStructure(formData) {
    return request('/api/org/structure/import', { method: 'POST', body: formData });
  },
  /** Get notifications */
  async getNotifications(params) {
    return request('/api/notifications', { params });
  },
  /** Mark notification read */
  async markNotificationRead(id) {
    return request(`/api/notifications/${id}/read`, { method: 'POST' });
  },
  /** Create SignalR hub connection */
  createHubConnection
};

export default apiService;
