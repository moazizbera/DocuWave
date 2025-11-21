# DocuWave Feature Parity Review

This report compares the implemented frontend modules with the available backend APIs and highlights missing integrations or unimplemented features.

## Document ingestion & management
- **Backend**: `/api/document(s)` supports querying with filters, uploads with scheme selection, bulk jobs, content retrieval, and annotations CRUD. 【F:docuwave-backend/src/DocuWave.Api/Controllers/DocumentsController.cs†L10-L100】
- **Frontend**: `DocuWaveSystem` uses hardcoded document lists and schemes and calls `apiService.getSchemes/getDocuments`, which are not implemented in the API client. 【F:docuwave-frontend/src/DocuWaveSystem.jsx†L52-L132】【F:docuwave-frontend/src/services/api.js†L50-L109】
- **Gap**: No wiring from the UI to the backend document endpoints or schemes API; annotations/download flows are absent on the frontend.

## Schemes (document types)
- **Backend**: `SchemesController` exposes list and create operations at `/api/schemes`. 【F:docuwave-backend/src/DocuWave.Api/Controllers/SchemesController.cs†L8-L30】
- **Frontend**: Schemes are mocked locally inside `DocuWaveSystem` and never loaded from the API client. 【F:docuwave-frontend/src/DocuWaveSystem.jsx†L97-L137】
- **Gap**: Missing service methods and UI flows to list/create schemes from the backend.

## AI configuration
- **Backend**: `/api/ai/settings` supports reading, updating, and testing AI settings. 【F:docuwave-backend/src/DocuWave.Api/Controllers/AiSettingsController.cs†L7-L31】
- **Frontend**: `AIConfiguration` renders static radio buttons and a toast without persisting changes. 【F:docuwave-frontend/src/pages/AIConfiguration.jsx†L5-L40】
- **Gap**: No calls to fetch, update, or test AI settings via the backend.

## Analytics
- **Backend**: `/api/analytics` exposes document, workflow, and user analytics plus export. 【F:docuwave-backend/src/DocuWave.Api/Controllers/AnalyticsController.cs†L7-L33】
- **Frontend**: `AdvancedAnalyticsDashboard` visualizes only mock datasets with no API integration. 【F:docuwave-frontend/src/components/AdvancedAnalyticsDashboard.jsx†L13-L80】
- **Gap**: Analytics views do not consume backend metrics or support export parameters.

## Repositories (external DMS)
- **Backend**: `/api/repositories` provides CRUD and connection testing for repositories. 【F:docuwave-backend/src/DocuWave.Api/Controllers/RepositoriesController.cs†L8-L34】
- **Frontend**: `Repositories` page shows a fixed “IBM FileNet” card and a dummy “test connection” toast. 【F:docuwave-frontend/src/pages/Repositories.jsx†L5-L27】
- **Gap**: No repository listing/creation UI or connectivity tests wired to the backend.

## Multi-tenancy
- **Backend**: `TenantsController` offers search, create, read, and update operations. 【F:docuwave-backend/src/DocuWave.Api/Controllers/TenantsController.cs†L8-L39】
- **Frontend**: Tenants are hardcoded inside `DocuWaveSystem` and unrelated to backend data. 【F:docuwave-frontend/src/DocuWaveSystem.jsx†L56-L61】【F:docuwave-frontend/src/DocuWaveSystem.jsx†L150-L168】
- **Gap**: No tenant selection, creation, or update flows tied to backend tenant APIs.

## Workflow & forms
- **Backend**: Workflow definitions/instances, forms, templates, notifications, and org structure endpoints exist (e.g., `/api/workflow/definitions`, `/api/workflow/instances`, `/api/forms`, `/api/org/structure`). 【F:docuwave-backend/src/DocuWave.Api/Controllers/WorkflowDefinitionsController.cs†L8-L31】【F:docuwave-backend/src/DocuWave.Api/Controllers/WorkflowInstancesController.cs†L8-L35】【F:docuwave-backend/src/DocuWave.Api/Controllers/FormsController.cs†L8-L31】【F:docuwave-backend/src/DocuWave.Api/Controllers/OrgStructureController.cs†L8-L21】
- **Frontend**: Workflow designer, tracker, Form.io builder, and org hierarchy components operate entirely on client-side mock data without API calls. 【F:docuwave-frontend/src/pages/WorkflowDesigner.jsx†L31-L120】【F:docuwave-frontend/src/DocuWaveSystem.jsx†L183-L207】
- **Gap**: Missing CRUD/fetch actions for workflows, forms, org imports, and template publishing against backend services.

## API client coverage
- The shared `apiService` only exposes auth, documents, workflows, organization, and limited analytics calls; it lacks methods for schemes, AI settings, repositories, tenants, forms, workflow definitions/instances, notifications, and org structure. 【F:docuwave-frontend/src/services/api.js†L50-L109】
- Components directly call nonexistent helpers like `apiService.getSchemes/getDocuments`, causing runtime failures if the backend is invoked. 【F:docuwave-frontend/src/DocuWaveSystem.jsx†L109-L126】

## Conclusion
Most frontend features are UI-only demos backed by mock data, while the backend offers rich domain APIs (documents, schemes, AI settings, analytics, repositories, tenants, workflows, forms, org structure). Bridging these gaps requires expanding `apiService` to cover available endpoints and replacing mock state in feature pages with real fetch/create/update/delete flows.
