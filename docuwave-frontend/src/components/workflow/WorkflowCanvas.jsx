import React, { useState, useRef } from 'react';
import { Trash2, Copy } from 'lucide-react';

const nodeTypes = [
  { id: 'form', label: { ar: 'نموذج', en: 'Form' }, icon: '📝', color: 'bg-purple-500' },
  { id: 'approval', label: { ar: 'موافقة', en: 'Approval' }, icon: '✓', color: 'bg-yellow-500' },
  { id: 'parallel', label: { ar: 'موافقات متوازية', en: 'Parallel' }, icon: '⫸', color: 'bg-indigo-500' },
  { id: 'conditional', label: { ar: 'شرط', en: 'Conditional' }, icon: '◊', color: 'bg-orange-500' },
  { id: 'adhoc', label: { ar: 'توجيه مرن', en: 'Ad-hoc' }, icon: '⟲', color: 'bg-gray-500' },
  { id: 'email', label: { ar: 'بريد', en: 'Email' }, icon: '✉', color: 'bg-blue-500' },
  { id: 'start', label: { ar: 'بداية', en: 'Start' }, icon: '▶', color: 'bg-green-500' },
  { id: 'end', label: { ar: 'نهاية', en: 'End' }, icon: '⬛', color: 'bg-red-500' }
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
  const [connectionType, setConnectionType] = useState(null);
  const canvasRef = useRef(null);

  if (!Array.isArray(nodes)) return <div className="p-4 text-red-600">Error: Invalid nodes data</div>;
  if (!Array.isArray(connections)) return <div className="p-4 text-red-600">Error: Invalid connections data</div>;

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
        if (connectingFrom.type === 'start' && node.type === 'end') {
          showToast(getText({ ar: 'لا يمكن ربط البداية بالنهاية مباشرة', en: 'Cannot connect Start to End directly' }), 'error');
          setConnectingFrom(null);
          setConnectionType(null);
          return;
        }

        const exists = connections.find(c => c.from === connectingFrom.id && c.to === node.id && c.type === connectionType);
        if (!exists) {
          const label = connectionType === 'forward' 
            ? getText({ ar: 'متابعة', en: 'Forward' })
            : getText({ ar: 'رفض', en: 'Reject' });
          setConnections([...connections, {
            from: connectingFrom.id,
            to: node.id,
            type: connectionType,
            action: connectionType === 'forward' ? 'forward' : 'reject',
            label: label,
            color: connectionType === 'forward' ? '#3b82f6' : '#ef4444',
            icon: connectionType === 'forward' ? '→' : '✕'
          }]);
          showToast(getText({ ar: 'تم الربط', en: 'Connected' }), 'success');
        }
      }
      setConnectingFrom(null);
      setConnectionType(null);
    } else {
      setSelectedNode(node);
    }
  };

  const startConnection = (e, node, type) => {
    e.stopPropagation();
    setConnectingFrom(node);
    setConnectionType(type);
  };

  const deleteConnection = (conn) => {
    setConnections(connections.filter(c => !(c.from === conn.from && c.to === conn.to && c.type === conn.type)));
    showToast(getText({ ar: 'تم حذف الاتصال', en: 'Connection deleted' }), 'success');
  };

  const deleteNode = (nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node?.type === 'start' || node?.type === 'end') {
      showToast(getText({ ar: 'لا يمكن حذف البداية/النهاية', en: 'Cannot delete start/end' }), 'error');
      return;
    }
    setNodes(nodes.filter(n => n.id !== nodeId));
    setConnections(connections.filter(c => c.from !== nodeId && c.to !== nodeId));
    setSelectedNode(null);
    showToast(getText({ ar: 'تم حذف العقدة', en: 'Node deleted' }), 'success');
  };

  const duplicateNode = (node) => {
    if (node.type === 'start' || node.type === 'end') {
      showToast(getText({ ar: 'لا يمكن تكرار البداية/النهاية', en: 'Cannot duplicate start/end' }), 'warning');
      return;
    }
    const newNode = {
      ...node,
      id: Date.now(),
      x: node.x + 50,
      y: node.y + 50,
      label: typeof node.label === 'object' 
        ? { ar: `${node.label.ar} (نسخة)`, en: `${node.label.en} (Copy)` }
        : `${node.label} (Copy)`
    };
    setNodes([...nodes, newNode]);
    showToast(getText({ ar: 'تم التكرار', en: 'Node duplicated' }), 'success');
  };

  const canForward = (node) => node.type !== 'end';
  const canReject = (node) => node.type !== 'start' && node.type !== 'end';

  const getConnectionPath = (x1, y1, x2, y2, isReject) => {
    if (isReject) {
      const midX = (x1 + x2) / 2;
      const curveOffset = 60;
      return `M ${x1} ${y1} Q ${midX} ${y1 - curveOffset} ${x2} ${y2}`;
    }
    return `M ${x1} ${y1} L ${x2} ${y2}`;
  };

  return (
    <div 
      ref={canvasRef}
      className="flex-1 overflow-auto bg-gray-50 relative"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleCanvasDrop}
      onClick={() => {
        if (connectingFrom) {
          setConnectingFrom(null);
          setConnectionType(null);
        }
      }}
      style={{ 
        backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)', 
        backgroundSize: `${20 * zoom}px ${20 * zoom}px` 
      }}
    >
      <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', minWidth: '2000px', minHeight: '1000px', position: 'relative' }}>
        <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%', zIndex: 1 }}>
          {connections.map((conn, idx) => {
            const from = nodes.find(n => n.id === conn.from);
            const to = nodes.find(n => n.id === conn.to);
            if (!from || !to) return null;
            
            const isReject = conn.type === 'reject';
            const x1 = isReject ? from.x : from.x + 160;
            const y1 = from.y + 40;
            const x2 = isReject ? to.x + 160 : to.x;
            const y2 = to.y + 40;
            
            const path = getConnectionPath(x1, y1, x2, y2, isReject);
            const midX = (x1 + x2) / 2;
            const midY = isReject ? (y1 + y2) / 2 - 30 : (y1 + y2) / 2;
            const connectionColor = conn.color || (isReject ? '#ef4444' : '#3b82f6');
            
            return (
              <g key={idx}>
                <path d={path} stroke={connectionColor} strokeWidth="3" fill="none"
                  strokeDasharray={isReject ? "8,4" : "0"} markerEnd={`url(#arrow-${isReject ? 'reject' : 'forward'})`} />
                {conn.label && (
                  <>
                    <rect x={midX - 40} y={midY - 12} width="80" height="24" fill="white" stroke={connectionColor} strokeWidth="2" rx="4" />
                    <text x={midX} y={midY + 4} fill={connectionColor} fontSize="11" fontWeight="600" textAnchor="middle">
                      {conn.icon} {conn.label}
                    </text>
                  </>
                )}
                <circle cx={midX + 45} cy={midY - 15} r="8" fill="#ef4444" className="cursor-pointer" 
                  style={{ pointerEvents: 'all' }} onClick={(e) => { e.stopPropagation(); deleteConnection(conn); }} />
                <text x={midX + 45} y={midY - 14} fill="white" fontSize="10" textAnchor="middle">✕</text>
              </g>
            );
          })}
          <defs>
            <marker id="arrow-forward" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <polygon points="0 0, 10 3, 0 6" fill="#3b82f6" />
            </marker>
            <marker id="arrow-reject" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <polygon points="0 0, 10 3, 0 6" fill="#ef4444" />
            </marker>
          </defs>
        </svg>

        {nodes.map(node => (
          <div key={node.id} draggable onDragStart={(e) => handleNodeDragStart(e, node)} 
            onClick={(e) => { e.stopPropagation(); handleNodeClick(node); }}
            className={`absolute ${node.color} text-white p-4 rounded-lg shadow-lg cursor-move hover:shadow-xl transition-all 
              ${selectedNode?.id === node.id ? 'ring-4 ring-blue-400' : ''} 
              ${connectingFrom?.id === node.id ? 'ring-4 ring-green-400 animate-pulse' : ''}`}
            style={{ left: node.x, top: node.y, width: '160px', zIndex: 10 }}>
            
            <div className="text-center">
              <div className="text-2xl mb-1">{nodeTypes.find(t => t.id === node.type)?.icon || '📦'}</div>
              <div className="text-sm font-semibold">{getText(node.label)}</div>
              {node.approvalType === 'role' && (
                <div className="text-xs mt-1 bg-white bg-opacity-20 px-2 py-0.5 rounded">
                  {node.role === 'direct_manager' && '👤 Direct Mgr'}
                  {node.role === 'department_manager' && '👥 Dept Mgr'}
                  {node.role === 'ceo' && '👑 CEO'}
                  {node.role === 'hr_manager' && '👤 HR'}
                  {node.role === 'finance_manager' && '💰 Finance'}
                </div>
              )}
              {node.adhocType && (
                <div className="text-xs mt-1 bg-white bg-opacity-20 px-2 py-0.5 rounded">
                  {node.adhocType === 'manual' ? '🔀 Manual' : '📊 Auto'}
                </div>
              )}
            </div>
            
            {canForward(node) && (
              <button onClick={(e) => startConnection(e, node, 'forward')} 
                className="absolute -right-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-green-500 rounded-full border-2 border-white shadow-lg hover:scale-125 transition-transform flex items-center justify-center text-xs font-bold">
                →
              </button>
            )}
            
            {canReject(node) && (
              <button onClick={(e) => startConnection(e, node, 'reject')} 
                className="absolute -left-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-red-500 rounded-full border-2 border-white shadow-lg hover:scale-125 transition-transform flex items-center justify-center text-xs font-bold">
                ←
              </button>
            )}

            {node.type !== 'start' && node.type !== 'end' && (
              <div className="absolute -top-2 -right-2 flex gap-1">
                <button onClick={(e) => { e.stopPropagation(); duplicateNode(node); }} 
                  className="bg-white text-gray-700 rounded-full p-1 shadow hover:bg-gray-100">
                  <Copy className="w-3 h-3" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); deleteNode(node.id); }} 
                  className="bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        ))}

        {connectingFrom && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 text-white px-6 py-3 rounded-lg shadow-lg z-50"
            style={{ backgroundColor: connectionType === 'forward' ? '#10b981' : '#ef4444' }}>
            {connectionType === 'forward' 
              ? getText({ ar: '→ اختر العقدة للمتابعة', en: '→ Select node to forward' })
              : getText({ ar: '← اختر العقدة للرفض', en: '← Select node to reject' })
            }
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkflowCanvas;