import React, { useState } from 'react';
import { Save, Play, ZoomIn, ZoomOut, Settings, Maximize2, GitBranch, FileText, X, Plus, Grid, Trash2, Copy, Filter } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

// ✅ IMPORT FROM SHARED CONSTANTS
import { 
  WORKFLOW_TEMPLATES, 
  WORKFLOW_CATEGORIES,
  getTemplatesByCategory,
  getWorkflowTemplate
} from '../../constants/workflowConstants';

// ✅ IMPORT FROM SHARED UTILS
import { getText } from '../../utils/workflowUtils';

/**
 * 🎨 WORKFLOW TEMPLATE LIBRARY
 * ============================
 * Gallery view for browsing and selecting workflow templates
 * All template data comes from shared constants
 * 
 * @component
 */
function WorkflowTemplateLibrary({ showToast = (msg, type) => console.log(msg, type), onSelectTemplate }) {
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Get templates for current category
  const filteredTemplates = getTemplatesByCategory(selectedCategory).filter(template => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    const nameEn = template.nameEn?.toLowerCase() || '';
    const nameAr = template.nameAr || '';
    const nameFr = template.nameFr?.toLowerCase() || '';
    const descEn = getText(template.description, 'en').toLowerCase();
    
    return nameEn.includes(searchLower) || 
           nameAr.includes(searchQuery) || 
           nameFr.includes(searchLower) ||
           descEn.includes(searchLower);
  });

  const handleTemplateSelect = (template) => {
    if (onSelectTemplate) {
      onSelectTemplate(template);
    }
    showToast(
      getText({
        ar: `تم تحميل: ${template.nameAr}`,
        en: `Loaded: ${template.nameEn}`,
        fr: `Chargé: ${template.nameFr}`
      }, language),
      'success'
    );
  };

  const handleCreateBlank = () => {
    const blankTemplate = getWorkflowTemplate('blank');
    if (blankTemplate) {
      handleTemplateSelect(blankTemplate);
    }
  };

  const getCategoryStats = (categoryId) => {
    return getTemplatesByCategory(categoryId).length;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {getText({
                ar: 'مكتبة قوالب سير العمل',
                en: 'Workflow Templates Library',
                fr: 'Bibliothèque de modèles'
              }, language)}
            </h1>
            <p className="text-gray-600">
              {getText({
                ar: 'ابدأ بسرعة مع قوالب جاهزة ومصممة مسبقاً',
                en: 'Start quickly with ready-made workflow templates',
                fr: 'Démarrez rapidement avec des modèles prêts'
              }, language)}
            </p>
          </div>
          
          <button 
            onClick={handleCreateBlank}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {getText({
              ar: 'سير عمل جديد',
              en: 'New Workflow',
              fr: 'Nouveau flux'
            }, language)}
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
          {/* Search Input */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={getText({
                  ar: 'البحث في القوالب...',
                  en: 'Search templates...',
                  fr: 'Rechercher des modèles...'
                }, language)}
                className="w-full px-4 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-1 border rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {WORKFLOW_CATEGORIES.map(category => {
              const count = getCategoryStats(category.id);
              const isActive = selectedCategory === category.id;
              
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-white border border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <span className="text-lg">{category.icon}</span>
                  <span>{getText(category.label, language)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-blue-700' : 'bg-gray-100'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-4 flex justify-between items-center">
        <p className="text-sm text-gray-600">
          {getText({
            ar: `عرض ${filteredTemplates.length} قالب`,
            en: `Showing ${filteredTemplates.length} template${filteredTemplates.length !== 1 ? 's' : ''}`,
            fr: `Affichage de ${filteredTemplates.length} modèle${filteredTemplates.length !== 1 ? 's' : ''}`
          }, language)}
        </p>
        
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {getText({
              ar: 'مسح البحث',
              en: 'Clear search',
              fr: 'Effacer la recherche'
            }, language)}
          </button>
        )}
      </div>

      {/* Templates Grid/List */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            {getText({
              ar: 'لا توجد قوالب',
              en: 'No templates found',
              fr: 'Aucun modèle trouvé'
            }, language)}
          </h3>
          <p className="text-gray-500 mb-4">
            {getText({
              ar: 'جرب تغيير الفئة أو مسح البحث',
              en: 'Try changing the category or clearing your search',
              fr: 'Essayez de changer de catégorie ou d\'effacer votre recherche'
            }, language)}
          </p>
          <button
            onClick={handleCreateBlank}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {getText({
              ar: 'إنشاء سير عمل جديد',
              en: 'Create New Workflow',
              fr: 'Créer un nouveau flux'
            }, language)}
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map(template => (
            <TemplateCard
              key={template.id}
              template={template}
              language={language}
              onClick={() => handleTemplateSelect(template)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTemplates.map(template => (
            <TemplateListItem
              key={template.id}
              template={template}
              language={language}
              onClick={() => handleTemplateSelect(template)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Template Card Component (Grid View)
 */
function TemplateCard({ template, language, onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className={`bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transition-all transform ${
        isHovered ? 'shadow-2xl scale-105' : ''
      }`}
    >
      {/* Header with Color */}
      <div className={`bg-${template.color}-500 p-6 text-white relative overflow-hidden`}>
        {/* Decorative Pattern */}
        <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8 opacity-10">
          <div className="text-8xl">{template.icon}</div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-4xl">{template.icon}</div>
            <div>
              <h3 className="text-xl font-bold">
                {language === 'ar' ? template.nameAr : language === 'fr' ? template.nameFr : template.nameEn}
              </h3>
            </div>
          </div>
          <p className="text-sm opacity-90 line-clamp-2">
            {getText(template.description, language)}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Stats */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Grid className="w-4 h-4 text-blue-500" />
            <span>{template.nodes.length} {getText({ ar: 'خطوات', en: 'steps', fr: 'étapes' }, language)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <GitBranch className="w-4 h-4 text-green-500" />
            <span>{template.connections.length} {getText({ ar: 'اتصالات', en: 'connections', fr: 'connexions' }, language)}</span>
          </div>
        </div>

        {/* Features Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {template.nodes.some(n => n.approvalType === 'role') && (
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full flex items-center gap-1">
              👤 {getText({ ar: 'توجيه تنظيمي', en: 'Org Routing', fr: 'Routage org' }, language)}
            </span>
          )}
          {template.nodes.some(n => n.adhocType === 'manual') && (
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full flex items-center gap-1">
              🔀 {getText({ ar: 'يدوي', en: 'Manual', fr: 'Manuel' }, language)}
            </span>
          )}
          {template.nodes.some(n => n.adhocType === 'hierarchical') && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1">
              📊 {getText({ ar: 'تلقائي', en: 'Auto', fr: 'Auto' }, language)}
            </span>
          )}
          {template.nodes.some(n => n.type === 'conditional') && (
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full flex items-center gap-1">
              ◊ {getText({ ar: 'شروط', en: 'Conditional', fr: 'Conditionnel' }, language)}
            </span>
          )}
        </div>

        {/* Use Button */}
        <button className={`w-full px-4 py-2 bg-${template.color}-600 text-white rounded-lg hover:bg-${template.color}-700 transition-all font-medium flex items-center justify-center gap-2`}>
          <Play className="w-4 h-4" />
          {getText({
            ar: 'استخدام القالب',
            en: 'Use Template',
            fr: 'Utiliser le modèle'
          }, language)}
        </button>
      </div>
    </div>
  );
}

/**
 * Template List Item Component (List View)
 */
function TemplateListItem({ template, language, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer p-4"
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className={`w-16 h-16 bg-${template.color}-100 rounded-lg flex items-center justify-center text-3xl flex-shrink-0`}>
          {template.icon}
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            {language === 'ar' ? template.nameAr : language === 'fr' ? template.nameFr : template.nameEn}
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            {getText(template.description, language)}
          </p>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              {template.nodes.length} {getText({ ar: 'خطوات', en: 'steps', fr: 'étapes' }, language)}
            </span>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              {template.connections.length} {getText({ ar: 'اتصالات', en: 'connections', fr: 'connexions' }, language)}
            </span>
            {template.nodes.some(n => n.approvalType === 'role') && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                👤 {getText({ ar: 'توجيه تنظيمي', en: 'Org Routing', fr: 'Routage org' }, language)}
              </span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <button className={`px-6 py-2 bg-${template.color}-600 text-white rounded-lg hover:bg-${template.color}-700 transition-all font-medium flex items-center gap-2 flex-shrink-0`}>
          <Play className="w-4 h-4" />
          {getText({
            ar: 'استخدام',
            en: 'Use',
            fr: 'Utiliser'
          }, language)}
        </button>
      </div>
    </div>
  );
}

export default WorkflowTemplateLibrary;