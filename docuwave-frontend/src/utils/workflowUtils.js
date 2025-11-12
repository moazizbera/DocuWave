/**
 * 🛠️ WORKFLOW SYSTEM - UTILITY FUNCTIONS
 * ========================================
 * Shared utility functions for workflow operations
 * 
 * @module workflowUtils
 * @version 2.0.0
 */

// ============================================
// 🌐 LANGUAGE UTILITIES
// ============================================

/**
 * Get text in current language from multi-language object
 * @param {Object|string} textObj - Multi-language object or plain string
 * @param {string} language - Current language code ('en', 'ar', 'fr')
 * @returns {string} Text in requested language or fallback
 * 
 * @example
 * getText({ ar: 'مرحبا', en: 'Hello', fr: 'Bonjour' }, 'ar') // 'مرحبا'
 * getText('Hello', 'ar') // 'Hello'
 * getText({ ar: 'مرحبا' }, 'en') // 'مرحبا' (falls back to available)
 */
export function getText(textObj, language = 'en') {
  // If it's a plain string, return it
  if (typeof textObj === 'string') return textObj;
  
  // If it's null/undefined, return empty string
  if (!textObj) return '';
  
  // Try requested language first
  if (textObj[language]) return textObj[language];
  
  // Fallback chain: en -> ar -> fr -> first available
  if (textObj.en) return textObj.en;
  if (textObj.ar) return textObj.ar;
  if (textObj.fr) return textObj.fr;
  
  // Return first available value
  const firstKey = Object.keys(textObj)[0];
  return firstKey ? textObj[firstKey] : '';
}

/**
 * Check if language is RTL (Right-to-Left)
 * @param {string} language - Language code
 * @returns {boolean} True if RTL language
 */
export function isRTL(language) {
  return language === 'ar';
}

// ============================================
// 🔍 WORKFLOW VALIDATION
// ============================================

/**
 * Validate complete workflow structure
 * @param {Array} nodes - Array of workflow nodes
 * @param {Array} connections - Array of connections between nodes
 * @returns {Object} Validation result with errors and warnings
 * 
 * @example
 * const result = validateWorkflow(nodes, connections);
 * if (!result.valid) {
 *   console.error(result.errors);
 * }
 */
export function validateWorkflow(nodes, connections) {
  const errors = [];
  const warnings = [];
  
  // Must have at least one start node
  const startNodes = nodes.filter(n => n.type === 'start');
  if (startNodes.length === 0) {
    errors.push({
      type: 'missing_start',
      severity: 'error',
      message: {
        ar: 'يجب أن يحتوي سير العمل على نقطة بداية واحدة على الأقل',
        en: 'Workflow must have at least one start node',
        fr: 'Le flux doit avoir au moins un nœud de départ'
      }
    });
  } else if (startNodes.length > 1) {
    warnings.push({
      type: 'multiple_starts',
      severity: 'warning',
      message: {
        ar: 'يحتوي سير العمل على أكثر من نقطة بداية',
        en: 'Workflow has multiple start nodes',
        fr: 'Le flux a plusieurs nœuds de départ'
      }
    });
  }
  
  // Must have at least one end node
  const endNodes = nodes.filter(n => n.type === 'end');
  if (endNodes.length === 0) {
    errors.push({
      type: 'missing_end',
      severity: 'error',
      message: {
        ar: 'يجب أن يحتوي سير العمل على نقطة نهاية واحدة على الأقل',
        en: 'Workflow must have at least one end node',
        fr: 'Le flux doit avoir au moins un nœud de fin'
      }
    });
  }
  
  // Check each node for configuration issues
  nodes.forEach(node => {
    // Approval nodes must have configuration
    if (node.type === 'approval') {
      if (!node.approvalType) {
        warnings.push({
          type: 'incomplete_config',
          nodeId: node.id,
          severity: 'warning',
          message: {
            ar: `عقدة الموافقة "${getText(node.label, 'ar')}" غير مكونة`,
            en: `Approval node "${getText(node.label, 'en')}" is not configured`,
            fr: `Le nœud d'approbation "${getText(node.label, 'fr')}" n'est pas configuré`
          }
        });
      } else if (node.approvalType === 'specific' && !node.approverId) {
        warnings.push({
          type: 'missing_approver',
          nodeId: node.id,
          severity: 'warning',
          message: {
            ar: `لم يتم تحديد الموافق في عقدة "${getText(node.label, 'ar')}"`,
            en: `No approver selected in node "${getText(node.label, 'en')}"`,
            fr: `Aucun approbateur sélectionné dans "${getText(node.label, 'fr')}"`
          }
        });
      } else if (node.approvalType === 'role' && !node.role) {
        warnings.push({
          type: 'missing_role',
          nodeId: node.id,
          severity: 'warning',
          message: {
            ar: `لم يتم تحديد الدور في عقدة "${getText(node.label, 'ar')}"`,
            en: `No role selected in node "${getText(node.label, 'en')}"`,
            fr: `Aucun rôle sélectionné dans "${getText(node.label, 'fr')}"`
          }
        });
      }
    }
    
    // Conditional nodes must have condition configured
    if (node.type === 'conditional') {
      if (!node.field || !node.operator) {
        warnings.push({
          type: 'incomplete_condition',
          nodeId: node.id,
          severity: 'warning',
          message: {
            ar: `الشرط غير مكتمل في عقدة "${getText(node.label, 'ar')}"`,
            en: `Condition incomplete in node "${getText(node.label, 'en')}"`,
            fr: `Condition incomplète dans "${getText(node.label, 'fr')}"`
          }
        });
      }
    }
    
    // Ad-hoc nodes should have routing type
    if (node.type === 'adhoc' && !node.adhocType) {
      warnings.push({
        type: 'missing_adhoc_type',
        nodeId: node.id,
        severity: 'warning',
        message: {
          ar: `نوع التوجيه غير محدد في عقدة "${getText(node.label, 'ar')}"`,
          en: `Routing type not specified in node "${getText(node.label, 'en')}"`,
          fr: `Type de routage non spécifié dans "${getText(node.label, 'fr')}"`
        }
      });
    }
  });
  
  // Check for orphaned nodes (not connected)
  nodes.forEach(node => {
    const hasIncoming = connections.some(c => c.to === node.id);
    const hasOutgoing = connections.some(c => c.from === node.id);
    
    if (!hasIncoming && node.type !== 'start') {
      warnings.push({
        type: 'no_incoming',
        nodeId: node.id,
        severity: 'warning',
        message: {
          ar: `العقدة "${getText(node.label, 'ar')}" ليس لها اتصالات واردة`,
          en: `Node "${getText(node.label, 'en')}" has no incoming connections`,
          fr: `Le nœud "${getText(node.label, 'fr')}" n'a pas de connexions entrantes`
        }
      });
    }
    
    if (!hasOutgoing && node.type !== 'end') {
      warnings.push({
        type: 'no_outgoing',
        nodeId: node.id,
        severity: 'warning',
        message: {
          ar: `العقدة "${getText(node.label, 'ar')}" ليس لها اتصالات صادرة`,
          en: `Node "${getText(node.label, 'en')}" has no outgoing connections`,
          fr: `Le nœud "${getText(node.label, 'fr')}" n'a pas de connexions sortantes`
        }
      });
    }
  });
  
  // Check for unreachable end nodes
  endNodes.forEach(endNode => {
    const isReachable = canReachNode(startNodes[0]?.id, endNode.id, connections);
    if (!isReachable) {
      warnings.push({
        type: 'unreachable_end',
        nodeId: endNode.id,
        severity: 'warning',
        message: {
          ar: 'نقطة النهاية غير قابلة للوصول من نقطة البداية',
          en: 'End node is not reachable from start node',
          fr: 'Le nœud de fin n\'est pas accessible depuis le départ'
        }
      });
    }
  });
  
  return {
    valid: errors.length === 0,
    hasWarnings: warnings.length > 0,
    errors,
    warnings,
    nodeCount: nodes.length,
    connectionCount: connections.length
  };
}

/**
 * Check if target node is reachable from source node
 * @param {number} sourceId - Source node ID
 * @param {number} targetId - Target node ID
 * @param {Array} connections - Array of connections
 * @returns {boolean} True if reachable
 */
function canReachNode(sourceId, targetId, connections) {
  if (!sourceId || !targetId) return false;
  if (sourceId === targetId) return true;
  
  const visited = new Set();
  const queue = [sourceId];
  
  while (queue.length > 0) {
    const current = queue.shift();
    if (visited.has(current)) continue;
    visited.add(current);
    
    if (current === targetId) return true;
    
    const outgoing = connections.filter(c => c.from === current);
    outgoing.forEach(conn => {
      if (!visited.has(conn.to)) {
        queue.push(conn.to);
      }
    });
  }
  
  return false;
}

// ============================================
// 📤 WORKFLOW EXPORT/IMPORT
// ============================================

/**
 * Export workflow to JSON schema
 * @param {string} name - Workflow name
 * @param {Array} nodes - Array of nodes
 * @param {Array} connections - Array of connections
 * @param {Object} metadata - Additional metadata
 * @returns {Object} Workflow schema object
 */
export function exportWorkflow(name, nodes, connections, metadata = {}) {
  const schema = {
    version: '2.0',
    name: name,
    createdAt: new Date().toISOString(),
    metadata: {
      author: metadata.author || 'Unknown',
      description: metadata.description || '',
      category: metadata.category || 'general',
      ...metadata
    },
    nodes: nodes.map(node => ({
      id: node.id,
      type: node.type,
      label: node.label,
      x: node.x,
      y: node.y,
      color: node.color,
      // Approval node specific
      ...(node.approvalType && { approvalType: node.approvalType }),
      ...(node.approverId && { approverId: node.approverId }),
      ...(node.role && { role: node.role }),
      // Conditional node specific
      ...(node.field && { field: node.field }),
      ...(node.operator && { operator: node.operator }),
      ...(node.value && { value: node.value }),
      // Ad-hoc node specific
      ...(node.adhocType && { adhocType: node.adhocType }),
      // Form node specific
      ...(node.formFields && { formFields: node.formFields })
    })),
    connections: connections.map(conn => ({
      from: conn.from,
      to: conn.to,
      type: conn.type,
      action: conn.action,
      label: conn.label,
      color: conn.color,
      icon: conn.icon
    }))
  };
  
  return schema;
}

/**
 * Import workflow from JSON schema
 * @param {Object} schema - Workflow schema object
 * @returns {Object} Parsed workflow { name, nodes, connections, metadata }
 */
export function importWorkflow(schema) {
  if (!schema || !schema.nodes || !schema.connections) {
    throw new Error('Invalid workflow schema');
  }
  
  return {
    name: schema.name || 'Imported Workflow',
    nodes: schema.nodes.map(node => ({
      ...node,
      id: node.id || Date.now() + Math.random()
    })),
    connections: schema.connections || [],
    metadata: schema.metadata || {},
    version: schema.version || '1.0'
  };
}

/**
 * Download workflow as JSON file
 * @param {string} name - Workflow name
 * @param {Array} nodes - Array of nodes
 * @param {Array} connections - Array of connections
 */
export function downloadWorkflowJSON(name, nodes, connections) {
  const schema = exportWorkflow(name, nodes, connections);
  const json = JSON.stringify(schema, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name.replace(/\s+/g, '_')}_workflow.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ============================================
// 🎨 CANVAS UTILITIES
// ============================================

/**
 * Calculate connection path between two nodes
 * @param {number} x1 - Source X coordinate
 * @param {number} y1 - Source Y coordinate
 * @param {number} x2 - Target X coordinate
 * @param {number} y2 - Target Y coordinate
 * @param {boolean} isReject - Is this a reject connection (curved)
 * @returns {string} SVG path string
 */
export function getConnectionPath(x1, y1, x2, y2, isReject = false) {
  if (isReject) {
    // Curved path for reject connections
    const midX = (x1 + x2) / 2;
    const curveOffset = 60;
    return `M ${x1} ${y1} Q ${midX} ${y1 - curveOffset} ${x2} ${y2}`;
  }
  // Straight line for forward connections
  return `M ${x1} ${y1} L ${x2} ${y2}`;
}

/**
 * Calculate midpoint of connection for label placement
 * @param {number} x1 - Source X
 * @param {number} y1 - Source Y
 * @param {number} x2 - Target X
 * @param {number} y2 - Target Y
 * @param {boolean} isReject - Is reject connection
 * @returns {Object} { x, y } midpoint coordinates
 */
export function getConnectionMidpoint(x1, y1, x2, y2, isReject = false) {
  const midX = (x1 + x2) / 2;
  const midY = isReject ? (y1 + y2) / 2 - 30 : (y1 + y2) / 2;
  return { x: midX, y: midY };
}

/**
 * Auto-layout workflow nodes in hierarchical structure
 * @param {Array} nodes - Array of nodes
 * @param {Array} connections - Array of connections
 * @returns {Array} Nodes with updated positions
 */
export function autoLayoutWorkflow(nodes, connections) {
  // Find start node
  const startNode = nodes.find(n => n.type === 'start');
  if (!startNode) return nodes;
  
  // Calculate levels using BFS
  const levelMap = new Map();
  const visited = new Set();
  const queue = [{ id: startNode.id, level: 0 }];
  levelMap.set(startNode.id, 0);
  
  while (queue.length > 0) {
    const { id, level } = queue.shift();
    if (visited.has(id)) continue;
    visited.add(id);
    
    const outgoing = connections.filter(c => c.from === id);
    outgoing.forEach(conn => {
      const existingLevel = levelMap.get(conn.to);
      if (existingLevel === undefined || existingLevel < level + 1) {
        levelMap.set(conn.to, level + 1);
        queue.push({ id: conn.to, level: level + 1 });
      }
    });
  }
  
  // Group nodes by level
  const levels = {};
  nodes.forEach(node => {
    const level = levelMap.get(node.id) || 0;
    if (!levels[level]) levels[level] = [];
    levels[level].push(node);
  });
  
  // Position nodes
  const horizontalSpacing = 250;
  const verticalSpacing = 150;
  const baseY = 300;
  
  return nodes.map(node => {
    const level = levelMap.get(node.id) || 0;
    const nodesInLevel = levels[level];
    const indexInLevel = nodesInLevel.indexOf(node);
    const yOffset = (indexInLevel - (nodesInLevel.length - 1) / 2) * verticalSpacing;
    
    return {
      ...node,
      x: 100 + level * horizontalSpacing,
      y: baseY + yOffset
    };
  });
}

/**
 * Center workflow diagram in viewport
 * @param {Array} nodes - Array of nodes
 * @param {number} targetX - Target center X coordinate
 * @param {number} targetY - Target center Y coordinate
 * @returns {Array} Nodes with updated positions
 */
export function centerWorkflow(nodes, targetX = 800, targetY = 400) {
  if (nodes.length === 0) return nodes;
  
  const minX = Math.min(...nodes.map(n => n.x));
  const maxX = Math.max(...nodes.map(n => n.x + 160)); // Node width
  const minY = Math.min(...nodes.map(n => n.y));
  const maxY = Math.max(...nodes.map(n => n.y + 80)); // Node height
  
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  
  const offsetX = targetX - centerX;
  const offsetY = targetY - centerY;
  
  return nodes.map(n => ({
    ...n,
    x: n.x + offsetX,
    y: n.y + offsetY
  }));
}

// ============================================
// 🔧 NODE UTILITIES
// ============================================

/**
 * Generate unique node ID
 * @returns {number} Unique ID based on timestamp
 */
export function generateNodeId() {
  return Date.now() + Math.random();
}

/**
 * Clone node with new ID
 * @param {Object} node - Node to clone
 * @param {number} offsetX - X offset for new position
 * @param {number} offsetY - Y offset for new position
 * @returns {Object} Cloned node
 */
export function cloneNode(node, offsetX = 50, offsetY = 50) {
  const newNode = {
    ...node,
    id: generateNodeId(),
    x: node.x + offsetX,
    y: node.y + offsetY
  };
  
  // Update label to indicate it's a copy
  if (typeof node.label === 'object') {
    newNode.label = {
      ar: `${node.label.ar} (نسخة)`,
      en: `${node.label.en} (Copy)`,
      fr: `${node.label.fr} (Copie)`
    };
  } else {
    newNode.label = `${node.label} (Copy)`;
  }
  
  return newNode;
}

// ============================================
// 📊 STATISTICS
// ============================================

/**
 * Calculate workflow statistics
 * @param {Array} nodes - Array of nodes
 * @param {Array} connections - Array of connections
 * @returns {Object} Statistics object
 */
export function getWorkflowStats(nodes, connections) {
  const nodesByType = {};
  nodes.forEach(node => {
    nodesByType[node.type] = (nodesByType[node.type] || 0) + 1;
  });
  
  const connectionsByType = {};
  connections.forEach(conn => {
    connectionsByType[conn.type] = (connectionsByType[conn.type] || 0) + 1;
  });
  
  const approvalNodes = nodes.filter(n => n.type === 'approval');
  const roleBasedApprovals = approvalNodes.filter(n => n.approvalType === 'role').length;
  const specificApprovals = approvalNodes.filter(n => n.approvalType === 'specific').length;
  
  return {
    totalNodes: nodes.length,
    totalConnections: connections.length,
    nodesByType,
    connectionsByType,
    approvalNodes: {
      total: approvalNodes.length,
      roleBased: roleBasedApprovals,
      specific: specificApprovals
    },
    hasConditionalLogic: nodes.some(n => n.type === 'conditional'),
    hasAdHocRouting: nodes.some(n => n.type === 'adhoc')
  };
}

// ============================================
// 📦 DEFAULT EXPORT
// ============================================

export default {
  getText,
  isRTL,
  validateWorkflow,
  exportWorkflow,
  importWorkflow,
  downloadWorkflowJSON,
  getConnectionPath,
  getConnectionMidpoint,
  autoLayoutWorkflow,
  centerWorkflow,
  generateNodeId,
  cloneNode,
  getWorkflowStats
};