import React from 'react';
import { Grid, Workflow, FileText, Eye, ScanLine, Settings, Database, Moon, Sun, BookTemplate } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslations } from '../../hooks/useTranslations';
import UserProfile from '../common/UserProfile';

function Sidebar({ activeTab, onTabChange, selectedTenant, onTenantChange, tenants, showToast }) {
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslations();

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Database className="w-6 h-6" />
            DocuWave
          </h1>
          <div className="flex items-center gap-1">
            <button onClick={toggleTheme} className="p-2 hover:bg-gray-800 rounded transition-colors">
              {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-400" />}
            </button>
            <UserProfile showToast={showToast} />
          </div>
        </div>
        
        <div className="space-y-2">
          <select value={selectedTenant} onChange={(e) => onTenantChange(e.target.value)} 
            className="w-full bg-gray-800 text-white px-3 py-2 rounded text-sm">
            {tenants.map(tenant => (
              <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
            ))}
          </select>
          
          <select value={language} onChange={(e) => setLanguage(e.target.value)} 
            className="w-full bg-gray-800 text-white px-3 py-2 rounded text-sm">
            <option value="en">English</option>
            <option value="ar">العربية</option>
            <option value="fr">Français</option>
          </select>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        <button onClick={() => onTabChange('dashboard')} 
          className={`w-full flex items-center gap-3 px-4 py-3 rounded ${activeTab === 'dashboard' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>
          <Grid className="w-5 h-5" />
          <span className="text-sm">{t.nav?.dashboard}</span>
        </button>
        
        <button onClick={() => onTabChange('scanner')} 
          className={`w-full flex items-center gap-3 px-4 py-3 rounded ${activeTab === 'scanner' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>
          <ScanLine className="w-5 h-5" />
          <span className="text-sm">{t.nav?.scanner}</span>
        </button>
        
        {/* WORKFLOW SECTION - GROUP TOGETHER */}
        <div className="pt-2 border-t border-gray-700">
          <p className="text-xs text-gray-400 px-4 mb-2">سير العمل</p>
          
          <button onClick={() => onTabChange('workflow-templates')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded ${activeTab === 'workflow-templates' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>
            <BookTemplate className="w-5 h-5" />
            <span className="text-sm">{language === 'ar' ? 'قوالب سير العمل' : 'Workflow Templates'}</span>
          </button>
          
          <button onClick={() => onTabChange('workflow')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded ${activeTab === 'workflow' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>
            <Workflow className="w-5 h-5" />
            <span className="text-sm">{t.nav?.workflowDesigner}</span>
          </button>
        </div>
        
        <button onClick={() => onTabChange('formio')} 
          className={`w-full flex items-center gap-3 px-4 py-3 rounded ${activeTab === 'formio' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>
          <FileText className="w-5 h-5" />
          <span className="text-sm">{t.nav?.formioBuilder}</span>
        </button>
        
        <button onClick={() => onTabChange('viewer')} 
          className={`w-full flex items-center gap-3 px-4 py-3 rounded ${activeTab === 'viewer' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>
          <Eye className="w-5 h-5" />
          <span className="text-sm">{t.nav?.documentViewer}</span>
        </button>
        
        <button onClick={() => onTabChange('ai-config')} 
          className={`w-full flex items-center gap-3 px-4 py-3 rounded ${activeTab === 'ai-config' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>
          <Settings className="w-5 h-5" />
          <span className="text-sm">{t.nav?.aiConfiguration}</span>
        </button>
        
        <button onClick={() => onTabChange('repositories')} 
          className={`w-full flex items-center gap-3 px-4 py-3 rounded ${activeTab === 'repositories' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>
          <Database className="w-5 h-5" />
          <span className="text-sm">{t.nav?.repositories}</span>
        </button>
      </nav>

      <div className="p-4 border-t border-gray-700 text-xs text-gray-400">
        <p>DocuWave v2.0</p>
        <p className="mt-1">© 2025 All rights reserved</p>
      </div>
    </div>
  );
}

export default Sidebar;