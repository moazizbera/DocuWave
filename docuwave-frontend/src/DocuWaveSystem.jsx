import React, { useState, useEffect, useRef } from 'react';
import { FileText, Workflow, ScanLine, Eye, Upload, Save, Play, Settings, Database, Cloud, CheckCircle, XCircle, AlertCircle, Download, Edit3, Trash2, Plus, Grid, Search, X, RefreshCw } from 'lucide-react';
import { useLanguage } from './contexts/LanguageContext';
import { useTranslations } from './hooks/useTranslations';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import WorkflowDesigner from './pages/WorkflowDesigner';
import FormioBuilder from './pages/FormioBuilder';
import DocumentViewer from './pages/DocumentViewer';
import ScannerUI from './pages/ScannerUI';
import AIConfiguration from './pages/AIConfiguration';
import Repositories from './pages/Repositories';
import Toast from './components/common/Toast';
import Modal from './components/common/Modal';
import ConfirmDialog from './components/common/ConfirmDialog';
import { apiService } from './services/api';
import  WorkflowTemplateLibrary from './components/common/WorkflowTemplateLibrary';

function DocuWaveSystem() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedTenant, setSelectedTenant] = useState('tenant_001');
  const [documents, setDocuments] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const tenants = [
    { id: 'tenant_001', name: 'Acme Corp', aiMode: 'cloud' },
    { id: 'tenant_002', name: 'Global Industries', aiMode: 'local' },
    { id: 'tenant_003', name: 'Tech Solutions', aiMode: 'cloud' }
  ];

  const mockDocuments = [
    { id: 1, name: 'Invoice_12345.pdf', fileName: 'Invoice_12345.pdf', type: 'invoice', scheme: 'Invoice', status: 'processed', date: '2025-10-04', uploadedAt: '2025-10-04T10:00:00' },
    { id: 2, name: 'Contract_ABC.docx', fileName: 'Contract_ABC.docx', type: 'contract', scheme: 'Contract', status: 'pending', date: '2025-10-03', uploadedAt: '2025-10-03T10:00:00' },
    { id: 3, name: 'Receipt_789.jpg', fileName: 'Receipt_789.jpg', type: 'receipt', scheme: 'Receipt', status: 'processing', date: '2025-10-04', uploadedAt: '2025-10-04T10:00:00' }
  ];

  const mockSchemes = [
    { id: '1', name: 'Invoice' },
    { id: '2', name: 'Contract' },
    { id: '3', name: 'Receipt' }
  ];

  const showToast = (message, type) => setToast({ message, type });

  const loadData = async () => {
    setLoading(true);
    
    try {
      const schemesData = await apiService.getSchemes();
      if (schemesData) {
        setSchemes(schemesData);
        const docsData = await apiService.getDocuments();
        setDocuments(docsData || mockDocuments);
      } else {
        throw new Error('API not available');
      }
    } catch (error) {
      setSchemes(mockSchemes);
      setDocuments(mockDocuments);
      showToast('Using demo mode', 'warning');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        selectedTenant={selectedTenant}
        onTenantChange={setSelectedTenant}
        tenants={tenants}
      />

      <div className="flex-1 overflow-auto">
        {activeTab === 'dashboard' && (
          <Dashboard 
            documents={documents}
            tenant={tenants.find(t => t.id === selectedTenant)}
            setDocuments={setDocuments}
            showToast={showToast}
            schemes={schemes}
            loading={loading}
            onRefresh={loadData}
          />
        )}
        {activeTab === 'workflow' && <WorkflowDesigner showToast={showToast} />}
        {activeTab === 'workflow-templates' && <WorkflowTemplateLibrary showToast={showToast} />}
        {activeTab === 'formio' && <FormioBuilder showToast={showToast} />}
        {activeTab === 'viewer' && <DocumentViewer showToast={showToast} />}
        {activeTab === 'scanner' && (
          <ScannerUI 
            setDocuments={setDocuments}
            showToast={showToast}
            schemes={schemes}
            onRefresh={loadData}
          />
        )}
        {activeTab === 'ai-config' && (
          <AIConfiguration 
            tenant={tenants.find(t => t.id === selectedTenant)}
            showToast={showToast}
          />
        )}
        {activeTab === 'repositories' && <Repositories showToast={showToast} />}
        
      </div>

      {toast && (
        <Toast 
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default DocuWaveSystem;