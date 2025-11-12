import React from 'react';
import { Grid, Workflow, FileText, Eye, ScanLine, Settings, Database, Moon, Sun, BookTemplate, Building2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslations } from '../../hooks/useTranslations';
import UserProfile from '../common/UserProfile';
import NotificationCenter from '../common/NotificationCenter';

function Sidebar({ activeTab, onTabChange, selectedTenant, onTenantChange, tenants, showToast }) {
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslations();

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Database className="w-6 h-6" />
            DocuWave
          </h1>
          <div className="flex items-center gap-1">
            <button 
              onClick={toggleTheme} 
              className="p-2 hover:bg-gray-800 rounded transition-colors"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-400" />
              )}
            </button>
             <NotificationCenter showToast={showToast} />  
            <UserProfile showToast={showToast} />
          </div>
          
        </div>
        
        <div className="space-y-2">
          {/* Tenant Selector */}
          <select 
            value={selectedTenant} 
            onChange={(e) => onTenantChange(e.target.value)} 
            className="w-full bg-gray-800 text-white px-3 py-2 rounded text-sm hover:bg-gray-750 transition-colors"
          >
            {tenants.map(tenant => (
              <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
            ))}
          </select>
          
          {/* Language Selector */}
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)} 
            className="w-full bg-gray-800 text-white px-3 py-2 rounded text-sm hover:bg-gray-750 transition-colors"
          >
            <option value="en">English</option>
            <option value="ar">العربية</option>
            <option value="fr">Français</option>
          </select>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {/* Dashboard */}
        <button 
          onClick={() => onTabChange('dashboard')} 
          className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-all ${
            activeTab === 'dashboard' 
              ? 'bg-blue-600 shadow-lg' 
              : 'hover:bg-gray-800'
          }`}
        >
          <Grid className="w-5 h-5" />
          <span className="text-sm font-medium">{t.nav?.dashboard}</span>
        </button>
        
        {/* Scanner */}
        <button 
          onClick={() => onTabChange('scanner')} 
          className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-all ${
            activeTab === 'scanner' 
              ? 'bg-blue-600 shadow-lg' 
              : 'hover:bg-gray-800'
          }`}
        >
          <ScanLine className="w-5 h-5" />
          <span className="text-sm font-medium">{t.nav?.scanner}</span>
        </button>
        
        {/* WORKFLOW SECTION */}
        <div className="pt-3 mt-2 border-t border-gray-700">
          <p className="text-xs text-gray-400 px-4 mb-2 font-semibold uppercase tracking-wider">
            {language === 'ar' ? 'سير العمل' : language === 'fr' ? 'Flux de travail' : 'Workflow'}
          </p>
          
          {/* Workflow Templates */}
          <button 
            onClick={() => onTabChange('workflow-templates')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-all ${
              activeTab === 'workflow-templates' 
                ? 'bg-blue-600 shadow-lg' 
                : 'hover:bg-gray-800'
            }`}
          >
            <BookTemplate className="w-5 h-5" />
            <span className="text-sm font-medium">
              {language === 'ar' ? 'قوالب سير العمل' : language === 'fr' ? 'Modèles' : 'Workflow Templates'}
            </span>
          </button>
          
          {/* Workflow Designer */}
          <button 
            onClick={() => onTabChange('workflow')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-all ${
              activeTab === 'workflow' 
                ? 'bg-blue-600 shadow-lg' 
                : 'hover:bg-gray-800'
            }`}
          >
            <Workflow className="w-5 h-5" />
            <span className="text-sm font-medium">{t.nav?.workflowDesigner}</span>
          </button>
        </div>
        
        {/* Form Builder */}
        <button 
          onClick={() => onTabChange('formio')} 
          className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-all ${
            activeTab === 'formio' 
              ? 'bg-blue-600 shadow-lg' 
              : 'hover:bg-gray-800'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span className="text-sm font-medium">{t.nav?.formioBuilder}</span>
        </button>
        
        {/* Document Viewer */}
        <button 
          onClick={() => onTabChange('viewer')} 
          className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-all ${
            activeTab === 'viewer' 
              ? 'bg-blue-600 shadow-lg' 
              : 'hover:bg-gray-800'
          }`}
        >
          <Eye className="w-5 h-5" />
          <span className="text-sm font-medium">{t.nav?.documentViewer}</span>
        </button>

        {/* ORGANIZATION SECTION */}
        <div className="pt-3 mt-2 border-t border-gray-700">
          <p className="text-xs text-gray-400 px-4 mb-2 font-semibold uppercase tracking-wider">
            {language === 'ar' ? 'المنظمة' : language === 'fr' ? 'Organisation' : 'Organization'}
          </p>
          
          {/* Organization Hierarchy */}
          <button 
            onClick={() => onTabChange('org-hierarchy')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-all ${
              activeTab === 'org-hierarchy' 
                ? 'bg-blue-600 shadow-lg' 
                : 'hover:bg-gray-800'
            }`}
          >
            <Building2 className="w-5 h-5" />
            <span className="text-sm font-medium">
              {language === 'ar' ? 'الهيكل التنظيمي' : language === 'fr' ? 'Structure' : 'Org Structure'}
            </span>
          </button>
        </div>
        
        {/* SETTINGS SECTION */}
        <div className="pt-3 mt-2 border-t border-gray-700">
          <p className="text-xs text-gray-400 px-4 mb-2 font-semibold uppercase tracking-wider">
            {language === 'ar' ? 'الإعدادات' : language === 'fr' ? 'Paramètres' : 'Settings'}
          </p>
          
          {/* AI Configuration */}
          <button 
            onClick={() => onTabChange('ai-config')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-all ${
              activeTab === 'ai-config' 
                ? 'bg-blue-600 shadow-lg' 
                : 'hover:bg-gray-800'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-sm font-medium">{t.nav?.aiConfiguration}</span>
          </button>
          
          {/* Repositories */}
          <button 
            onClick={() => onTabChange('repositories')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-all ${
              activeTab === 'repositories' 
                ? 'bg-blue-600 shadow-lg' 
                : 'hover:bg-gray-800'
            }`}
          >
            <Database className="w-5 h-5" />
            <span className="text-sm font-medium">{t.nav?.repositories}</span>
          </button>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700 text-xs text-gray-400">
        <p className="font-semibold">DocuWave v2.0</p>
        <p className="mt-1">© 2025 All rights reserved</p>
      </div>
    </div>
  );
}

export default Sidebar;