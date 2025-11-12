# DocuWave Frontend Overview & Structure

## Overview
- **Application**: DocuWave enterprise content management frontend built with React 18, React Scripts, and Recharts for data visualization, along with Lucide icons for UI decoration.【F:package.json†L1-L29】
- **Purpose**: Provides dashboards, scanning, workflow design, AI configuration, and repository management for multi-tenant document processing.

## Core Composition
1. **Root Entrypoint** – `src/index.js` bootstraps the React app (Create React App conventions).【F:src/index.js†L1-L20】
2. **App Component** – Wraps the application with theming, localization, and organizational context providers before rendering the system shell.【F:src/App.jsx†L1-L31】
3. **DocuWaveSystem** – Central orchestrator that manages tenant selection, tab routing, document/scheme state, and toast notifications. It stitches together the sidebar, feature pages, template library, analytics, and workflow utilities while fetching data via the API service or falling back to mock datasets.【F:src/DocuWaveSystem.jsx†L1-L198】【F:src/DocuWaveSystem.jsx†L198-L238】

## Data & Services
- **Context Providers**: Theming (`ThemeContext.jsx`), localization (`LanguageContext.jsx`), and organizational metadata (`OrgContext.jsx`) are exposed via hooks to maintain global state across the UI.【F:src/contexts/ThemeContext.jsx†L1-L120】【F:src/contexts/LanguageContext.jsx†L1-L200】【F:src/contexts/OrgContext.jsx†L1-L200】
- **Remote Access**: `apiService` consolidates fetch helpers for documents and workflow schemes, including upload and delete operations against a configurable API base URL.【F:src/services/api.js†L1-L42】

## Feature Surfaces
- **Pages**: Dedicated modules deliver the dashboard, scanning interface, workflow designer, Form.io builder, document viewer, AI configuration, repository manager, organization manager, analytics, and execution tracking experiences.【F:src/pages/Dashboard.jsx†L1-L120】【F:src/pages/ScannerUI.jsx†L1-L200】【F:src/pages/WorkflowDesigner.jsx†L1-L200】【F:src/pages/AIConfiguration.jsx†L1-L160】【F:src/pages/Repositories.jsx†L1-L200】【F:src/pages/DocumentViewer.jsx†L1-L160】【F:src/pages/FormioBuilder.jsx†L1-L160】【F:src/pages/OrganizationManager.jsx†L1-L40】
- **Shared Components**: Reusable UI such as the sidebar layout, workflow palette/canvas, analytics dashboard, execution tracker, modal/dialog controls, template library, and user utilities live under `src/components`.【F:src/components/layout/Sidebar.jsx†L1-L200】【F:src/components/workflow/WorkflowCanvas.jsx†L1-L200】【F:src/components/AdvancedAnalyticsDashboard.jsx†L1-L200】【F:src/components/WorkflowExecutionTracker.jsx†L1-L160】【F:src/components/common/Modal.jsx†L1-L160】

## Supporting Utilities
- **Hooks**: `useTranslations` wraps locale resources, while `useKeyboardShortcuts` centralizes hotkey handling.【F:src/hooks/useTranslations.js†L1-L160】【F:src/hooks/useKeyboardShortcuts.js†L1-L200】
- **Constants & Utils**: Workflow constants and helper functions standardize node definitions and transformations.【F:src/constants/workflowConstants.js†L1-L200】【F:src/utils/workflowUtils.js†L1-L200】
- **Styling**: Global Tailwind-inspired utility classes reside in `src/styles/globals.css`.【F:src/styles/globals.css†L1-L200】
- **Localization Assets**: Arabic, English, and French translations are bundled under `src/locales` with an index loader.【F:src/locales/en.json†L1-L200】【F:src/locales/ar.json†L1-L200】【F:src/locales/fr.json†L1-L200】【F:src/locales/index.js†L1-L40】

## Directory Structure
```
docuwave-frontend/
├── package.json
├── public/
├── src/
│   ├── App.jsx
│   ├── DocuWaveSystem.jsx
│   ├── index.js
│   ├── components/
│   │   ├── AdvancedAnalyticsDashboard.jsx
│   │   ├── MobileResponsiveSidebar.jsx
│   │   ├── WorkflowExecutionTracker.jsx
│   │   ├── layout/
│   │   │   └── Sidebar.jsx
│   │   ├── workflow/
│   │   │   ├── WorkflowCanvas.jsx
│   │   │   ├── WorkflowNodePalette.jsx
│   │   │   └── WorkflowProperties.jsx
│   │   └── common/
│   │       ├── BulkActions.jsx
│   │       ├── ConfirmDialog.jsx
│   │       ├── LoadingSkeleton.jsx
│   │       ├── Modal.jsx
│   │       ├── NotificationCenter.jsx
│   │       ├── OrgHierarchySystem.jsx
│   │       ├── StatCard.jsx
│   │       ├── Toast.jsx
│   │       ├── UserManagement.jsx
│   │       └── UserProfile.jsx
│   ├── constants/
│   │   └── workflowConstants.js
│   ├── contexts/
│   │   ├── LanguageContext.jsx
│   │   ├── OrgContext.jsx
│   │   └── ThemeContext.jsx
│   ├── hooks/
│   │   ├── useKeyboardShortcuts.js
│   │   └── useTranslations.js
│   ├── locales/
│   │   ├── ar.json
│   │   ├── en.json
│   │   ├── fr.json
│   │   └── index.js
│   ├── pages/
│   │   ├── AIConfiguration.jsx
│   │   ├── Dashboard.jsx
│   │   ├── DocumentViewer.jsx
│   │   ├── FormioBuilder.jsx
│   │   ├── OrganizationManager.jsx
│   │   ├── Repositories.jsx
│   │   ├── ScannerUI.jsx
│   │   └── WorkflowDesigner.jsx
│   ├── services/
│   │   └── api.js
│   ├── styles/
│   │   └── globals.css
│   └── utils/
│       └── workflowUtils.js
├── public/
│   ├── index.html
│   └── ...
└── README.md
```

## Usage Notes
- Start the development server with `npm start`; build artifacts via `npm run build` (Create React App defaults).【F:package.json†L12-L18】
- Configure backend connectivity by setting `REACT_APP_API_URL`; otherwise, the app uses a localhost HTTPS fallback while DocuWaveSystem gracefully switches to mock data when the API is unreachable.【F:src/services/api.js†L1-L42】【F:src/DocuWaveSystem.jsx†L62-L120】
