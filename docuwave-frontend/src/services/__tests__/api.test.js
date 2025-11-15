import { APIError, APIService } from '../api';

const createFetchResponse = ({
  ok = true,
  status = 200,
  statusText = 'OK',
  body = '',
  headers = {}
} = {}) => ({
  ok,
  status,
  statusText,
  headers,
  text: jest.fn().mockResolvedValue(body)
});

describe('APIService', () => {
  let fetchMock;
  let service;

  beforeEach(() => {
    fetchMock = jest.fn();
    service = new APIService({
      baseURL: 'https://api.example.com',
      tokenProvider: () => 'test-token',
      fetchImpl: fetchMock
    });
  });

  it('injects authorization and default headers', async () => {
    fetchMock.mockResolvedValue(
      createFetchResponse({ body: JSON.stringify({ items: [] }) })
    );

    await service.request('/documents');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/documents',
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: 'application/json',
          Authorization: 'Bearer test-token'
        })
      })
    );
  });

  it('parses JSON responses', async () => {
    const payload = { message: 'success' };
    fetchMock.mockResolvedValue(
      createFetchResponse({ body: JSON.stringify(payload) })
    );

    const response = await service.request('/status');

    expect(response).toEqual(payload);
  });

  it('throws APIError with response details for failed requests', async () => {
    const errorPayload = { message: 'Invalid request', details: { field: 'name' } };
    fetchMock.mockResolvedValue(
      createFetchResponse({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        body: JSON.stringify(errorPayload)
      })
    );

    const requestPromise = service.request('/status');

    await expect(requestPromise).rejects.toBeInstanceOf(APIError);
    await expect(requestPromise).rejects.toEqual(
      expect.objectContaining({
        name: 'APIError',
        message: errorPayload.message,
        status: 400,
        body: errorPayload
      })
    );
  });

  it('exposes helper for document listing', async () => {
    fetchMock.mockResolvedValue(
      createFetchResponse({ body: JSON.stringify([{ id: '123' }]) })
    );

    const documents = await service.documents.list();

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/document',
      expect.any(Object)
    );
    expect(documents).toEqual([{ id: '123' }]);
  });
});
