import React, { useState, useEffect } from 'react';
import WorkflowExecutionTracker from './components/WorkflowExecutionTracker';
import AdvancedAnalyticsDashboard from './components/AdvancedAnalyticsDashboard';

// ✅ IMPORT CONTEXTS (PROPERLY USE THEM)
import { useOrg } from './contexts/OrgContext';
import { useLanguage } from './contexts/LanguageContext';
import { useTheme } from './contexts/ThemeContext';

// ✅ IMPORT PAGES
import Dashboard from './pages/Dashboard';
import ScannerUI from './pages/ScannerUI';
import WorkflowDesigner from './pages/WorkflowDesigner';
import FormioBuilder from './pages/FormioBuilder';
import DocumentViewer from './pages/DocumentViewer';
import AIConfiguration from './pages/AIConfiguration';
import Repositories from './pages/Repositories';

// ✅ IMPORT COMPONENTS
import Sidebar from './components/layout/Sidebar';
import Toast from './components/common/Toast';
import OrgHierarchySystem from './components/common/OrgHierarchySystem';
import WorkflowTemplateLibrary from './components/common/WorkflowTemplateLibrary';

// ✅ IMPORT SERVICES
import { apiService } from './services/api';

/**
 * 🏢 DOCUWAVE SYSTEM - MAIN APPLICATION
 * ======================================
 * Central application component that:
 * - Manages application state (documents, schemes, current tab)
 * - Handles tenant selection
 * - Routes between different modules
 * - Provides toast notifications
 * - Uses ALL contexts properly (Org, Language, Theme)
 * 
 * @component
 */
function DocuWaveSystem() {
  // ✅ USE ALL CONTEXTS PROPERLY
  const { orgStructure, routingEngine } = useOrg();
  const { language, setLanguage, isRTL } = useLanguage();
  const { theme, toggleTheme, isDark } = useTheme();

  // Application state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedTenant, setSelectedTenant] = useState('');
  const [toast, setToast] = useState(null);

  // Data state
  const [documents, setDocuments] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Toast notification helper
  const showToast = (message, type) => {
    setToast({ message, type });
  };

  // Load data from API (or mock data)
  const loadData = async () => {
    if (!selectedTenant) {
      return;
    }

    setLoading(true);

    try {
      window.localStorage.setItem('docuwave_tenant', selectedTenant);
      const schemesData = await apiService.getSchemes();
      setSchemes(Array.isArray(schemesData) ? schemesData : []);
      const docsData = await apiService.getDocuments();
      setDocuments(Array.isArray(docsData) ? docsData : []);
    } catch (error) {
      console.warn('Unable to load data', error);
      showToast('Unable to load data from API', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const tenantResponse = await apiService.getTenants();
        if (Array.isArray(tenantResponse)) {
          setTenants(tenantResponse);
          const initialTenant =
            window.localStorage.getItem('docuwave_tenant') || tenantResponse[0]?.id || '';
          setSelectedTenant(initialTenant);
        }
      } catch (error) {
        console.error('Failed to load tenants', error);
        showToast('Failed to load tenants', 'error');
      }
    };

    fetchTenants();
  }, []);

  useEffect(() => {
    loadData();
  }, [selectedTenant]);

  useEffect(() => {
    const toastHandler = (event) => {
      if (event?.detail) {
        setToast(event.detail);
      }
    };

    window.addEventListener('api-toast', toastHandler);
    return () => window.removeEventListener('api-toast', toastHandler);
  }, []);

  // Log context values for debugging
  useEffect(() => {
    console.log('🌍 Current Language:', language, '| RTL:', isRTL);
    console.log('🎨 Current Theme:', theme, '| Dark:', isDark);
  }, [language, theme, isRTL, isDark]);

  // Get current tenant
  const currentTenant = tenants.find((t) => t.id === selectedTenant);

  return (
    <div className={`flex h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        selectedTenant={selectedTenant}
        onTenantChange={setSelectedTenant}
        tenants={tenants}
        language={language}
        setLanguage={setLanguage}
        theme={theme}
        toggleTheme={toggleTheme}
        showToast={showToast}
      />

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'dashboard' && (
          <Dashboard 
            documents={documents}
            tenant={currentTenant}
            setDocuments={setDocuments}
            showToast={showToast}
            schemes={schemes}
            loading={loading}
            onRefresh={loadData}
          />
        )}

        {activeTab === 'scanner' && (
          <ScannerUI 
            setDocuments={setDocuments}
            showToast={showToast}
            schemes={schemes}
            onRefresh={loadData}
          />
        )}

        {activeTab === 'workflow-templates' && (
          <WorkflowTemplateLibrary 
            showToast={showToast}
            onSelectTemplate={(template) => {
              // When template selected, switch to workflow designer
              setActiveTab('workflow');
              showToast(`Template loaded: ${template.nameEn}`, 'success');
            }}
          />
        )}

        {activeTab === 'workflow' && (
          <WorkflowDesigner 
            showToast={showToast}
            // Org structure is available via useOrg() hook inside WorkflowDesigner
          />
        )}

        {activeTab === 'formio' && (
          <FormioBuilder 
            showToast={showToast}
          />
        )}

        {activeTab === 'viewer' && (
          <DocumentViewer 
            showToast={showToast}
          />
        )}

        {activeTab === 'ai-config' && (
          <AIConfiguration 
            tenant={currentTenant}
            showToast={showToast}
          />
        )}

        {activeTab === 'repositories' && (
          <Repositories 
            showToast={showToast}
          />
        )}

        {activeTab === 'org-hierarchy' && (
          <OrgHierarchySystem 
            showToast={showToast}
          />
        )}

        {activeTab === 'workflow-tracker' && (
          <WorkflowExecutionTracker showToast={showToast} />
        )}

        {activeTab === 'analytics' && (
          <AdvancedAnalyticsDashboard showToast={showToast} />
        )}
      </div>

      {/* Toast Notifications */}
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