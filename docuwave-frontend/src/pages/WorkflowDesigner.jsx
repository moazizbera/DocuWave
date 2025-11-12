import React, { useState } from 'react';
import { Save, Play, ZoomIn, ZoomOut, Settings, Maximize2, GitBranch, Grid, Plus, Download, Upload } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

// ✅ IMPORT WORKFLOW COMPONENTS
import WorkflowCanvas from '../components/workflow/WorkflowCanvas';
import WorkflowNodePalette from '../components/workflow/WorkflowNodePalette';
import WorkflowProperties from '../components/workflow/WorkflowProperties';

// ✅ IMPORT FROM SHARED CONSTANTS
import { 
  WORKFLOW_TEMPLATES,
  NODE_TYPES,
  getWorkflowTemplate 
} from '../constants/workflowConstants';

// ✅ IMPORT FROM SHARED UTILS
import { 
  getText,
  validateWorkflow,
  autoLayoutWorkflow,
  centerWorkflow,
  downloadWorkflowJSON,
  exportWorkflow,
  getWorkflowStats
} from '../utils/workflowUtils';

/**
 * 🎨 WORKFLOW DESIGNER - MAIN COMPONENT
 * =====================================
 * Visual workflow designer with canvas, palette, and properties panel
 * 
 * @component
 */
function WorkflowDesigner({ showToast = (msg, type) => console.log(msg, type) }) {
  const { language } = useLanguage();
  
  // View state
  const [view, setView] = useState('templates'); // Start with templates view
  
  // Workflow state
  const [workflowName, setWorkflowName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  
  // UI state
  const [selectedNode, setSelectedNode] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [showProperties, setShowProperties] = useState(true);
  const [showPalette, setShowPalette] = useState(true);
  const [isDirty, setIsDirty] = useState(false);

  // ============================================
  // 📋 TEMPLATE MANAGEMENT
  // ============================================

  const loadTemplate = (template) => {
    console.log('🔄 Loading template:', template);
    
    // Set workflow name based on language
    const name = language === 'ar' ? template.nameAr : 
                 language === 'fr' ? template.nameFr : 
                 template.nameEn;
    setWorkflowName(name);
    
    // ✅ CRITICAL: Deep clone to avoid mutation
    const clonedNodes = JSON.parse(JSON.stringify(template.nodes));
    const clonedConnections = JSON.parse(JSON.stringify(template.connections));
    
    console.log('📦 Cloned nodes:', clonedNodes);
    console.log('🔗 Cloned connections:', clonedConnections);
    
    setNodes(clonedNodes);
    setConnections(clonedConnections);
    setSelectedNode(null);
    setIsDirty(false);
    
    // ✅ Switch to designer view AFTER loading
    setView('designer');
    
    showToast(
      getText({
        ar: `تم تحميل: ${template.nameAr}`,
        en: `Loaded: ${template.nameEn}`,
        fr: `Chargé: ${template.nameFr}`
      }, language),
      'success'
    );
  };

  const handleBackToTemplates = () => {
    if (isDirty) {
      const confirmed = window.confirm(
        getText({
          ar: 'لديك تغييرات غير محفوظة. هل تريد المتابعة؟',
          en: 'You have unsaved changes. Continue?',
          fr: 'Vous avez des modifications non enregistrées. Continuer?'
        }, language)
      );
      if (!confirmed) return;
    }
    setView('templates');
  };

  // ============================================
  // 🎨 CANVAS OPERATIONS
  // ============================================

  const addNode = (type) => {
    const typeConfig = NODE_TYPES.find(t => t.id === type);
    if (!typeConfig) return;
    
    // Find the rightmost node on the same horizontal level
    const sameYNodes = nodes.filter(n => Math.abs(n.y - 300) < 50);
    const maxX = sameYNodes.length > 0 ? Math.max(...sameYNodes.map(n => n.x)) : 100;
    const newX = maxX + 250;
    
    const newNode = {
      id: Date.now(),
      type,
      label: typeConfig.label,
      x: newX,
      y: 300,
      color: typeConfig.color
    };
    
    setNodes([...nodes, newNode]);
    setIsDirty(true);
    
    showToast(
      getText({
        ar: 'تمت الإضافة',
        en: 'Node added',
        fr: 'Nœud ajouté'
      }, language),
      'success'
    );
  };

  const handleAutoLayout = () => {
    const layoutedNodes = autoLayoutWorkflow(nodes, connections);
    setNodes(layoutedNodes);
    setIsDirty(true);
    
    showToast(
      getText({
        ar: 'تم ترتيب المخطط',
        en: 'Layout organized',
        fr: 'Mise en page organisée'
      }, language),
      'success'
    );
  };

  const handleCenterDiagram = () => {
    const centeredNodes = centerWorkflow(nodes, 800, 400);
    setNodes(centeredNodes);
    setIsDirty(true);
    
    showToast(
      getText({
        ar: 'تم التوسيط',
        en: 'Diagram centered',
        fr: 'Diagramme centré'
      }, language),
      'info'
    );
  };

  // ============================================
  // 💾 SAVE & EXPORT
  // ============================================

  const handleSave = () => {
    // Validate workflow first
    const validation = validateWorkflow(nodes, connections);
    
    if (!validation.valid) {
      showToast(
        getText({
          ar: 'يحتوي سير العمل على أخطاء',
          en: 'Workflow has errors',
          fr: 'Le flux contient des erreurs'
        }, language),
        'error'
      );
      console.error('Validation errors:', validation.errors);
      return;
    }
    
    // Show warnings if any
    if (validation.hasWarnings) {
      console.warn('Validation warnings:', validation.warnings);
    }
    
    // TODO: This will be replaced with actual API call to backend
    const workflowSchema = exportWorkflow(workflowName || 'Untitled Workflow', nodes, connections, {
      author: 'Current User', // Will come from auth context
      category: 'general',
      language: language
    });
    
    console.log('📤 Workflow saved (mock):', workflowSchema);
    
    setIsDirty(false);
    showToast(
      getText({
        ar: 'تم الحفظ بنجاح',
        en: 'Saved successfully',
        fr: 'Enregistré avec succès'
      }, language),
      'success'
    );
  };

  const handleExport = () => {
    downloadWorkflowJSON(workflowName || 'workflow', nodes, connections);
    showToast(
      getText({
        ar: 'تم التصدير',
        en: 'Workflow exported',
        fr: 'Flux exporté'
      }, language),
      'success'
    );
  };

  const handleTest = () => {
    const validation = validateWorkflow(nodes, connections);
    const stats = getWorkflowStats(nodes, connections);
    
    console.log('🧪 Workflow Test Results:');
    console.log('Validation:', validation);
    console.log('Statistics:', stats);
    
    if (validation.valid) {
      showToast(
        getText({
          ar: '✅ سير العمل صالح ومكتمل',
          en: '✅ Workflow is valid and complete',
          fr: '✅ Le flux est valide et complet'
        }, language),
        'success'
      );
    } else {
      showToast(
        getText({
          ar: '❌ سير العمل يحتوي على أخطاء',
          en: '❌ Workflow has errors',
          fr: '❌ Le flux contient des erreurs'
        }, language),
        'error'
      );
    }
  };

  // ============================================
  // 🎭 RENDER: TEMPLATES VIEW
  // ============================================

  if (view === 'templates') {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {getText({
                  ar: 'قوالب سير العمل',
                  en: 'Workflow Templates',
                  fr: 'Modèles de flux'
                }, language)}
              </h1>
              <p className="text-gray-600 mt-1">
                {getText({
                  ar: 'ابدأ بسرعة مع قوالب جاهزة',
                  en: 'Start quickly with ready templates',
                  fr: 'Démarrez rapidement avec des modèles'
                }, language)}
              </p>
            </div>
            <button 
              onClick={() => {
                const blank = getWorkflowTemplate('blank');
                if (blank) {
                  loadTemplate(blank);
                }
              }}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {getText({
                ar: 'سير عمل جديد',
                en: 'New Workflow',
                fr: 'Nouveau flux'
              }, language)}
            </button>
          </div>
        </div>

        {/* Enhanced Professional Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {WORKFLOW_TEMPLATES.filter(t => t.id !== 'blank').map(template => {
            // Modern color palettes
            const colorStyles = {
              blue: {
                gradient: 'from-blue-50 to-blue-100',
                icon: 'bg-blue-500',
                button: 'bg-blue-600 hover:bg-blue-700',
                text: 'text-blue-900',
                border: 'border-blue-200'
              },
              indigo: {
                gradient: 'from-indigo-50 to-indigo-100',
                icon: 'bg-indigo-500',
                button: 'bg-indigo-600 hover:bg-indigo-700',
                text: 'text-indigo-900',
                border: 'border-indigo-200'
              },
              orange: {
                gradient: 'from-orange-50 to-orange-100',
                icon: 'bg-orange-500',
                button: 'bg-orange-600 hover:bg-orange-700',
                text: 'text-orange-900',
                border: 'border-orange-200'
              },
              green: {
                gradient: 'from-green-50 to-green-100',
                icon: 'bg-green-500',
                button: 'bg-green-600 hover:bg-green-700',
                text: 'text-green-900',
                border: 'border-green-200'
              },
              purple: {
                gradient: 'from-purple-50 to-purple-100',
                icon: 'bg-purple-500',
                button: 'bg-purple-600 hover:bg-purple-700',
                text: 'text-purple-900',
                border: 'border-purple-200'
              },
              teal: {
                gradient: 'from-teal-50 to-teal-100',
                icon: 'bg-teal-500',
                button: 'bg-teal-600 hover:bg-teal-700',
                text: 'text-teal-900',
                border: 'border-teal-200'
              }
            };

            const style = colorStyles[template.color] || colorStyles.blue;

            return (
              <div
                key={template.id}
                className="bg-white rounded-2xl border-2 border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group"
                onClick={() => loadTemplate(template)}
              >
                {/* Header with gradient background */}
                <div className={`bg-gradient-to-br ${style.gradient} p-5 border-b-2 ${style.border}`}>
                  <div className="flex items-start justify-between mb-4">
                    {/* Icon circle */}
                    <div className={`${style.icon} w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                      {template.icon}
                    </div>
                    
                    {/* Stats badges */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1 text-xs font-medium text-gray-600 bg-white px-2.5 py-1 rounded-full shadow-sm">
                        <Grid className="w-3.5 h-3.5" />
                        <span>{template.nodes.length}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-medium text-gray-600 bg-white px-2.5 py-1 rounded-full shadow-sm">
                        <GitBranch className="w-3.5 h-3.5" />
                        <span>{template.connections.length}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Title */}
                  <h3 className={`text-lg font-bold ${style.text} mb-1.5 leading-tight line-clamp-1`}>
                    {language === 'ar' ? template.nameAr : language === 'fr' ? template.nameFr : template.nameEn}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 min-h-[32px]">
                    {getText(template.description, language)}
                  </p>
                </div>

                {/* Bottom section with badges and button */}
                <div className="p-4">
                  {/* Feature badges */}
                  <div className="flex flex-wrap gap-1.5 mb-3 min-h-[28px]">
                    {template.nodes.some(n => n.approvalType === 'role') && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full border border-purple-200">
                        <span className="text-sm">👤</span>
                        <span>{getText({ ar: 'تنظيمي', en: 'Org', fr: 'Org' }, language)}</span>
                      </span>
                    )}
                    {template.nodes.some(n => n.adhocType === 'manual') && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full border border-orange-200">
                        <span className="text-sm">🔀</span>
                        <span>{getText({ ar: 'يدوي', en: 'Manual', fr: 'Manuel' }, language)}</span>
                      </span>
                    )}
                    {template.nodes.some(n => n.adhocType === 'hierarchical') && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-200">
                        <span className="text-sm">📊</span>
                        <span>{getText({ ar: 'تلقائي', en: 'Auto', fr: 'Auto' }, language)}</span>
                      </span>
                    )}
                    {template.nodes.some(n => n.type === 'conditional') && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200">
                        <span className="text-sm">◊</span>
                        <span>{getText({ ar: 'شرط', en: 'Logic', fr: 'Logique' }, language)}</span>
                      </span>
                    )}
                  </div>

                  {/* Use template button */}
                  <button className={`w-full ${style.button} text-white rounded-xl py-2.5 transition-all duration-300 flex items-center justify-center gap-2 text-sm font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5`}>
                    <Play className="w-4 h-4" />
                    <span>
                      {getText({
                        ar: 'استخدام القالب',
                        en: 'Use Template',
                        fr: 'Utiliser'
                      }, language)}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ============================================
  // 🎭 RENDER: DESIGNER VIEW
  // ============================================

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-white border-b shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={handleBackToTemplates}
            className="px-3 py-2 border rounded hover:bg-gray-50 flex items-center gap-2"
          >
            <Grid className="w-4 h-4" />
            {getText({
              ar: 'القوالب',
              en: 'Templates',
              fr: 'Modèles'
            }, language)}
          </button>
          
          <div className="h-6 w-px bg-gray-300"></div>
          
          {isEditingName ? (
            <input 
              type="text" 
              value={workflowName} 
              onChange={(e) => {
                setWorkflowName(e.target.value);
                setIsDirty(true);
              }}
              onBlur={() => setIsEditingName(false)} 
              onKeyPress={(e) => {
                if (e.key === 'Enter') setIsEditingName(false);
              }}
              className="text-xl font-bold border-b-2 border-blue-500 outline-none px-2 bg-transparent" 
              autoFocus 
            />
          ) : (
            <h2 
              className="text-xl font-bold cursor-pointer hover:text-blue-600 px-2" 
              onClick={() => setIsEditingName(true)}
            >
              {workflowName || getText({
                ar: 'سير عمل جديد',
                en: 'New Workflow',
                fr: 'Nouveau flux'
              }, language)}
              {isDirty && <span className="text-orange-500 ml-2">●</span>}
            </h2>
          )}
        </div>

        <div className="flex gap-2">
          {/* Stats Badge */}
          <div className="px-3 py-2 bg-gray-100 rounded text-sm flex items-center gap-2">
            <span>{nodes.length} {getText({ ar: 'عقد', en: 'nodes', fr: 'nœuds' }, language)}</span>
            <span className="text-gray-400">|</span>
            <span>{connections.length} {getText({ ar: 'اتصال', en: 'links', fr: 'liens' }, language)}</span>
          </div>

          {/* Tools */}
          <button 
            onClick={() => setShowPalette(!showPalette)}
            className={`px-3 py-2 border rounded ${showPalette ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'}`}
            title="Toggle Palette"
          >
            <Plus className="w-4 h-4" />
          </button>
          
          <button 
            onClick={handleAutoLayout} 
            className="px-4 py-2 border rounded hover:bg-gray-50 flex items-center gap-2"
            title="Auto Layout"
          >
            <GitBranch className="w-4 h-4" />
          </button>
          
          <button 
            onClick={handleCenterDiagram} 
            className="px-4 py-2 border rounded hover:bg-gray-50"
            title="Center"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          
          <button 
            onClick={() => setZoom(Math.max(0.5, zoom - 0.1))} 
            className="px-3 py-2 border rounded hover:bg-gray-50"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          
          <span className="px-3 py-2 border text-sm min-w-[70px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          
          <button 
            onClick={() => setZoom(Math.min(2, zoom + 0.1))} 
            className="px-3 py-2 border rounded hover:bg-gray-50"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          
          <div className="h-8 w-px bg-gray-300"></div>
          
          <button 
            onClick={handleTest}
            className="px-4 py-2 border border-purple-500 text-purple-600 rounded hover:bg-purple-50 flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            {getText({
              ar: 'اختبار',
              en: 'Test',
              fr: 'Tester'
            }, language)}
          </button>
          
          <button 
            onClick={handleExport}
            className="px-4 py-2 border rounded hover:bg-gray-50 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
          </button>
          
          <button 
            onClick={() => setShowProperties(!showProperties)} 
            className={`px-3 py-2 border rounded ${showProperties ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'}`}
          >
            <Settings className="w-4 h-4" />
          </button>
          
          <button 
            onClick={handleSave} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {getText({
              ar: 'حفظ',
              en: 'Save',
              fr: 'Enregistrer'
            }, language)}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Node Palette */}
        {showPalette && (
          <WorkflowNodePalette 
            onAddNode={addNode} 
            language={language} 
            getText={getText} 
          />
        )}
        
        {/* Canvas */}
        <WorkflowCanvas
          nodes={nodes}
          setNodes={(newNodes) => {
            setNodes(newNodes);
            setIsDirty(true);
          }}
          connections={connections}
          setConnections={(newConnections) => {
            setConnections(newConnections);
            setIsDirty(true);
          }}
          selectedNode={selectedNode}
          setSelectedNode={setSelectedNode}
          zoom={zoom}
          language={language}
          getText={getText}
          showToast={showToast}
        />

        {/* Properties Panel */}
        {showProperties && selectedNode && (
          <WorkflowProperties
            selectedNode={selectedNode}
            setSelectedNode={setSelectedNode}
            nodes={nodes}
            setNodes={(newNodes) => {
              setNodes(newNodes);
              setIsDirty(true);
            }}
            connections={connections}
            onClose={() => setShowProperties(false)}
            language={language}
            getText={getText}
            showToast={showToast}
          />
        )}
      </div>

      {/* Status Bar */}
      <div className="bg-white border-t px-4 py-2 flex justify-between items-center text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <span>{getText({ ar: 'الحالة:', en: 'Status:', fr: 'Statut:' }, language)}</span>
          {isDirty ? (
            <span className="text-orange-600 flex items-center gap-1">
              ● {getText({ ar: 'غير محفوظ', en: 'Unsaved', fr: 'Non enregistré' }, language)}
            </span>
          ) : (
            <span className="text-green-600 flex items-center gap-1">
              ✓ {getText({ ar: 'محفوظ', en: 'Saved', fr: 'Enregistré' }, language)}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {selectedNode && (
            <span>
              {getText({ ar: 'محدد:', en: 'Selected:', fr: 'Sélectionné:' }, language)} {getText(selectedNode.label, language)}
            </span>
          )}
          <span>Zoom: {Math.round(zoom * 100)}%</span>
        </div>
      </div>
    </div>
  );
}

export default WorkflowDesigner;