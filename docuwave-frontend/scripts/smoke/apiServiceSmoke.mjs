import { createServer } from 'node:http';
import { APIService } from '../../src/services/api.js';

const server = createServer((req, res) => {
  if (!req.url || !req.method) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Bad Request' }));
    return;
  }

  if (req.url === '/api/document' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify([{ id: 'demo-doc', name: 'Demo Document' }]));
    return;
  }

  if (req.url === '/api/analytics/overview' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({ documentsProcessed: 12, workflowsActive: 3, storageUsedMb: 512 })
    );
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Not Found' }));
});

server.listen(0, async () => {
  const { port } = server.address();
  const baseURL = `http://127.0.0.1:${port}/api`;

  const service = new APIService({
    baseURL,
    tokenProvider: () => 'smoke-token'
  });

  try {
    const documents = await service.documents.list();
    const analytics = await service.analytics.overview();

    console.log('[Smoke] Documents response:', documents);
    console.log('[Smoke] Analytics overview:', analytics);
  } catch (error) {
    console.error('[Smoke] APIService error:', error);
    process.exitCode = 1;
  } finally {
    server.close();
  }
});
