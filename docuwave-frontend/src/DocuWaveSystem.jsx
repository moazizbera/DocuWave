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
import UserManagement from './components/common/UserManagement';

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
  const [selectedTenant, setSelectedTenant] = useState('tenant_001');
  const [toast, setToast] = useState(null);
  
  // Data state
  const [documents, setDocuments] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock tenants data (will come from backend later)
  const tenants = [
    { id: 'tenant_001', name: 'Acme Corp', aiMode: 'cloud' },
    { id: 'tenant_002', name: 'Global Industries', aiMode: 'local' },
    { id: 'tenant_003', name: 'Tech Solutions', aiMode: 'cloud' }
  ];

  // Mock documents data (will come from backend later)
  const mockDocuments = [
    { 
      id: 1, 
      name: 'Invoice_12345.pdf', 
      fileName: 'Invoice_12345.pdf', 
      type: 'invoice', 
      scheme: 'Invoice', 
      status: 'processed', 
      date: '2025-10-04', 
      uploadedAt: '2025-10-04T10:00:00' 
    },
    { 
      id: 2, 
      name: 'Contract_ABC.docx', 
      fileName: 'Contract_ABC.docx', 
      type: 'contract', 
      scheme: 'Contract', 
      status: 'pending', 
      date: '2025-10-03', 
      uploadedAt: '2025-10-03T10:00:00' 
    },
    { 
      id: 3, 
      name: 'Receipt_789.jpg', 
      fileName: 'Receipt_789.jpg', 
      type: 'receipt', 
      scheme: 'Receipt', 
      status: 'processing', 
      date: '2025-10-04', 
      uploadedAt: '2025-10-04T10:00:00' 
    }
  ];

  // Mock schemes data (will come from backend later)
  const mockSchemes = [
    { id: '1', name: 'Invoice' },
    { id: '2', name: 'Contract' },
    { id: '3', name: 'Receipt' }
  ];

  // Toast notification helper
  const showToast = (message, type) => {
    setToast({ message, type });
  };

  // Load data from API (or mock data)
  const loadData = async () => {
    setLoading(true);
    
    try {
      // Try to get schemes from API
      const schemesData = await apiService.getSchemes();
      
      if (schemesData) {
        setSchemes(schemesData);
        
        // Try to get documents from API
        const docsData = await apiService.getDocuments();
        setDocuments(docsData || mockDocuments);
      } else {
        throw new Error('API not available');
      }
    } catch (error) {
      console.warn('📡 API not available, using mock data:', error.message);
      
      // Use mock data
      setSchemes(mockSchemes);
      setDocuments(mockDocuments);
      
      showToast('Using demo mode', 'warning');
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Log context values for debugging
  useEffect(() => {
    console.log('🌍 Current Language:', language, '| RTL:', isRTL);
    console.log('🎨 Current Theme:', theme, '| Dark:', isDark);
  }, [language, theme, isRTL, isDark]);

  // Get current tenant
  const currentTenant = tenants.find(t => t.id === selectedTenant);

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
        {activeTab === 'users' && (
          <UserManagement 
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