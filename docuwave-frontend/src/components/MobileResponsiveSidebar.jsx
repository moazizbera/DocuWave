import React, { useState } from 'react';
import { 
  Grid, Workflow, FileText, Eye, ScanLine, Settings, Database, 
  Moon, Sun, BookTemplate, Building2, Menu, X, BarChart3, Activity,
  Users, Bell, Search, Plus, Zap
} from 'lucide-react';

/**
 * 📱 MOBILE-RESPONSIVE SIDEBAR
 * ===========================
 * Features:
 * - Collapsible mobile menu
 * - Touch-friendly navigation
 * - Smooth animations
 * - Quick actions panel
 * - Search functionality
 * - Notification badge
 * - Dark mode toggle
 * 
 * Usage: Replace existing Sidebar component in DocuWaveSystem.jsx
 */

function MobileResponsiveSidebar({ 
  activeTab, 
  onTabChange, 
  selectedTenant, 
  onTenantChange, 
  tenants, 
  language,
  setLanguage,
  theme,
  toggleTheme,
  showToast 
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(false);

  const getText = (obj) => {
    if (typeof obj === 'string') return obj;
    return obj?.[language] || obj?.en || '';
  };

  const navigationItems = [
    { 
      id: 'dashboard', 
      label: { ar: 'لوحة التحكم', en: 'Dashboard', fr: 'Tableau de bord' }, 
      icon: Grid, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      section: 'main'
    },
    { 
      id: 'scanner', 
      label: { ar: 'الماسح الضوئي', en: 'Scanner', fr: 'Scanner' }, 
      icon: ScanLine, 
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      section: 'main'
    },
    { 
      id: 'analytics', 
      label: { ar: 'التحليلات', en: 'Analytics', fr: 'Analytiques' }, 
      icon: BarChart3, 
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      section: 'main',
      badge: 'NEW'
    },
    { 
      id: 'workflow-tracker', 
      label: { ar: 'متابعة سير العمل', en: 'Workflow Tracker', fr: 'Suivi flux' }, 
      icon: Activity, 
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      section: 'main',
      badge: 'NEW'
    },
    { 
      id: 'workflow-templates', 
      label: { ar: 'قوالب سير العمل', en: 'Templates', fr: 'Modèles' }, 
      icon: BookTemplate, 
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      section: 'workflow'
    },
    { 
      id: 'workflow', 
      label: { ar: 'مصمم سير العمل', en: 'Designer', fr: 'Concepteur' }, 
      icon: Workflow, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      section: 'workflow'
    },
    { 
      id: 'formio', 
      label: { ar: 'منشئ النماذج', en: 'Form Builder', fr: 'Formulaires' }, 
      icon: FileText, 
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      section: 'tools'
    },
    { 
      id: 'viewer', 
      label: { ar: 'عارض المستندات', en: 'Viewer', fr: 'Visualiseur' }, 
      icon: Eye, 
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      section: 'tools'
    },
    { 
      id: 'org-hierarchy', 
      label: { ar: 'الهيكل التنظيمي', en: 'Organization', fr: 'Organisation' }, 
      icon: Building2, 
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      section: 'org'
    },
    { 
      id: 'users', 
      label: { ar: 'المستخدمون', en: 'Users', fr: 'Utilisateurs' }, 
      icon: UsersIcon, 
      color: 'text-violet-600',
      bgColor: 'bg-violet-50',
      section: 'org'
    },
    { 
      id: 'ai-config', 
      label: { ar: 'إعدادات AI', en: 'AI Config', fr: 'Config IA' }, 
      icon: Settings, 
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      section: 'settings'
    },
    { 
      id: 'repositories', 
      label: { ar: 'المستودعات', en: 'Repositories', fr: 'Référentiels' }, 
      icon: Database, 
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      section: 'settings'
    }
  ];

  const quickActions = [
    { 
      id: 'upload', 
      label: { ar: 'رفع مستند', en: 'Upload Document', fr: 'Télécharger' }, 
      icon: Plus,
      action: () => onTabChange('scanner')
    },
    { 
      id: 'new-workflow', 
      label: { ar: 'سير عمل جديد', en: 'New Workflow', fr: 'Nouveau flux' }, 
      icon: Workflow,
      action: () => onTabChange('workflow')
    },
    { 
      id: 'quick-search', 
      label: { ar: 'بحث سريع', en: 'Quick Search', fr: 'Recherche rapide' }, 
      icon: Search,
      action: () => showToast('Search feature coming soon', 'info')
    }
  ];

  const sections = {
    main: { ar: 'الرئيسية', en: 'Main', fr: 'Principal' },
    workflow: { ar: 'سير العمل', en: 'Workflow', fr: 'Flux de travail' },
    tools: { ar: 'الأدوات', en: 'Tools', fr: 'Outils' },
    org: { ar: 'المنظمة', en: 'Organization', fr: 'Organisation' },
    settings: { ar: 'الإعدادات', en: 'Settings', fr: 'Paramètres' }
  };

  const filteredItems = searchQuery 
    ? navigationItems.filter(item => 
        getText(item.label).toLowerCase().includes(searchQuery.toLowerCase())
      )
    : navigationItems;

  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {});

  const NavItem = ({ item, onClick, isMobile = false }) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;

    return (
      <button
        onClick={() => {
          onClick(item.id);
          if (isMobile) setIsMobileMenuOpen(false);
        }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative ${
          isActive 
            ? `${item.bgColor} ${item.color} shadow-md font-semibold` 
            : 'hover:bg-gray-100 text-gray-700'
        }`}
      >
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          isActive ? 'bg-white shadow-sm' : item.bgColor
        }`}>
          <Icon className={`w-5 h-5 ${isActive ? item.color : 'text-gray-600'}`} />
        </div>
        <span className={`text-sm ${isActive ? 'font-semibold' : 'font-medium'} flex-1 text-left`}>
          {getText(item.label)}
        </span>
        {item.badge && (
          <span className="px-2 py-0.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold rounded-full animate-pulse">
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-72 bg-white border-r shadow-sm flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Database className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">DocuWave</h1>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={toggleTheme} 
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
          
          {/* Tenant & Language Selector */}
          <div className="space-y-2">
            <select 
              value={selectedTenant} 
              onChange={(e) => onTenantChange(e.target.value)} 
              className="w-full bg-gray-50 border-2 border-gray-200 text-gray-900 px-3 py-2 rounded-lg text-sm font-medium hover:border-blue-300 transition-colors"
            >
              {tenants.map(tenant => (
                <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
              ))}
            </select>
            
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)} 
              className="w-full bg-gray-50 border-2 border-gray-200 text-gray-900 px-3 py-2 rounded-lg text-sm font-medium hover:border-blue-300 transition-colors"
            >
              <option value="en">🇬🇧 English</option>
              <option value="ar">🇸🇦 العربية</option>
              <option value="fr">🇫🇷 Français</option>
            </select>
          </div>

          {/* Search */}
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={getText({ ar: 'بحث...', en: 'Search...', fr: 'Rechercher...' })}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
            />
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {Object.entries(groupedItems).map(([section, items]) => (
            <div key={section} className="mb-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-4 mb-2">
                {getText(sections[section])}
              </p>
              {items.map(item => (
                <NavItem key={item.id} item={item} onClick={onTabChange} />
              ))}
            </div>
          ))}
        </nav>

        {/* Quick Actions */}
        <div className="p-4 border-t bg-gradient-to-br from-blue-50 to-indigo-50">
          <button 
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="w-full mb-3 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 font-semibold"
          >
            <Zap className="w-5 h-5" />
            {getText({ ar: 'إجراءات سريعة', en: 'Quick Actions', fr: 'Actions rapides' })}
          </button>
          
          {showQuickActions && (
            <div className="space-y-2 animate-fade-in">
              {quickActions.map(action => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={action.action}
                    className="w-full px-3 py-2 bg-white hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium text-gray-700"
                  >
                    <Icon className="w-4 h-4" />
                    {getText(action.label)}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <div className="text-xs text-gray-500 text-center">
            <p className="font-semibold text-gray-700">DocuWave v2.0</p>
            <p className="mt-1">© 2025 All rights reserved</p>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b shadow-sm z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow">
                <Database className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-bold text-gray-900">DocuWave</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleTheme}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 top-[73px]"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="lg:hidden fixed top-[73px] left-0 right-0 bottom-0 bg-white z-40 overflow-y-auto animate-slide-in">
            <div className="p-4 space-y-4">
              {/* Mobile Selectors */}
              <select 
                value={selectedTenant} 
                onChange={(e) => onTenantChange(e.target.value)} 
                className="w-full bg-gray-50 border-2 border-gray-200 px-3 py-3 rounded-xl text-sm font-medium"
              >
                {tenants.map(tenant => (
                  <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
                ))}
              </select>
              
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)} 
                className="w-full bg-gray-50 border-2 border-gray-200 px-3 py-3 rounded-xl text-sm font-medium"
              >
                <option value="en">🇬🇧 English</option>
                <option value="ar">🇸🇦 العربية</option>
                <option value="fr">🇫🇷 Français</option>
              </select>

              {/* Mobile Navigation */}
              <div className="space-y-1">
                {Object.entries(groupedItems).map(([section, items]) => (
                  <div key={section} className="mb-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-4 mb-2">
                      {getText(sections[section])}
                    </p>
                    {items.map(item => (
                      <NavItem key={item.id} item={item} onClick={onTabChange} isMobile={true} />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Mobile Spacer */}
      <div className="lg:hidden h-[73px]"></div>
    </>
  );
}

export default MobileResponsiveSidebar;