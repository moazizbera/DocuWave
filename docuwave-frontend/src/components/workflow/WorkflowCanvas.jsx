import React, { useState, useRef } from 'react';
import { Trash2, Copy } from 'lucide-react';

const nodeTypes = [
  { id: 'form', label: { ar: 'نموذج', en: 'Form', fr: 'Formulaire' }, icon: '📝', color: 'bg-purple-500' },
  { id: 'approval', label: { ar: 'موافقة', en: 'Approval', fr: 'Approbation' }, icon: '✓', color: 'bg-yellow-500' },
  { id: 'parallel', label: { ar: 'موافقات متوازية', en: 'Parallel', fr: 'Parallèle' }, icon: '⫸', color: 'bg-indigo-500' },
  { id: 'conditional', label: { ar: 'شرط', en: 'Conditional', fr: 'Condition' }, icon: '◊', color: 'bg-orange-500' },
  { id: 'adhoc', label: { ar: 'توجيه مرن', en: 'Ad-hoc', fr: 'Ad-hoc' }, icon: '⟲', color: 'bg-gray-500' },
  { id: 'email', label: { ar: 'بريد', en: 'Email', fr: 'Email' }, icon: '✉', color: 'bg-blue-500' },
  { id: 'start', label: { ar: 'بداية', en: 'Start', fr: 'Début' }, icon: '▶', color: 'bg-green-500' },
  { id: 'end', label: { ar: 'نهاية', en: 'End', fr: 'Fin' }, icon: '⬛', color: 'bg-red-500' }
];

function WorkflowCanvas({ 
  nodes = [], 
  setNodes = () => {}, 
  connections = [], 
  setConnections = () => {}, 
  selectedNode = null, 
  setSelectedNode = () => {}, 
  zoom = 1, 
  language = 'en', 
  getText = (obj) => typeof obj === 'string' ? obj : obj?.en || '', 
  showToast = (msg, type) => console.log(msg, type)
}) {
  const [draggingNode, setDraggingNode] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connectingFrom, setConnectingFrom] = useState(null);
  const [editingConnection, setEditingConnection] = useState(null);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const canvasRef = useRef(null);

  // Connection action types
  const connectionActions = [
    { id: 'forward', label: { ar: 'متابعة', en: 'Forward', fr: 'Continuer' }, color: '#3b82f6', icon: '→' },
    { id: 'approve', label: { ar: 'موافقة', en: 'Approve', fr: 'Approuver' }, color: '#10b981', icon: '✓' },
    { id: 'reject', label: { ar: 'رفض', en: 'Reject', fr: 'Rejeter' }, color: '#ef4444', icon: '✕' },
    { id: 'reject_with_reason', label: { ar: 'رفض مع السبب', en: 'Reject with Reason', fr: 'Rejeter avec raison' }, color: '#f59e0b', icon: '✕📝' },
    { id: 'reject_with_comments', label: { ar: 'رفض مع التعليقات', en: 'Reject with Comments', fr: 'Rejeter avec commentaires' }, color: '#f59e0b', icon: '✕💬' },
    { id: 'reject_with_dropdown', label: { ar: 'رفض مع قائمة الأسباب', en: 'Reject with Reason List', fr: 'Rejeter avec liste' }, color: '#f97316', icon: '✕📋' },
    { id: 'return_for_revision', label: { ar: 'إعادة للتعديل', en: 'Return for Revision', fr: 'Retour pour révision' }, color: '#8b5cf6', icon: '↺' },
    { id: 'escalate', label: { ar: 'تصعيد', en: 'Escalate', fr: 'Escalader' }, color: '#ec4899', icon: '⬆' },
    { id: 'delegate', label: { ar: 'تفويض', en: 'Delegate', fr: 'Déléguer' }, color: '#6366f1', icon: '👤' },
    { id: 'conditional', label: { ar: 'شرطي', en: 'Conditional', fr: 'Conditionnel' }, color: '#14b8a6', icon: '?' }
  ];

  const rejectionReasons = [
    { ar: 'معلومات ناقصة', en: 'Incomplete Information', fr: 'Informations incomplètes' },
    { ar: 'مستندات غير كافية', en: 'Insufficient Documents', fr: 'Documents insuffisants' },
    { ar: 'تجاوز الميزانية', en: 'Budget Exceeded', fr: 'Budget dépassé' },
    { ar: 'لا يتوافق مع السياسة', en: 'Does not comply with policy', fr: 'Non conforme à la politique' },
    { ar: 'يحتاج موافقة إضافية', en: 'Requires additional approval', fr: 'Nécessite approbation supplémentaire' },
    { ar: 'بيانات غير صحيحة', en: 'Incorrect data', fr: 'Données incorrectes' },
    { ar: 'خارج نطاق الصلاحيات', en: 'Outside authority', fr: 'Hors autorité' },
    { ar: 'أخرى', en: 'Other', fr: 'Autre' }
  ];

  // Safety check
  if (!Array.isArray(nodes)) {
    console.error('WorkflowCanvas: nodes must be an array');
    return <div className="p-4 text-red-600">Error: Invalid nodes data</div>;
  }
  
  if (!Array.isArray(connections)) {
    console.error('WorkflowCanvas: connections must be an array');
    return <div className="p-4 text-red-600">Error: Invalid connections data</div>;
  }

  const handleNodeDragStart = (e, node) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setDraggingNode(node);
  };

  const handleCanvasDrop = (e) => {
    e.preventDefault();
    if (!draggingNode || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - dragOffset.x + canvasRef.current.scrollLeft) / zoom;
    const y = (e.clientY - rect.top - dragOffset.y + canvasRef.current.scrollTop) / zoom;
    setNodes(nodes.map(n => n.id === draggingNode.id ? { ...n, x, y } : n));
    setDraggingNode(null);
  };

  const handleNodeClick = (node) => {
    if (connectingFrom) {
      if (connectingFrom.id !== node.id) {
        const exists = connections.find(c => c.from === connectingFrom.id && c.to === node.id);
        if (!exists) {
          setEditingConnection({
            from: connectingFrom.id,
            to: node.id,
            action: 'forward',
            label: getText({ ar: 'متابعة', en: 'Forward', fr: 'Continuer' }),
            color: '#3b82f6',
            requiresReason: false,
            requiresComments: false,
            reasonOptions: [],
            condition: ''
          });
          setShowConnectionModal(true);
        } else {
          showToast(getText({ ar: 'الاتصال موجود بالفعل', en: 'Connection already exists', fr: 'Connexion existe déjà' }), 'warning');
        }
      }
      setConnectingFrom(null);
    } else {
      setSelectedNode(node);
    }
  };

  const startConnection = (e, node) => {
    e.stopPropagation();
    setConnectingFrom(node);
    showToast(getText({ ar: 'اضغط على العقدة التالية', en: 'Click next node', fr: 'Cliquez sur le nœud suivant' }), 'info');
  };

  const deleteConnection = (conn) => {
    setConnections(connections.filter(c => !(c.from === conn.from && c.to === conn.to)));
    showToast(getText({ ar: 'تم حذف الاتصال', en: 'Connection deleted', fr: 'Connexion supprimée' }), 'success');
  };

  const saveConnection = () => {
    if (!editingConnection) return;
    const actionConfig = connectionActions.find(a => a.id === editingConnection.action);
    const newConnection = {
      ...editingConnection,
      label: getText(actionConfig.label),
      color: actionConfig.color,
      icon: actionConfig.icon
    };
    
    if (editingConnection.isExisting) {
      setConnections(connections.map(c => (c.from === editingConnection.from && c.to === editingConnection.to) ? newConnection : c));
      showToast(getText({ ar: 'تم تحديث الاتصال', en: 'Connection updated', fr: 'Connexion mise à jour' }), 'success');
    } else {
      setConnections([...connections, newConnection]);
      showToast(getText({ ar: 'تم إضافة الاتصال', en: 'Connection added', fr: 'Connexion ajoutée' }), 'success');
    }
    
    setShowConnectionModal(false);
    setEditingConnection(null);
  };

  const editConnection = (conn) => {
    setEditingConnection({ ...conn, isExisting: true });
    setShowConnectionModal(true);
  };

  const updateConnectionAction = (actionId) => {
    const action = connectionActions.find(a => a.id === actionId);
    setEditingConnection({
      ...editingConnection,
      action: actionId,
      requiresReason: actionId.includes('reason'),
      requiresComments: actionId.includes('comments'),
      reasonOptions: actionId === 'reject_with_dropdown' ? rejectionReasons : []
    });
  };

  const deleteNode = (nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node?.type === 'start' || node?.type === 'end') {
      showToast(getText({ ar: 'لا يمكن حذف البداية/النهاية', en: 'Cannot delete start/end', fr: 'Impossible de supprimer début/fin' }), 'error');
      return;
    }
    setNodes(nodes.filter(n => n.id !== nodeId));
    setConnections(connections.filter(c => c.from !== nodeId && c.to !== nodeId));
    setSelectedNode(null);
    showToast(getText({ ar: 'تم حذف العقدة', en: 'Node deleted', fr: 'Nœud supprimé' }), 'success');
  };

  const duplicateNode = (node) => {
    if (node.type === 'start' || node.type === 'end') {
      showToast(getText({ ar: 'لا يمكن تكرار البداية/النهاية', en: 'Cannot duplicate start/end', fr: 'Impossible de dupliquer début/fin' }), 'warning');
      return;
    }
    const newNode = {
      ...node,
      id: Date.now(),
      x: node.x + 50,
      y: node.y + 50,
      label: typeof node.label === 'object' 
        ? { ar: `${node.label.ar} (نسخة)`, en: `${node.label.en} (Copy)`, fr: `${node.label.fr} (Copie)` }
        : `${node.label} (Copy)`
    };
    setNodes([...nodes, newNode]);
    showToast(getText({ ar: 'تم التكرار', en: 'Node duplicated', fr: 'Nœud dupliqué' }), 'success');
  };

  const canConnect = (node) => node.type !== 'end';

  return (
    <div 
      ref={canvasRef}
      className="workflow-canvas flex-1 overflow-auto bg-gray-50 relative"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleCanvasDrop}
      onClick={() => {
        if (connectingFrom) {
          setConnectingFrom(null);
          showToast(getText({ ar: 'تم إلغاء الربط', en: 'Connection cancelled', fr: 'Connexion annulée' }), 'info');
        }
      }}
      style={{ 
        backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)', 
        backgroundSize: `${20 * zoom}px ${20 * zoom}px` 
      }}
    >
      <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', minWidth: '100%', minHeight: '100%', position: 'relative' }}>
        <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%', zIndex: 1 }}>
          {connections.map((conn, idx) => {
            const from = nodes.find(n => n.id === conn.from);
            const to = nodes.find(n => n.id === conn.to);
            if (!from || !to) return null;
            
            const x1 = from.x + 160, y1 = from.y + 40;
            const x2 = to.x, y2 = to.y + 40;
            const midX = (x1 + x2) / 2, midY = (y1 + y2) / 2;
            const connectionColor = conn.color || '#3b82f6';
            
            return (
              <g key={idx}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={connectionColor} strokeWidth="3" markerEnd="url(#arrow)" />
                {conn.label && (
                  <>
                    <rect x={midX - 40} y={midY - 12} width="80" height="24" fill="white" stroke={connectionColor} strokeWidth="2" rx="4" className="cursor-pointer" style={{ pointerEvents: 'all' }} onClick={(e) => { e.stopPropagation(); editConnection(conn); }} />
                    <text x={midX} y={midY + 4} fill={connectionColor} fontSize="11" fontWeight="600" textAnchor="middle" className="pointer-events-none">{conn.icon || ''} {conn.label || ''}</text>
                  </>
                )}
                <circle cx={midX + 45} cy={midY - 15} r="8" fill="#ef4444" className="cursor-pointer" style={{ pointerEvents: 'all' }} onClick={(e) => { e.stopPropagation(); deleteConnection(conn); }} />
                <text x={midX + 45} y={midY - 15 + 1} fill="white" fontSize="10" textAnchor="middle" dominantBaseline="middle" className="pointer-events-none">✕</text>
              </g>
            );
          })}
          <defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto"><polygon points="0 0, 10 3, 0 6" fill="#3b82f6" /></marker></defs>
        </svg>

        {nodes.map(node => (
          <div key={node.id} draggable onDragStart={(e) => handleNodeDragStart(e, node)} onClick={(e) => { e.stopPropagation(); handleNodeClick(node); }}
            className={`absolute ${node.color} text-white p-4 rounded-lg shadow-lg cursor-move hover:shadow-xl transition-all ${selectedNode?.id === node.id ? 'ring-4 ring-blue-400' : ''} ${connectingFrom?.id === node.id ? 'ring-4 ring-green-400 animate-pulse' : ''}`}
            style={{ left: node.x, top: node.y, width: '160px', zIndex: 10 }}>
            <div className="text-center">
              <div className="text-2xl mb-1">{nodeTypes.find(t => t.id === node.type)?.icon || '📦'}</div>
              <div className="text-sm font-semibold">{getText(node.label)}</div>
            </div>
            {canConnect(node) && (
              <button onClick={(e) => startConnection(e, node)} className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg hover:scale-125 transition-transform flex items-center justify-center text-xs">➜</button>
            )}
            {node.type !== 'start' && node.type !== 'end' && (
              <div className="absolute -top-2 -left-2 flex gap-1">
                <button onClick={(e) => { e.stopPropagation(); duplicateNode(node); }} className="bg-white text-gray-700 rounded-full p-1 shadow hover:bg-gray-100"><Copy className="w-3 h-3" /></button>
                <button onClick={(e) => { e.stopPropagation(); deleteNode(node.id); }} className="bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600"><Trash2 className="w-3 h-3" /></button>
              </div>
            )}
          </div>
        ))}

        {connectingFrom && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce">
            {getText({ ar: '🔗 اختر العقدة الهدف', en: '🔗 Select target node', fr: '🔗 Sélectionnez le nœud' })}
          </div>
        )}
      </div>

      {showConnectionModal && editingConnection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowConnectionModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold">{editingConnection.isExisting ? getText({ ar: 'تعديل الاتصال', en: 'Edit Connection', fr: 'Modifier' }) : getText({ ar: 'إعدادات الاتصال', en: 'Connection Settings', fr: 'Paramètres' })}</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-semibold block mb-2">{getText({ ar: 'نوع الإجراء', en: 'Action Type', fr: 'Type' })}</label>
                <select value={editingConnection.action} onChange={(e) => updateConnectionAction(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                  {connectionActions.map(action => (
                    <option key={action.id} value={action.id}>{action.icon} {getText(action.label)}</option>
                  ))}
                </select>
              </div>
              {editingConnection.action === 'conditional' && (
                <div>
                  <label className="text-sm font-semibold block mb-2">{getText({ ar: 'الشرط', en: 'Condition', fr: 'Condition' })}</label>
                  <input type="text" value={editingConnection.condition || ''} onChange={(e) => setEditingConnection({ ...editingConnection, condition: e.target.value })} placeholder="amount > 1000" className="w-full px-3 py-2 border rounded-lg" />
                </div>
              )}
              {editingConnection.action === 'reject_with_dropdown' && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="text-sm font-semibold block mb-2">{getText({ ar: 'أسباب الرفض', en: 'Rejection Reasons', fr: 'Motifs' })}</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {rejectionReasons.map((reason, idx) => (
                      <div key={idx} className="text-xs p-2 bg-white rounded border">{getText(reason)}</div>
                    ))}
                  </div>
                </div>
              )}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                <div className="text-xs font-semibold mb-2">{getText({ ar: 'معاينة', en: 'Preview', fr: 'Aperçu' })}</div>
                <div className="flex items-center justify-center gap-2">
                  <div className="bg-white px-3 py-1 rounded shadow text-sm">{getText({ ar: 'من', en: 'From', fr: 'De' })}</div>
                  <div className="px-4 py-2 rounded-lg text-white font-semibold text-sm shadow-lg" style={{ backgroundColor: connectionActions.find(a => a.id === editingConnection.action)?.color }}>
                    {connectionActions.find(a => a.id === editingConnection.action)?.icon} {getText(connectionActions.find(a => a.id === editingConnection.action)?.label)}
                  </div>
                  <div className="bg-white px-3 py-1 rounded shadow text-sm">{getText({ ar: 'إلى', en: 'To', fr: 'À' })}</div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t flex gap-3">
              <button onClick={() => { setShowConnectionModal(false); setEditingConnection(null); }} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">{getText({ ar: 'إلغاء', en: 'Cancel', fr: 'Annuler' })}</button>
              <button onClick={saveConnection} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                {editingConnection.isExisting ? getText({ ar: 'تحديث', en: 'Update', fr: 'Mettre à jour' }) : getText({ ar: 'حفظ', en: 'Save', fr: 'Enregistrer' })}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkflowCanvas;