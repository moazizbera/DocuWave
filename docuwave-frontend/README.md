# DocuWave Frontend

Enterprise Content Management Platform - React Frontend

## Prerequisites
- Node.js 16+
- npm or yarn
- DocuWave Backend API running on https://localhost:7095

## Quick Start

### Install Dependencies
```bash
npm install
```

### Start Development Server
```bash
npm start
```

Application will open at: http://localhost:3000

### Build for Production
```bash
npm run build
```

## Project Structure
```
docuwave-frontend/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/          # Page components
│   ├── contexts/       # React contexts
│   ├── hooks/          # Custom hooks
│   ├── services/       # API services
│   ├── locales/        # Translation files
│   ├── utils/          # Utility functions
│   └── styles/         # CSS files
└── public/             # Static assets
```

## Features
- ✅ Multi-language support (EN/AR/FR) with RTL
- ✅ Multi-tenant architecture
- ✅ AI-powered document processing
- ✅ OCR integration
- ✅ Workflow designer
- ✅ Form.io builder
- ✅ Document viewer with annotations
- ✅ Scanner with drag & drop

## Backend Integration
This frontend connects to DocuWave Backend API.
Configure API URL in `.env` file.

## Available Scripts
- `npm start` - Start development server
- `npm build` - Create production build
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App (irreversible!)

## Environment Variables
See `.env.example` for required environment variables.

## License
Proprietary - All rights reserved