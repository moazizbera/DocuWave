import React, { useState } from 'react';
import { Settings, X, Trash2, ChevronDown, ChevronRight, AlertTriangle, Plus, Minus } from 'lucide-react';

function WorkflowProperties({ 
  selectedNode, 
  setSelectedNode, 
  nodes, 
  setNodes, 
  connections = [],
  onClose = () => {}, 
  language = 'en', 
  getText = (obj) => typeof obj === 'string' ? obj : obj?.en || '', 
  showToast = (msg, type) => console.log(msg, type)
}) {
  const [showEscalation, setShowEscalation] = useState(false);
  const [showCondition, setShowCondition] = useState(false);

  // If no node is selected, show placeholder
  if (!selectedNode) {
    return (
      <div className="w-full bg-white border-l p-4 overflow-y-auto h-full">
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <Settings className="w-16 h-16 mb-3" />
          <p className="text-sm">{getText({ ar: 'اختر عقدة لتعديلها', en: 'Select a node to edit', fr: 'Sélectionner un nœud' })}</p>
        </div>
      </div>
    );
  }

  // Mock data - replace with actual data from your system
  const availableForms = [
    { id: 'form_1', name: { ar: 'نموذج الإجازة', en: 'Leave Request Form', fr: 'Formulaire de congé' } },
    { id: 'form_2', name: { ar: 'نموذج الشراء', en: 'Purchase Form', fr: 'Formulaire d\'achat' } },
    { id: 'form_3', name: { ar: 'نموذج الفاتورة', en: 'Invoice Form', fr: 'Formulaire de facture' } }
  ];

  const persons = [
    { id: 'manager', name: { ar: 'المدير المباشر', en: 'Direct Manager', fr: 'Manager direct' } },
    { id: 'hr_manager', name: { ar: 'مدير الموارد البشرية', en: 'HR Manager', fr: 'Manager RH' } },
    { id: 'cfo', name: { ar: 'المدير المالي', en: 'CFO', fr: 'Directeur financier' } },
    { id: 'ceo', name: { ar: 'المدير التنفيذي', en: 'CEO', fr: 'PDG' } },
    { id: 'dept_head', name: { ar: 'رئيس القسم', en: 'Department Head', fr: 'Chef de département' } }
  ];

  const departments = [
    { id: 'hr', name: { ar: 'الموارد البشرية', en: 'Human Resources', fr: 'Ressources humaines' } },
    { id: 'finance', name: { ar: 'المالية', en: 'Finance', fr: 'Finance' } },
    { id: 'it', name: { ar: 'تقنية المعلومات', en: 'IT', fr: 'Informatique' } },
    { id: 'operations', name: { ar: 'العمليات', en: 'Operations', fr: 'Opérations' } },
    { id: 'procurement', name: { ar: 'المشتريات', en: 'Procurement', fr: 'Achats' } }
  ];

  const emailTemplates = [
    { id: 'approval_request', name: { ar: 'طلب موافقة', en: 'Approval Request', fr: 'Demande d\'approbation' } },
    { id: 'approval_granted', name: { ar: 'تمت الموافقة', en: 'Approval Granted', fr: 'Approbation accordée' } },
    { id: 'approval_rejected', name: { ar: 'تم الرفض', en: 'Approval Rejected', fr: 'Approbation rejetée' } },
    { id: 'notification', name: { ar: 'إشعار عام', en: 'General Notification', fr: 'Notification générale' } },
    { id: 'reminder', name: { ar: 'تذكير', en: 'Reminder', fr: 'Rappel' } }
  ];

  const conditionOperators = [
    { value: 'equals', label: { ar: 'يساوي', en: 'Equals', fr: 'Égal' } },
    { value: 'notEquals', label: { ar: 'لا يساوي', en: 'Not Equals', fr: 'Pas égal' } },
    { value: 'greaterThan', label: { ar: 'أكبر من', en: 'Greater Than', fr: 'Supérieur à' } },
    { value: 'lessThan', label: { ar: 'أقل من', en: 'Less Than', fr: 'Inférieur à' } },
    { value: 'greaterOrEqual', label: { ar: 'أكبر أو يساوي', en: 'Greater or Equal', fr: 'Supérieur ou égal' } },
    { value: 'lessOrEqual', label: { ar: 'أقل أو يساوي', en: 'Less or Equal', fr: 'Inférieur ou égal' } },
    { value: 'contains', label: { ar: 'يحتوي على', en: 'Contains', fr: 'Contient' } },
    { value: 'isEmpty', label: { ar: 'فارغ', en: 'Is Empty', fr: 'Est vide' } },
    { value: 'isNotEmpty', label: { ar: 'غير فارغ', en: 'Is Not Empty', fr: 'N\'est pas vide' } }
  ];

  const escalationActions = [
    { value: 'notify', label: { ar: 'إشعار المدير', en: 'Notify Manager', fr: 'Notifier le manager' } },
    { value: 'reassign', label: { ar: 'إعادة تعيين', en: 'Reassign', fr: 'Réaffecter' } },
    { value: 'autoApprove', label: { ar: 'موافقة تلقائية', en: 'Auto Approve', fr: 'Approbation auto' } },
    { value: 'autoReject', label: { ar: 'رفض تلقائي', en: 'Auto Reject', fr: 'Rejet auto' } }
  ];

  const updateNodeProperty = (property, value) => {
    const updatedNode = { ...selectedNode, [property]: value };
    setSelectedNode(updatedNode);
    setNodes(nodes.map(n => n.id === selectedNode.id ? updatedNode : n));
  };

  const updateNodeLabel = (lang, value) => {
    const currentLabel = typeof selectedNode.label === 'string' 
      ? { ar: selectedNode.label, en: selectedNode.label, fr: selectedNode.label }
      : { ...selectedNode.label };
    
    const updatedLabel = { ...currentLabel, [lang]: value };
    updateNodeProperty('label', updatedLabel);
  };

  const updateEscalation = (field, value) => {
    const currentEscalation = selectedNode.escalation || { enabled: false, days: 3, action: 'notify', escalateTo: '' };
    const updatedEscalation = { ...currentEscalation, [field]: value };
    updateNodeProperty('escalation', updatedEscalation);
  };

  const addApprover = () => {
    const currentApprovers = selectedNode.approvers || [];
    const newApprover = { id: Date.now(), person: '', required: true };
    updateNodeProperty('approvers', [...currentApprovers, newApprover]);
  };

  const updateApprover = (approverId, field, value) => {
    const currentApprovers = selectedNode.approvers || [];
    const updated = currentApprovers.map(a => 
      a.id === approverId ? { ...a, [field]: value } : a
    );
    updateNodeProperty('approvers', updated);
  };

  const removeApprover = (approverId) => {
    const currentApprovers = selectedNode.approvers || [];
    updateNodeProperty('approvers', currentApprovers.filter(a => a.id !== approverId));
  };

  const deleteNode = () => {
    if (selectedNode.type === 'start' || selectedNode.type === 'end') {
      showToast(getText({ ar: 'لا يمكن حذف البداية/النهاية', en: 'Cannot delete start/end', fr: 'Impossible de supprimer début/fin' }), 'error');
      return;
    }
    setNodes(nodes.filter(n => n.id !== selectedNode.id));
    setSelectedNode(null);
    onClose();
    showToast(getText({ ar: 'تم حذف العقدة', en: 'Node deleted', fr: 'Nœud supprimé' }), 'success');
  };

  const getIncomingConnections = () => connections.filter(c => c.to === selectedNode.id).length;
  const getOutgoingConnections = () => connections.filter(c => c.from === selectedNode.id).length;

  return (
    <div className="w-full bg-white border-l p-4 overflow-y-auto h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 pb-3 border-b">
        <h3 className="font-semibold flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          {getText({ ar: 'إعدادات العقدة', en: 'Node Settings', fr: 'Paramètres du nœud' })}
        </h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded transition-colors">
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
            {getText({ ar: 'الاتصالات', en: 'Connections', fr: 'Connexions' })}
          </h4>
          <div className="text-xs text-blue-800 space-y-1">
            <p>↗ {getText({ ar: 'صادر:', en: 'Outgoing:', fr: 'Sortant:' })} {getOutgoingConnections()}</p>
            <p>↙ {getText({ ar: 'وارد:', en: 'Incoming:', fr: 'Entrant:' })} {getIncomingConnections()}</p>
          </div>
        </div>

        {/* Multi-language Labels */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">
            {getText({ ar: 'التسميات', en: 'Labels', fr: 'Libellés' })}
          </h4>
          
          <div>
            <label className="text-xs font-medium block mb-1 text-gray-600">
              {getText({ ar: 'عربي', en: 'Arabic', fr: 'Arabe' })}
            </label>
            <input 
              type="text" 
              value={typeof selectedNode.label === 'object' ? (selectedNode.label.ar || '') : selectedNode.label}
              onChange={(e) => updateNodeLabel('ar', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              dir="rtl"
            />
          </div>

          <div>
            <label className="text-xs font-medium block mb-1 text-gray-600">
              {getText({ ar: 'إنجليزي', en: 'English', fr: 'Anglais' })}
            </label>
            <input 
              type="text" 
              value={typeof selectedNode.label === 'object' ? (selectedNode.label.en || '') : ''}
              onChange={(e) => updateNodeLabel('en', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              dir="ltr"
            />
          </div>

          <div>
            <label className="text-xs font-medium block mb-1 text-gray-600">
              {getText({ ar: 'فرنسي', en: 'French', fr: 'Français' })}
            </label>
            <input 
              type="text" 
              value={typeof selectedNode.label === 'object' ? (selectedNode.label.fr || '') : ''}
              onChange={(e) => updateNodeLabel('fr', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              dir="ltr"
            />
          </div>
        </div>

        {/* Form Node Settings */}
        {selectedNode.type === 'form' && (
          <div className="pt-4 border-t space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">
              {getText({ ar: 'إعدادات النموذج', en: 'Form Settings', fr: 'Paramètres du formulaire' })}
            </h4>
            
            <div>
              <label className="text-xs font-medium block mb-1 text-gray-600">
                {getText({ ar: 'اختر النموذج', en: 'Select Form', fr: 'Sélectionner le formulaire' })}
              </label>
              <select 
                value={selectedNode.formId || ''} 
                onChange={(e) => updateNodeProperty('formId', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">{getText({ ar: 'اختر...', en: 'Select...', fr: 'Sélectionner...' })}</option>
                {availableForms.map(f => (
                  <option key={f.id} value={f.id}>{getText(f.name)}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Approval Node Settings */}
        {selectedNode.type === 'approval' && (
          <div className="pt-4 border-t space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">
              {getText({ ar: 'إعدادات الموافقة', en: 'Approval Settings', fr: 'Paramètres d\'approbation' })}
            </h4>

            <div>
              <label className="text-xs font-medium block mb-1 text-gray-600">
                {getText({ ar: 'الموافق', en: 'Approver', fr: 'Approbateur' })}
              </label>
              <select 
                value={selectedNode.approver || ''} 
                onChange={(e) => updateNodeProperty('approver', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">{getText({ ar: 'اختر...', en: 'Select...', fr: 'Sélectionner...' })}</option>
                {persons.map(p => (
                  <option key={p.id} value={p.id}>{getText(p.name)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium block mb-1 text-gray-600">
                {getText({ ar: 'القسم', en: 'Department', fr: 'Département' })}
              </label>
              <select 
                value={selectedNode.department || ''} 
                onChange={(e) => updateNodeProperty('department', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">{getText({ ar: 'لا يوجد', en: 'None', fr: 'Aucun' })}</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{getText(d.name)}</option>
                ))}
              </select>
            </div>

            {/* Escalation Settings */}
            <div className="mt-4">
              <button 
                onClick={() => setShowEscalation(!showEscalation)}
                className="w-full flex justify-between items-center px-3 py-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
              >
                <span className="text-sm font-semibold text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {getText({ ar: 'التصعيد التلقائي', en: 'Auto Escalation', fr: 'Escalade automatique' })}
                </span>
                {showEscalation ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>

              {showEscalation && (
                <div className="mt-2 space-y-3 bg-red-50 p-3 rounded-lg">
                  <label className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={selectedNode.escalation?.enabled || false}
                      onChange={(e) => updateEscalation('enabled', e.target.checked)} 
                      className="w-4 h-4 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm font-medium text-red-900">
                      {getText({ ar: 'تفعيل التصعيد', en: 'Enable Escalation', fr: 'Activer l\'escalade' })}
                    </span>
                  </label>

                  {selectedNode.escalation?.enabled && (
                    <>
                      <div>
                        <label className="text-xs font-medium block mb-1 text-red-900">
                          {getText({ ar: 'بعد (أيام)', en: 'After (days)', fr: 'Après (jours)' })}
                        </label>
                        <input 
                          type="number" 
                          value={selectedNode.escalation?.days || 3}
                          onChange={(e) => updateEscalation('days', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-500"
                          min="1"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-medium block mb-1 text-red-900">
                          {getText({ ar: 'الإجراء', en: 'Action', fr: 'Action' })}
                        </label>
                        <select 
                          value={selectedNode.escalation?.action || 'notify'}
                          onChange={(e) => updateEscalation('action', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-500"
                        >
                          {escalationActions.map(act => (
                            <option key={act.value} value={act.value}>{getText(act.label)}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-medium block mb-1 text-red-900">
                          {getText({ ar: 'التصعيد إلى', en: 'Escalate to', fr: 'Faire remonter à' })}
                        </label>
                        <select 
                          value={selectedNode.escalation?.escalateTo || ''}
                          onChange={(e) => updateEscalation('escalateTo', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-500"
                        >
                          <option value="">{getText({ ar: 'اختر...', en: 'Select...', fr: 'Sélectionner...' })}</option>
                          {persons.map(p => (
                            <option key={p.id} value={p.id}>{getText(p.name)}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Parallel Node Settings */}
        {selectedNode.type === 'parallel' && (
          <div className="pt-4 border-t space-y-3">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center justify-between">
              {getText({ ar: 'الموافقون المتوازيون', en: 'Parallel Approvers', fr: 'Approbateurs parallèles' })}
              <button 
                onClick={addApprover}
                className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                {getText({ ar: 'إضافة', en: 'Add', fr: 'Ajouter' })}
              </button>
            </h4>

            <div className="space-y-2">
              {(selectedNode.approvers || []).map((approver, index) => (
                <div key={approver.id} className="border rounded-lg p-3 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-600">
                      {getText({ ar: 'موافق', en: 'Approver', fr: 'Approbateur' })} #{index + 1}
                    </span>
                    <button 
                      onClick={() => removeApprover(approver.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <select 
                    value={approver.person || ''} 
                    onChange={(e) => updateApprover(approver.id, 'person', e.target.value)}
                    className="w-full px-2 py-1 border rounded text-sm mb-2"
                  >
                    <option value="">{getText({ ar: 'اختر...', en: 'Select...', fr: 'Sélectionner...' })}</option>
                    {persons.map(p => (
                      <option key={p.id} value={p.id}>{getText(p.name)}</option>
                    ))}
                  </select>

                  <label className="flex items-center gap-2 text-xs">
                    <input 
                      type="checkbox" 
                      checked={approver.required !== false}
                      onChange={(e) => updateApprover(approver.id, 'required', e.target.checked)}
                      className="w-3 h-3"
                    />
                    <span>{getText({ ar: 'مطلوب', en: 'Required', fr: 'Requis' })}</span>
                  </label>
                </div>
              ))}

              {(!selectedNode.approvers || selectedNode.approvers.length === 0) && (
                <div className="text-center py-4 text-sm text-gray-500 border-2 border-dashed rounded-lg">
                  {getText({ ar: 'لا يوجد موافقون', en: 'No approvers yet', fr: 'Pas encore d\'approbateurs' })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Conditional Node Settings */}
        {selectedNode.type === 'conditional' && (
          <div className="pt-4 border-t space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">
              {getText({ ar: 'إعدادات الشرط', en: 'Condition Settings', fr: 'Paramètres de condition' })}
            </h4>

            <div>
              <label className="text-xs font-medium block mb-1 text-gray-600">
                {getText({ ar: 'الحقل', en: 'Field', fr: 'Champ' })}
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
              <label className="text-xs font-medium block mb-1 text-gray-600">
                {getText({ ar: 'العملية', en: 'Operator', fr: 'Opérateur' })}
              </label>
              <select 
                value={selectedNode.operator || 'equals'} 
                onChange={(e) => updateNodeProperty('operator', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
              >
                {conditionOperators.map(op => (
                  <option key={op.value} value={op.value}>{getText(op.label)}</option>
                ))}
              </select>
            </div>

            {!['isEmpty', 'isNotEmpty'].includes(selectedNode.operator) && (
              <div>
                <label className="text-xs font-medium block mb-1 text-gray-600">
                  {getText({ ar: 'القيمة', en: 'Value', fr: 'Valeur' })}
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

            <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
              <div className="text-xs font-semibold text-orange-900 mb-1">
                {getText({ ar: 'معاينة الشرط:', en: 'Condition Preview:', fr: 'Aperçu de la condition:' })}
              </div>
              <code className="text-xs text-orange-800">
                {selectedNode.field || 'field'} {' '}
                {getText(conditionOperators.find(o => o.value === selectedNode.operator)?.label || { ar: 'يساوي', en: 'equals', fr: 'égal' })} {' '}
                {!['isEmpty', 'isNotEmpty'].includes(selectedNode.operator) ? (selectedNode.value || 'value') : ''}
              </code>
            </div>
          </div>
        )}

        {/* Email Node Settings */}
        {selectedNode.type === 'email' && (
          <div className="pt-4 border-t space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">
              {getText({ ar: 'إعدادات البريد', en: 'Email Settings', fr: 'Paramètres email' })}
            </h4>

            <div>
              <label className="text-xs font-medium block mb-1 text-gray-600">
                {getText({ ar: 'قالب البريد', en: 'Email Template', fr: 'Modèle email' })}
              </label>
              <select 
                value={selectedNode.template || ''} 
                onChange={(e) => updateNodeProperty('template', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{getText({ ar: 'اختر...', en: 'Select...', fr: 'Sélectionner...' })}</option>
                {emailTemplates.map(t => (
                  <option key={t.id} value={t.id}>{getText(t.name)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium block mb-1 text-gray-600">
                {getText({ ar: 'المستلمون', en: 'Recipients', fr: 'Destinataires' })}
              </label>
              <div className="border rounded-lg p-2 space-y-1 max-h-40 overflow-y-auto bg-white">
                {persons.map(p => (
                  <label key={p.id} className="flex items-center gap-2 text-xs hover:bg-blue-50 p-1 rounded cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={(selectedNode.recipients || []).includes(p.id)}
                      onChange={(e) => {
                        const current = selectedNode.recipients || [];
                        const updated = e.target.checked
                          ? [...current, p.id]
                          : current.filter(id => id !== p.id);
                        updateNodeProperty('recipients', updated);
                      }}
                      className="w-3 h-3 text-blue-600 focus:ring-blue-500"
                    />
                    <span>{getText(p.name)}</span>
                  </label>
                ))}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {(selectedNode.recipients || []).length} {getText({ ar: 'مستلم محدد', en: 'selected', fr: 'sélectionné(s)' })}
              </div>
            </div>
          </div>
        )}

        {/* Ad-hoc Node Settings */}
        {selectedNode.type === 'adhoc' && (
          <div className="pt-4 border-t space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">
              {getText({ ar: 'إعدادات التوجيه المرن', en: 'Ad-hoc Routing Settings', fr: 'Paramètres de routage ad-hoc' })}
            </h4>

            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600">
                {getText({ 
                  ar: 'سيتم تحديد المسار التالي ديناميكياً أثناء التنفيذ',
                  en: 'The next route will be determined dynamically during execution',
                  fr: 'La route suivante sera déterminée dynamiquement lors de l\'exécution'
                })}
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={selectedNode.allowMultipleRoutes || false}
                  onChange={(e) => updateNodeProperty('allowMultipleRoutes', e.target.checked)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">
                  {getText({ ar: 'السماح بمسارات متعددة', en: 'Allow multiple routes', fr: 'Autoriser plusieurs routes' })}
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Delete Node Button */}
        {selectedNode.type !== 'start' && selectedNode.type !== 'end' && (
          <button 
            onClick={deleteNode}
            className="w-full mt-6 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 transition-colors font-medium"
          >
            <Trash2 className="w-4 h-4" />
            {getText({ ar: 'حذف العقدة', en: 'Delete Node', fr: 'Supprimer le nœud' })}
          </button>
        )}
      </div>
    </div>
  );
}

export default WorkflowProperties;