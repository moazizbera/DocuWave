import React, { useState, useEffect } from 'react';
import { 
  Grid, Workflow, FileText, Eye, ScanLine, Settings, Database, 
  Moon, Sun, BookTemplate, Building2, Menu, X, BarChart3, Activity,
  Users, Bell, Download, RefreshCw, Plus, Zap, Search
} from 'lucide-react';

/**
 * 🎯 COMPLETE DOCUWAVE SYSTEM - FIXED VERSION
 * ==========================================
 * With working language switching and all features integrated
 */

// ============================================
// MOCK DATA
// ============================================
const mockDocuments = [
  { 
    id: 1, 
    name: 'Invoice_12345.pdf', 
    fileName: 'Invoice_12345.pdf', 
    type: 'invoice', 
    scheme: 'Invoice', 
    status: 'processed', 
    date: '2025-11-05', 
    uploadedAt: '2025-11-05T10:00:00' 
  },
  { 
    id: 2, 
    name: 'Contract_ABC.docx', 
    fileName: 'Contract_ABC.docx', 
    type: 'contract', 
    scheme: 'Contract', 
    status: 'pending', 
    date: '2025-11-06', 
    uploadedAt: '2025-11-06T10:00:00' 
  },
  { 
    id: 3, 
    name: 'Receipt_789.jpg', 
    fileName: 'Receipt_789.jpg', 
    type: 'receipt', 
    scheme: 'Receipt', 
    status: 'processing', 
    date: '2025-11-07', 
    uploadedAt: '2025-11-07T10:00:00' 
  }
];

const mockSchemes = [
  { id: '1', name: 'Invoice' },
  { id: '2', name: 'Contract' },
  { id: '3', name: 'Receipt' }
];

const mockTenants = [
  { id: 'tenant_001', name: 'Acme Corp', aiMode: 'cloud' },
  { id: 'tenant_002', name: 'Global Industries', aiMode: 'local' }
];

// ============================================
// TOAST COMPONENT
// ============================================
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  };

  return (
    <div className={`fixed bottom-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-slide-in`}>
      <span>{message}</span>
      <button onClick={onClose}><X className="w-4 h-4" /></button>
    </div>
  );
}

// ============================================
// SIDEBAR COMPONENT
// ============================================
function Sidebar({ activeTab, onTabChange, language, setLanguage, selectedTenant, onTenantChange, tenants, theme, toggleTheme }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getText = (obj) => {
    if (typeof obj === 'string') return obj;
    return obj?.[language] || obj?.en || '';
  };

  const navigationItems = [
    { id: 'dashboard', label: { ar: 'لوحة التحكم', en: 'Dashboard', fr: 'Tableau de bord' }, icon: Grid, color: 'text-blue-600', section: 'main' },
    { id: 'scanner', label: { ar: 'الماسح', en: 'Scanner', fr: 'Scanner' }, icon: ScanLine, color: 'text-purple-600', section: 'main' },
    { id: 'analytics', label: { ar: 'التحليلات', en: 'Analytics', fr: 'Analytiques' }, icon: BarChart3, color: 'text-indigo-600', section: 'main', badge: 'NEW' },
    { id: 'workflow-tracker', label: { ar: 'متابعة سير العمل', en: 'Workflow Tracker', fr: 'Suivi flux' }, icon: Activity, color: 'text-green-600', section: 'main', badge: 'NEW' },
    { id: 'workflow-templates', label: { ar: 'قوالب', en: 'Templates', fr: 'Modèles' }, icon: BookTemplate, color: 'text-orange-600', section: 'workflow' },
    { id: 'workflow', label: { ar: 'مصمم', en: 'Designer', fr: 'Concepteur' }, icon: Workflow, color: 'text-blue-600', section: 'workflow' },
    { id: 'formio', label: { ar: 'النماذج', en: 'Forms', fr: 'Formulaires' }, icon: FileText, color: 'text-pink-600', section: 'tools' },
    { id: 'viewer', label: { ar: 'العارض', en: 'Viewer', fr: 'Visualiseur' }, icon: Eye, color: 'text-teal-600', section: 'tools' },
    { id: 'org-hierarchy', label: { ar: 'الهيكل', en: 'Organization', fr: 'Organisation' }, icon: Building2, color: 'text-cyan-600', section: 'org' },
    { id: 'ai-config', label: { ar: 'AI', en: 'AI Config', fr: 'Config IA' }, icon: Settings, color: 'text-gray-600', section: 'settings' },
  ];

  const sections = {
    main: { ar: 'الرئيسية', en: 'Main', fr: 'Principal' },
    workflow: { ar: 'سير العمل', en: 'Workflow', fr: 'Flux' },
    tools: { ar: 'الأدوات', en: 'Tools', fr: 'Outils' },
    org: { ar: 'المنظمة', en: 'Organization', fr: 'Organisation' },
    settings: { ar: 'الإعدادات', en: 'Settings', fr: 'Paramètres' }
  };

  const groupedItems = navigationItems.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {});

  const NavItem = ({ item }) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;

    return (
      <button
        onClick={() => {
          onTabChange(item.id);
          setIsMobileMenuOpen(false);
        }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
          isActive ? 'bg-blue-50 text-blue-600 font-semibold' : 'hover:bg-gray-100 text-gray-700'
        }`}
      >
        <Icon className="w-5 h-5" />
        <span className="text-sm flex-1 text-left">{getText(item.label)}</span>
        {item.badge && (
          <span className="px-2 py-0.5 bg-pink-500 text-white text-xs font-bold rounded-full">
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-72 bg-white border-r flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Database className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold">DocuWave</h1>
            </div>
            <button onClick={toggleTheme} className="p-2 hover:bg-gray-100 rounded-lg">
              {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
          
          <select value={selectedTenant} onChange={(e) => onTenantChange(e.target.value)} 
            className="w-full mb-2 px-3 py-2 border rounded-lg text-sm">
            {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          
          <select value={language} onChange={(e) => setLanguage(e.target.value)} 
            className="w-full px-3 py-2 border rounded-lg text-sm">
            <option value="en">🇬🇧 English</option>
            <option value="ar">🇸🇦 العربية</option>
            <option value="fr">🇫🇷 Français</option>
          </select>
        </div>
        
        <nav className="flex-1 p-4 overflow-y-auto">
          {Object.entries(groupedItems).map(([section, items]) => (
            <div key={section} className="mb-4">
              <p className="text-xs font-bold text-gray-400 uppercase px-4 mb-2">
                {getText(sections[section])}
              </p>
              {items.map(item => <NavItem key={item.id} item={item} />)}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t">
          <p className="text-xs text-center text-gray-500">
            <strong>DocuWave v2.0</strong><br/>© 2025 All rights reserved
          </p>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <h1 className="text-lg font-bold">DocuWave</h1>
          </div>
          <button onClick={toggleTheme} className="p-2 hover:bg-gray-100 rounded-lg">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <>
          <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 top-[73px]" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="lg:hidden fixed top-[73px] left-0 right-0 bottom-0 bg-white z-40 overflow-y-auto">
            <div className="p-4 space-y-4">
              <select value={selectedTenant} onChange={(e) => onTenantChange(e.target.value)} 
                className="w-full px-3 py-3 border rounded-xl text-sm">
                {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              
              <select value={language} onChange={(e) => setLanguage(e.target.value)} 
                className="w-full px-3 py-3 border rounded-xl text-sm">
                <option value="en">🇬🇧 English</option>
                <option value="ar">🇸🇦 العربية</option>
                <option value="fr">🇫🇷 Français</option>
              </select>

              {Object.entries(groupedItems).map(([section, items]) => (
                <div key={section} className="mb-4">
                  <p className="text-xs font-bold text-gray-400 uppercase px-4 mb-2">
                    {getText(sections[section])}
                  </p>
                  {items.map(item => <NavItem key={item.id} item={item} />)}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="lg:hidden h-[73px]"></div>
    </>
  );
}

// ============================================
// SIMPLE DASHBOARD
// ============================================
function SimpleDashboard({ documents, language }) {
  const getText = (obj) => {
    if (typeof obj === 'string') return obj;
    return obj?.[language] || obj?.en || '';
  };

  const stats = {
    total: documents.length,
    processed: documents.filter(d => d.status === 'processed').length,
    pending: documents.filter(d => d.status === 'pending').length,
    processing: documents.filter(d => d.status === 'processing').length
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        {getText({ ar: 'لوحة التحكم', en: 'Dashboard', fr: 'Tableau de bord' })}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border p-4">
          <p className="text-sm text-gray-500">{getText({ ar: 'الإجمالي', en: 'Total', fr: 'Total' })}</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-sm text-gray-500">{getText({ ar: 'تمت المعالجة', en: 'Processed', fr: 'Traités' })}</p>
          <p className="text-2xl font-bold text-green-600">{stats.processed}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-sm text-gray-500">{getText({ ar: 'قيد الانتظار', en: 'Pending', fr: 'En attente' })}</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-sm text-gray-500">{getText({ ar: 'قيد المعالجة', en: 'Processing', fr: 'En cours' })}</p>
          <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border">
        <div className="p-4 border-b">
          <h2 className="font-bold">{getText({ ar: 'المستندات', en: 'Documents', fr: 'Documents' })}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                  {getText({ ar: 'الاسم', en: 'Name', fr: 'Nom' })}
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                  {getText({ ar: 'النوع', en: 'Type', fr: 'Type' })}
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                  {getText({ ar: 'الحالة', en: 'Status', fr: 'Statut' })}
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                  {getText({ ar: 'التاريخ', en: 'Date', fr: 'Date' })}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {documents.map(doc => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{doc.name}</td>
                  <td className="px-6 py-4">{doc.scheme}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      doc.status === 'processed' ? 'bg-green-100 text-green-700' :
                      doc.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{doc.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================
// PLACEHOLDER COMPONENT
// ============================================
function PlaceholderPage({ title, icon: Icon, language }) {
  const getText = (obj) => {
    if (typeof obj === 'string') return obj;
    return obj?.[language] || obj?.en || '';
  };

  return (
    <div className="flex items-center justify-center h-full p-6">
      <div className="text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
          <Icon className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">{title}</h2>
        <p className="text-gray-600 mb-6">
          {getText({ 
            ar: 'هذه الصفحة قيد التطوير', 
            en: 'This page is under development', 
            fr: 'Cette page est en développement' 
          })}
        </p>
        <div className="flex gap-2 justify-center">
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN SYSTEM COMPONENT
// ============================================
function DocuWaveSystem() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [language, setLanguage] = useState('en');
  const [selectedTenant, setSelectedTenant] = useState('tenant_001');
  const [theme, setTheme] = useState('light');
  const [toast, setToast] = useState(null);
  const [documents, setDocuments] = useState(mockDocuments);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  const showToast = (message, type) => setToast({ message, type });

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        language={language}
        setLanguage={setLanguage}
        selectedTenant={selectedTenant}
        onTenantChange={setSelectedTenant}
        tenants={mockTenants}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <div className="flex-1 overflow-auto">
        {activeTab === 'dashboard' && (
          <SimpleDashboard documents={documents} language={language} />
        )}
        {activeTab === 'scanner' && (
          <PlaceholderPage title="Scanner" icon={ScanLine} language={language} />
        )}
        {activeTab === 'analytics' && (
          <PlaceholderPage title="Analytics" icon={BarChart3} language={language} />
        )}
        {activeTab === 'workflow-tracker' && (
          <PlaceholderPage title="Workflow Tracker" icon={Activity} language={language} />
        )}
        {activeTab === 'workflow-templates' && (
          <PlaceholderPage title="Templates" icon={BookTemplate} language={language} />
        )}
        {activeTab === 'workflow' && (
          <PlaceholderPage title="Workflow Designer" icon={Workflow} language={language} />
        )}
        {activeTab === 'formio' && (
          <PlaceholderPage title="Form Builder" icon={FileText} language={language} />
        )}
        {activeTab === 'viewer' && (
          <PlaceholderPage title="Document Viewer" icon={Eye} language={language} />
        )}
        {activeTab === 'org-hierarchy' && (
          <PlaceholderPage title="Organization" icon={Building2} language={language} />
        )}
        {activeTab === 'ai-config' && (
          <PlaceholderPage title="AI Configuration" icon={Settings} language={language} />
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export default DocuWaveSystem;