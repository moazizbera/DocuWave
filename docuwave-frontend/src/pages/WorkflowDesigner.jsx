import React, { useState, useRef, useEffect } from 'react';
import { Save, Play, ZoomIn, ZoomOut, Settings, Maximize2, GitBranch } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import WorkflowCanvas from '../components/workflow/WorkflowCanvas';
import WorkflowNodePalette from '../components/workflow/WorkflowNodePalette';
import WorkflowProperties from '../components/workflow/WorkflowProperties';

function WorkflowDesigner({ showToast = (msg, type) => console.log(msg, type) }) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  
  const [workflowName, setWorkflowName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [showProperties, setShowProperties] = useState(true);
  const [nodes, setNodes] = useState([
    { id: 1, type: 'start', label: { ar: 'بداية', en: 'Start', fr: 'Début' }, x: 100, y: 300, color: 'bg-green-500' },
    { id: 2, type: 'form', label: { ar: 'تعبئة النموذج', en: 'Fill Form', fr: 'Remplir' }, x: 350, y: 300, color: 'bg-purple-500', formId: null },
    { id: 3, type: 'approval', label: { ar: 'موافقة المدير', en: 'Manager Approval', fr: 'Approbation' }, x: 600, y: 300, color: 'bg-yellow-500', approver: 'manager', department: '', escalation: { enabled: false, days: 3, action: 'notify', escalateTo: '' } },
    { id: 4, type: 'end', label: { ar: 'نهاية', en: 'End', fr: 'Fin' }, x: 850, y: 300, color: 'bg-red-500' }
  ]);
  const [connections, setConnections] = useState([
    { from: 1, to: 2 },
    { from: 2, to: 3 },
    { from: 3, to: 4 }
  ]);

  const getText = (textObj) => {
    if (typeof textObj === 'string') return textObj;
    return textObj?.[language] || textObj?.en || '';
  };

  useEffect(() => {
    if (!workflowName) {
      const defaultNames = { ar: 'سير عمل جديد', en: 'New Workflow', fr: 'Nouveau flux' };
      setWorkflowName(defaultNames[language] || defaultNames.en);
    }
  }, [language, workflowName]);

  const addNode = (type, nodeTypes) => {
    const typeConfig = nodeTypes.find(t => t.id === type);
    
    // Smart positioning - find next available spot
    const sameYNodes = nodes.filter(n => Math.abs(n.y - 300) < 50);
    const maxX = sameYNodes.length > 0 ? Math.max(...sameYNodes.map(n => n.x)) : 100;
    const newX = maxX + 250;
    
    const newNode = {
      id: Date.now(),
      type,
      label: typeConfig.label,
      x: newX,
      y: 300,
      color: typeConfig.color,
      formId: type === 'form' ? null : undefined,
      approver: type === 'approval' ? 'manager' : undefined,
      department: type === 'approval' ? '' : undefined,
      escalation: type === 'approval' ? { enabled: false, days: 3, action: 'notify', escalateTo: '' } : undefined,
      field: type === 'conditional' ? '' : undefined,
      operator: type === 'conditional' ? 'equals' : undefined,
      value: type === 'conditional' ? '' : undefined,
      template: type === 'email' ? null : undefined,
      recipients: type === 'email' ? [] : undefined
    };
    
    setNodes([...nodes, newNode]);
    showToast(getText({ ar: `تمت إضافة ${getText(typeConfig.label)}`, en: `Added ${getText(typeConfig.label)}`, fr: `Ajouté` }), 'success');
  };

  const autoLayout = () => {
    const levelMap = new Map();
    const visited = new Set();
    const queue = [{ id: nodes.find(n => n.type === 'start')?.id, level: 0 }];
    levelMap.set(queue[0].id, 0);
    
    while (queue.length > 0) {
      const { id, level } = queue.shift();
      if (visited.has(id)) continue;
      visited.add(id);
      
      connections.filter(c => c.from === id).forEach(conn => {
        if (!levelMap.has(conn.to) || levelMap.get(conn.to) < level + 1) {
          levelMap.set(conn.to, level + 1);
          queue.push({ id: conn.to, level: level + 1 });
        }
      });
    }
    
    const levels = {};
    nodes.forEach(node => {
      const level = levelMap.get(node.id) || 0;
      if (!levels[level]) levels[level] = [];
      levels[level].push(node);
    });
    
    const newNodes = nodes.map(node => {
      const level = levelMap.get(node.id) || 0;
      const nodesInLevel = levels[level];
      const indexInLevel = nodesInLevel.indexOf(node);
      const yOffset = (indexInLevel - (nodesInLevel.length - 1) / 2) * 150;
      
      return {
        ...node,
        x: 100 + level * 250,
        y: 300 + yOffset
      };
    });
    
    setNodes(newNodes);
    showToast(getText({ ar: 'تم ترتيب المخطط', en: 'Layout organized', fr: 'Organisé' }), 'success');
  };

  const centerDiagram = () => {
    if (nodes.length === 0) return;
    
    const canvas = document.querySelector('.workflow-canvas');
    if (!canvas) return;
    
    const minX = Math.min(...nodes.map(n => n.x));
    const maxX = Math.max(...nodes.map(n => n.x + 160));
    const minY = Math.min(...nodes.map(n => n.y));
    const maxY = Math.max(...nodes.map(n => n.y + 80));
    
    const diagramWidth = maxX - minX;
    const diagramHeight = maxY - minY;
    const canvasWidth = canvas.clientWidth / zoom;
    const canvasHeight = canvas.clientHeight / zoom;
    
    const centerX = minX + diagramWidth / 2;
    const centerY = minY + diagramHeight / 2;
    const targetX = canvasWidth / 2;
    const targetY = canvasHeight / 2;
    
    const offsetX = targetX - centerX;
    const offsetY = targetY - centerY;
    
    setNodes(nodes.map(n => ({ ...n, x: n.x + offsetX, y: n.y + offsetY })));
    
    // Scroll to center
    canvas.scrollLeft = (minX + offsetX - 50) * zoom;
    canvas.scrollTop = (minY + offsetY - 50) * zoom;
    
    showToast(getText({ ar: 'تم التوسيط', en: 'Centered', fr: 'Centré' }), 'success');
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-white border-b shadow-sm">
        <div className="flex items-center gap-3">
          {isEditingName ? (
            <input 
              type="text" 
              value={workflowName} 
              onChange={(e) => setWorkflowName(e.target.value)}
              onBlur={() => setIsEditingName(false)} 
              onKeyPress={(e) => e.key === 'Enter' && setIsEditingName(false)}
              className="text-xl font-bold border-b-2 border-blue-500 outline-none px-2" 
              autoFocus 
            />
          ) : (
            <h2 className="text-xl font-bold cursor-pointer hover:text-blue-600 px-2" onClick={() => setIsEditingName(true)}>
              {workflowName}
            </h2>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={autoLayout} className="px-4 py-2 border rounded hover:bg-gray-50 flex items-center gap-2">
            <GitBranch className="w-4 h-4" />
            {getText({ ar: 'ترتيب', en: 'Layout', fr: 'Organiser' })}
          </button>
          <button onClick={centerDiagram} className="px-4 py-2 border rounded hover:bg-gray-50 flex items-center gap-2">
            <Maximize2 className="w-4 h-4" />
            {getText({ ar: 'توسيط', en: 'Center', fr: 'Centrer' })}
          </button>
          <button onClick={() => setZoom(Math.max(0.5, zoom - 0.1))} className="px-3 py-2 border rounded">
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="px-3 py-2 border text-sm">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(Math.min(2, zoom + 0.1))} className="px-3 py-2 border rounded">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button onClick={() => setShowProperties(!showProperties)} className="px-4 py-2 border rounded">
            <Settings className="w-4 h-4" />
          </button>
          <button onClick={() => showToast(getText({ ar: 'تم الحفظ', en: 'Saved', fr: 'Enregistré' }), 'success')} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2">
            <Save className="w-4 h-4" />
            {getText({ ar: 'حفظ', en: 'Save', fr: 'Enregistrer' })}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <WorkflowNodePalette onAddNode={addNode} language={language} getText={getText} />
        
        <WorkflowCanvas
          nodes={nodes}
          setNodes={setNodes}
          connections={connections}
          setConnections={setConnections}
          selectedNode={selectedNode}
          setSelectedNode={setSelectedNode}
          zoom={zoom}
          language={language}
          getText={getText}
          showToast={showToast}
        />

        {showProperties && selectedNode && (
          <WorkflowProperties
            selectedNode={selectedNode}
            setSelectedNode={setSelectedNode}
            nodes={nodes}
            setNodes={setNodes}
            connections={connections}
            onClose={() => setShowProperties(false)}
            language={language}
            getText={getText}
            showToast={showToast}
          />
        )}
      </div>
    </div>
  );
}

export default WorkflowDesigner;