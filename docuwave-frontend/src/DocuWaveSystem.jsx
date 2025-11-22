import React, { useCallback, useEffect, useMemo, useState } from 'react';
import WorkflowExecutionTracker from './components/WorkflowExecutionTracker';
import AdvancedAnalyticsDashboard from './components/AdvancedAnalyticsDashboard';
import { useOrg } from './contexts/OrgContext';
import { useLanguage } from './contexts/LanguageContext';
import { useTheme } from './contexts/ThemeContext';
import Dashboard from './pages/Dashboard';
import ScannerUI from './pages/ScannerUI';
import WorkflowDesigner from './pages/WorkflowDesigner';
import FormioBuilder from './pages/FormioBuilder';
import DocumentViewer from './pages/DocumentViewer';
import AIConfiguration from './pages/AIConfiguration';
import Repositories from './pages/Repositories';
import Sidebar from './components/layout/Sidebar';
import Toast from './components/common/Toast';
import OrgHierarchySystem from './components/common/OrgHierarchySystem';
import WorkflowTemplateLibrary from './components/common/WorkflowTemplateLibrary';
import NotificationCenter from './components/common/NotificationCenter';
import OrganizationManager from './pages/OrganizationManager';
import apiService, { setAuthContext } from './services/api';

function DocuWaveSystem() {
  const { orgStructure } = useOrg();
  const { language, setLanguage, isRTL } = useLanguage();
  const { theme, toggleTheme, isDark } = useTheme();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [toast, setToast] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = useMemo(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem('docuwave_token');
    }
    return null;
  }, []);

  const showToast = useCallback((message, type) => {
    setToast({ message, type });
  }, []);

  const loadTenantData = useCallback(async () => {
    if (!selectedTenant) return;
    setLoading(true);
    try {
      const [schemesData, docsData] = await Promise.all([
        apiService.getSchemes(),
        apiService.getDocuments()
      ]);
      setSchemes(Array.isArray(schemesData) ? schemesData : []);
      setDocuments(Array.isArray(docsData) ? docsData : []);
    } catch (error) {
      showToast('Unable to load data from API', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedTenant, showToast]);

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const data = await apiService.getTenants();
        if (Array.isArray(data) && data.length > 0) {
          setTenants(data);
          const stored = typeof window !== 'undefined'
            ? window.localStorage.getItem('docuwave_tenant')
            : null;
          const initial = data.find((t) => t.id === stored) || data[0];
          setSelectedTenant(initial);
        }
      } catch (error) {
        showToast('Failed to load tenants', 'error');
      }
    };
    fetchTenants();
  }, [showToast]);

  useEffect(() => {
    if (selectedTenant) {
      setAuthContext({ tenantId: selectedTenant.id, token });
      loadTenantData();
    }
  }, [selectedTenant, token, loadTenantData]);

  useEffect(() => {
    const toastHandler = (event) => {
      if (event?.detail) {
        setToast(event.detail);
      }
    };
    window.addEventListener('api-toast', toastHandler);
    return () => window.removeEventListener('api-toast', toastHandler);
  }, []);

  useEffect(() => {
    console.log('🌍 Current Language:', language, '| RTL:', isRTL);
    console.log('🎨 Current Theme:', theme, '| Dark:', isDark);
    console.log('🏢 Org Structure loaded:', !!orgStructure);
  }, [language, isRTL, theme, isDark, orgStructure]);

  const currentTenant = selectedTenant;

  return (
    <div className={`flex h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        selectedTenant={currentTenant?.id || ''}
        onTenantChange={(tenantId) => {
          const tenant = tenants.find((t) => t.id === tenantId);
          setSelectedTenant(tenant || null);
        }}
        tenants={tenants}
        language={language}
        setLanguage={setLanguage}
        theme={theme}
        toggleTheme={toggleTheme}
        showToast={showToast}
      />

      <div className="flex-1 overflow-auto">
        <div className="flex justify-end p-4">
          <NotificationCenter showToast={showToast} />
        </div>

        {activeTab === 'dashboard' && (
          <Dashboard
            documents={documents}
            tenant={currentTenant}
            setDocuments={setDocuments}
            showToast={showToast}
            schemes={schemes}
            loading={loading}
            onRefresh={loadTenantData}
          />
        )}

        {activeTab === 'scanner' && (
          <ScannerUI
            setDocuments={setDocuments}
            showToast={showToast}
            schemes={schemes}
            onUploadComplete={loadTenantData}
            selectedTenant={currentTenant}
          />
        )}

        {activeTab === 'workflow-templates' && (
          <WorkflowTemplateLibrary
            showToast={showToast}
            onSelectTemplate={(template) => {
              setActiveTab('workflow');
              showToast(`Template loaded: ${template.nameEn}`, 'success');
            }}
          />
        )}

        {activeTab === 'workflow' && <WorkflowDesigner showToast={showToast} />}

        {activeTab === 'formio' && <FormioBuilder showToast={showToast} />}

        {activeTab === 'viewer' && <DocumentViewer showToast={showToast} />}

        {activeTab === 'ai-config' && (
          <AIConfiguration tenant={currentTenant} showToast={showToast} />
        )}

        {activeTab === 'repositories' && <Repositories showToast={showToast} />}

        {activeTab === 'org-hierarchy' && <OrgHierarchySystem showToast={showToast} />}

        {activeTab === 'workflow-tracker' && <WorkflowExecutionTracker showToast={showToast} />}

        {activeTab === 'analytics' && <AdvancedAnalyticsDashboard showToast={showToast} />}

        {activeTab === 'organization-manager' && (
          <OrganizationManager showToast={showToast} onRefresh={loadTenantData} />
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export default DocuWaveSystem;
