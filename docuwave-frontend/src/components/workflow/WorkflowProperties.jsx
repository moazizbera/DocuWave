import React, { useState } from 'react';
import { Settings, X, Trash2, Plus, Link, ChevronDown, ChevronRight } from 'lucide-react';

// ✅ IMPORT ORG CONTEXT
import { useOrg } from '../../contexts/OrgContext';

// ✅ IMPORT SHARED CONSTANTS
import { 
  ORGANIZATIONAL_ROLES, 
  ADHOC_ROUTING_TYPES,
  CONDITION_TYPES 
} from '../../constants/workflowConstants';

// ✅ IMPORT SHARED UTILS
import { getText } from '../../utils/workflowUtils';

/**
 * 🎛️ WORKFLOW NODE PROPERTIES PANEL
 * ==================================
 * Edit properties of selected workflow node
 * Integrates with organizational structure for role-based routing
 * 
 * @component
 */
function WorkflowProperties({ 
  selectedNode, 
  setSelectedNode, 
  nodes, 
  setNodes, 
  connections = [],
  onClose = () => {}, 
  language = 'en', 
  showToast = (msg, type) => console.log(msg, type)
}) {
  // ✅ ACCESS ORG STRUCTURE
  const { orgStructure, routingEngine } = useOrg();
  
  const [showDependencies, setShowDependencies] = useState(false);
  const [showRolePreview, setShowRolePreview] = useState(false);
  const [previewContextUser, setPreviewContextUser] = useState('emp_3'); // Default test user

  // No node selected - show empty state
  if (!selectedNode) {
    return (
      <div className="w-96 bg-white border-l p-4 overflow-y-auto h-full">
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <Settings className="w-16 h-16 mb-3" />
          <p className="text-sm">
            {getText({
              ar: 'اختر عقدة لتعديلها',
              en: 'Select a node to edit',
              fr: 'Sélectionnez un nœud'
            }, language)}
          </p>
        </div>
      </div>
    );
  }

  // Get all employees for dropdowns
  const allEmployees = routingEngine ? routingEngine.getAllEmployees() : [];

  // Update node property
  const updateNodeProperty = (property, value) => {
    const updatedNode = { ...selectedNode, [property]: value };
    setSelectedNode(updatedNode);
    setNodes(nodes.map(n => n.id === selectedNode.id ? updatedNode : n));
  };

  // Update multi-language label
  const updateNodeLabel = (lang, value) => {
    const currentLabel = typeof selectedNode.label === 'string' 
      ? { ar: selectedNode.label, en: selectedNode.label, fr: selectedNode.label }
      : { ...selectedNode.label };
    const updatedLabel = { ...currentLabel, [lang]: value };
    updateNodeProperty('label', updatedLabel);
  };

  // Delete node
  const deleteNode = () => {
    if (selectedNode.type === 'start' || selectedNode.type === 'end') {
      showToast(
        getText({
          ar: 'لا يمكن حذف البداية/النهاية',
          en: 'Cannot delete start/end',
          fr: 'Impossible de supprimer'
        }, language),
        'error'
      );
      return;
    }
    
    setNodes(nodes.filter(n => n.id !== selectedNode.id));
    setSelectedNode(null);
    onClose();
    showToast(
      getText({
        ar: 'تم حذف العقدة',
        en: 'Node deleted',
        fr: 'Nœud supprimé'
      }, language),
      'success'
    );
  };

  // Get connection stats
  const getIncomingConnections = () => connections.filter(c => c.to === selectedNode.id).length;
  const getOutgoingConnections = () => connections.filter(c => c.from === selectedNode.id).length;

  // Get role preview
  const getRolePreview = (role, contextUserId) => {
    if (!routingEngine) return null;
    
    try {
      const resolved = routingEngine.resolveWorkflowRole(role, contextUserId);
      return resolved;
    } catch (error) {
      console.error('Error resolving role:', error);
      return null;
    }
  };

  return (
    <div className="w-96 bg-white border-l p-4 overflow-y-auto h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 pb-3 border-b">
        <h3 className="font-semibold flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          {getText({
            ar: 'إعدادات العقدة',
            en: 'Node Settings',
            fr: 'Paramètres du nœud'
          }, language)}
        </h3>
        <button 
          onClick={onClose} 
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Node Type Badge */}
        <div className="flex items-center gap-2">
          <span className={`${selectedNode.color} text-white px-3 py-1 rounded-full text-xs font-semibold uppercase`}>
            {selectedNode.type}
          </span>
          <span className="text-xs text-gray-500">ID: {selectedNode.id}</span>
        </div>

        {/* Connections Info */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <h4 className="text-xs font-semibold text-blue-900 mb-2">
            {getText({
              ar: 'الاتصالات',
              en: 'Connections',
              fr: 'Connexions'
            }, language)}
          </h4>
          <div className="text-xs text-blue-800 space-y-1">
            <p>↗ {getText({ ar: 'صادر:', en: 'Outgoing:', fr: 'Sortant:' }, language)} {getOutgoingConnections()}</p>
            <p>↙ {getText({ ar: 'وارد:', en: 'Incoming:', fr: 'Entrant:' }, language)} {getIncomingConnections()}</p>
          </div>
        </div>

        {/* Multi-language Labels */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">
            {getText({
              ar: 'التسميات',
              en: 'Labels',
              fr: 'Libellés'
            }, language)}
          </h4>
          
          <div>
            <label className="text-xs font-medium block mb-1 text-gray-600">
              {getText({ ar: 'عربي', en: 'Arabic', fr: 'Arabe' }, language)}
            </label>
            <input 
              type="text" 
              value={typeof selectedNode.label === 'object' ? (selectedNode.label.ar || '') : selectedNode.label}
              onChange={(e) => updateNodeLabel('ar', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500" 
              dir="rtl"
            />
          </div>

          <div>
            <label className="text-xs font-medium block mb-1 text-gray-600">
              {getText({ ar: 'إنجليزي', en: 'English', fr: 'Anglais' }, language)}
            </label>
            <input 
              type="text" 
              value={typeof selectedNode.label === 'object' ? (selectedNode.label.en || '') : ''}
              onChange={(e) => updateNodeLabel('en', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500" 
              dir="ltr"
            />
          </div>

          <div>
            <label className="text-xs font-medium block mb-1 text-gray-600">
              {getText({ ar: 'فرنسي', en: 'French', fr: 'Français' }, language)}
            </label>
            <input 
              type="text" 
              value={typeof selectedNode.label === 'object' ? (selectedNode.label.fr || '') : ''}
              onChange={(e) => updateNodeLabel('fr', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500" 
              dir="ltr"
            />
          </div>
        </div>

        {/* ============================================ */}
        {/* APPROVAL NODE PROPERTIES */}
        {/* ============================================ */}
        {selectedNode.type === 'approval' && (
          <div className="pt-4 border-t space-y-4">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              ✓ {getText({
                ar: 'إعدادات الموافقة',
                en: 'Approval Settings',
                fr: 'Paramètres approbation'
              }, language)}
            </h4>

            {/* Approval Type Selection */}
            <div>
              <label className="text-xs font-medium block mb-2">
                {getText({
                  ar: 'نوع الموافقة',
                  en: 'Approval Type',
                  fr: 'Type d\'approbation'
                }, language)}
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="approvalType"
                    value="specific"
                    checked={selectedNode.approvalType === 'specific' || !selectedNode.approvalType}
                    onChange={(e) => updateNodeProperty('approvalType', e.target.value)}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      👤 {getText({
                        ar: 'موظف محدد',
                        en: 'Specific Person',
                        fr: 'Personne spécifique'
                      }, language)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {getText({
                        ar: 'اختر موظف محدد بالاسم',
                        en: 'Select a specific employee',
                        fr: 'Sélectionner un employé'
                      }, language)}
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="approvalType"
                    value="role"
                    checked={selectedNode.approvalType === 'role'}
                    onChange={(e) => updateNodeProperty('approvalType', e.target.value)}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      🏢 {getText({
                        ar: 'دور تنظيمي',
                        en: 'Organizational Role',
                        fr: 'Rôle organisationnel'
                      }, language)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {getText({
                        ar: 'يتم التحديد تلقائياً حسب الهيكل',
                        en: 'Auto-resolved from org structure',
                        fr: 'Résolu automatiquement'
                      }, language)}
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Specific Person Selection */}
            {(selectedNode.approvalType === 'specific' || !selectedNode.approvalType) && (
              <div className="bg-purple-50 p-3 rounded-lg space-y-2">
                <label className="text-xs font-medium block">
                  {getText({
                    ar: 'الموافق',
                    en: 'Approver',
                    fr: 'Approbateur'
                  }, language)}
                </label>
                <select
                  value={selectedNode.approverId || ''}
                  onChange={(e) => updateNodeProperty('approverId', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">
                    {getText({
                      ar: 'اختر موظف...',
                      en: 'Select employee...',
                      fr: 'Sélectionner...'
                    }, language)}
                  </option>
                  {allEmployees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {getText(emp.name, language)} - {getText(emp.position, language)}
                    </option>
                  ))}
                </select>
                
                {selectedNode.approverId && (
                  <div className="text-xs text-purple-700 bg-purple-100 p-2 rounded">
                    ✓ {getText({
                      ar: 'سيتم إرسالها إلى',
                      en: 'Will be sent to',
                      fr: 'Sera envoyé à'
                    }, language)}: <strong>{getText(allEmployees.find(e => e.id === selectedNode.approverId)?.name, language)}</strong>
                  </div>
                )}
              </div>
            )}

            {/* Organizational Role Selection */}
            {selectedNode.approvalType === 'role' && (
              <div className="bg-blue-50 p-3 rounded-lg space-y-3">
                <label className="text-xs font-medium block">
                  {getText({
                    ar: 'الدور التنظيمي',
                    en: 'Organizational Role',
                    fr: 'Rôle organisationnel'
                  }, language)}
                </label>
                <select
                  value={selectedNode.role || ''}
                  onChange={(e) => {
                    updateNodeProperty('role', e.target.value);
                    setShowRolePreview(true);
                  }}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">
                    {getText({
                      ar: 'اختر دور...',
                      en: 'Select role...',
                      fr: 'Sélectionner rôle...'
                    }, language)}
                  </option>
                  {ORGANIZATIONAL_ROLES.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.icon} {getText(role.label, language)}
                    </option>
                  ))}
                </select>

                {selectedNode.role && (
                  <div className="bg-blue-100 p-3 rounded-lg space-y-2">
                    <div className="text-xs font-semibold text-blue-900">
                      {getText({
                        ar: '💡 معاينة التحديد التلقائي',
                        en: '💡 Auto-Resolution Preview',
                        fr: '💡 Aperçu de résolution'
                      }, language)}
                    </div>
                    
                    {/* Context User Selector for Preview */}
                    <div>
                      <label className="text-xs block mb-1 text-blue-800">
                        {getText({
                          ar: 'افترض أن المرسل هو:',
                          en: 'Assuming sender is:',
                          fr: 'En supposant que l\'expéditeur est:'
                        }, language)}
                      </label>
                      <select
                        value={previewContextUser}
                        onChange={(e) => setPreviewContextUser(e.target.value)}
                        className="w-full px-2 py-1 border rounded text-xs"
                      >
                        {allEmployees.map(emp => (
                          <option key={emp.id} value={emp.id}>
                            {getText(emp.name, language)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Show resolved employee */}
                    {(() => {
                      const resolved = getRolePreview(selectedNode.role, previewContextUser);
                      if (resolved) {
                        return (
                          <div className="text-xs bg-white p-2 rounded border border-blue-200">
                            <div className="font-semibold text-blue-900 mb-1">
                              {getText({
                                ar: '→ سيتم التوجيه إلى:',
                                en: '→ Will route to:',
                                fr: '→ Sera routé vers:'
                              }, language)}
                            </div>
                            <div className="text-blue-800">
                              <strong>{getText(resolved.name, language)}</strong>
                              <br />
                              {getText(resolved.position, language)}
                              <br />
                              📧 {resolved.email}
                            </div>
                          </div>
                        );
                      } else {
                        return (
                          <div className="text-xs text-orange-700 bg-orange-100 p-2 rounded">
                            ⚠️ {getText({
                              ar: 'لا يمكن تحديد الموافق',
                              en: 'Cannot resolve approver',
                              fr: 'Impossible de résoudre'
                            }, language)}
                          </div>
                        );
                      }
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ============================================ */}
        {/* AD-HOC NODE PROPERTIES */}
        {/* ============================================ */}
        {selectedNode.type === 'adhoc' && (
          <div className="pt-4 border-t space-y-3">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              ⟲ {getText({
                ar: 'إعدادات التوجيه المرن',
                en: 'Ad-hoc Routing Settings',
                fr: 'Paramètres routage ad-hoc'
              }, language)}
            </h4>

            <div>
              <label className="text-xs font-medium block mb-2">
                {getText({
                  ar: 'نوع التوجيه',
                  en: 'Routing Type',
                  fr: 'Type de routage'
                }, language)}
              </label>
              
              <div className="space-y-2">
                {ADHOC_ROUTING_TYPES.map(routingType => (
                  <label 
                    key={routingType.id}
                    className="flex items-start gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <input
                      type="radio"
                      name="adhocType"
                      value={routingType.id}
                      checked={selectedNode.adhocType === routingType.id || (!selectedNode.adhocType && routingType.id === 'manual')}
                      onChange={(e) => updateNodeProperty('adhocType', e.target.value)}
                      className="w-4 h-4 mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm flex items-center gap-2">
                        <span>{routingType.icon}</span>
                        <span>{getText(routingType.label, language)}</span>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {getText(routingType.description, language)}
                      </div>
                      
                      {/* Show rules for hierarchical */}
                      {routingType.id === 'hierarchical' && routingType.rules && (
                        <div className="mt-2 text-xs bg-blue-50 p-2 rounded space-y-1">
                          {routingType.rules[language]?.map((rule, idx) => (
                            <div key={idx} className="text-blue-700">• {rule}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {selectedNode.adhocType && (
              <div className={`p-3 rounded-lg ${selectedNode.adhocType === 'manual' ? 'bg-orange-50' : 'bg-blue-50'}`}>
                <div className="text-xs font-semibold mb-1">
                  {selectedNode.adhocType === 'manual' ? '🔀' : '📊'} 
                  {' '}
                  {getText({
                    ar: selectedNode.adhocType === 'manual' ? 'توجيه يدوي مرن' : 'توجيه تلقائي هرمي',
                    en: selectedNode.adhocType === 'manual' ? 'Manual Flexible Routing' : 'Hierarchical Auto-routing',
                    fr: selectedNode.adhocType === 'manual' ? 'Routage manuel' : 'Routage automatique'
                  }, language)}
                </div>
                <div className={`text-xs ${selectedNode.adhocType === 'manual' ? 'text-orange-700' : 'text-blue-700'}`}>
                  {selectedNode.adhocType === 'manual' 
                    ? getText({
                        ar: 'المستخدم سيختار المستلم التالي عند تنفيذ سير العمل',
                        en: 'User will select next recipient at runtime',
                        fr: 'L\'utilisateur sélectionnera le destinataire'
                      }, language)
                    : getText({
                        ar: 'سيتم التوجيه تلقائياً حسب الهيكل التنظيمي',
                        en: 'Will route automatically based on org hierarchy',
                        fr: 'Routera automatiquement selon la hiérarchie'
                      }, language)
                  }
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================ */}
        {/* CONDITIONAL NODE PROPERTIES */}
        {/* ============================================ */}
        {selectedNode.type === 'conditional' && (
          <div className="pt-4 border-t space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">
              ◊ {getText({
                ar: 'إعدادات الشرط',
                en: 'Condition Settings',
                fr: 'Paramètres de condition'
              }, language)}
            </h4>

            <div>
              <label className="text-xs font-medium block mb-1">
                {getText({ ar: 'الحقل', en: 'Field', fr: 'Champ' }, language)}
              </label>
              <input 
                type="text" 
                value={selectedNode.field || ''} 
                onChange={(e) => updateNodeProperty('field', e.target.value)}
                placeholder="days, amount, status..."
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium block mb-1">
                {getText({ ar: 'العملية', en: 'Operator', fr: 'Opérateur' }, language)}
              </label>
              <select 
                value={selectedNode.operator || 'greaterThan'} 
                onChange={(e) => updateNodeProperty('operator', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
              >
                {CONDITION_TYPES.map(ct => (
                  <option key={ct.value} value={ct.value}>
                    {ct.symbol} {getText(ct.label, language)}
                  </option>
                ))}
              </select>
            </div>

            {selectedNode.operator && CONDITION_TYPES.find(ct => ct.value === selectedNode.operator)?.needsValue && (
              <div>
                <label className="text-xs font-medium block mb-1">
                  {getText({ ar: 'القيمة', en: 'Value', fr: 'Valeur' }, language)}
                </label>
                <input 
                  type="text" 
                  value={selectedNode.value || ''} 
                  onChange={(e) => updateNodeProperty('value', e.target.value)}
                  placeholder="5, 1000, approved..."
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                />
              </div>
            )}

            {selectedNode.field && selectedNode.operator && (
              <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                <div className="text-xs font-semibold text-orange-900 mb-1">
                  {getText({ ar: 'معاينة:', en: 'Preview:', fr: 'Aperçu:' }, language)}
                </div>
                <code className="text-xs text-orange-800">
                  {selectedNode.field} {CONDITION_TYPES.find(ct => ct.value === selectedNode.operator)?.symbol} {selectedNode.value || '...'}
                </code>
              </div>
            )}
          </div>
        )}

        {/* Delete Node Button */}
        {selectedNode.type !== 'start' && selectedNode.type !== 'end' && (
          <button 
            onClick={deleteNode}
            className="w-full mt-6 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 transition-colors font-medium"
          >
            <Trash2 className="w-4 h-4" />
            {getText({
              ar: 'حذف العقدة',
              en: 'Delete Node',
              fr: 'Supprimer le nœud'
            }, language)}
          </button>
        )}
      </div>
    </div>
  );
}

export default WorkflowProperties;