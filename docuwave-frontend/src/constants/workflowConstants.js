/**
 * 🎯 WORKFLOW SYSTEM - SHARED CONSTANTS
 * =====================================
 * Central source of truth for all workflow-related constants
 * 
 * @module workflowConstants
 * @version 2.0.0
 */

// ============================================
// 📦 NODE TYPES
// ============================================

export const NODE_TYPES = [
  {
    id: 'form',
    label: { ar: 'نموذج', en: 'Form', fr: 'Formulaire' },
    icon: '📝',
    color: 'bg-purple-500',
    description: { ar: 'تعبئة نموذج بيانات', en: 'Fill data form', fr: 'Remplir le formulaire' },
    category: 'data'
  },
  {
    id: 'approval',
    label: { ar: 'موافقة', en: 'Approval', fr: 'Approbation' },
    icon: '✓',
    color: 'bg-yellow-500',
    description: { ar: 'موافقة شخص أو دور', en: 'Person or role approval', fr: 'Approbation personne/rôle' },
    category: 'decision',
    supportsRoles: true
  },
  {
    id: 'parallel',
    label: { ar: 'موافقات متوازية', en: 'Parallel Approvals', fr: 'Approbations parallèles' },
    icon: '⫸',
    color: 'bg-indigo-500',
    description: { ar: 'موافقات متعددة في نفس الوقت', en: 'Multiple simultaneous approvals', fr: 'Approbations simultanées' },
    category: 'decision'
  },
  {
    id: 'conditional',
    label: { ar: 'شرط', en: 'Conditional', fr: 'Condition' },
    icon: '◊',
    color: 'bg-orange-500',
    description: { ar: 'تفرع بناء على شرط', en: 'Branch based on condition', fr: 'Branchement conditionnel' },
    category: 'logic'
  },
  {
    id: 'adhoc',
    label: { ar: 'توجيه مرن', en: 'Ad-hoc Routing', fr: 'Routage ad-hoc' },
    icon: '⟲',
    color: 'bg-gray-500',
    description: { ar: 'توجيه ديناميكي مرن', en: 'Flexible dynamic routing', fr: 'Routage dynamique' },
    category: 'routing',
    hasRoutingTypes: true
  },
  {
    id: 'email',
    label: { ar: 'بريد إلكتروني', en: 'Email Notification', fr: 'Notification email' },
    icon: '✉',
    color: 'bg-blue-500',
    description: { ar: 'إرسال إشعار بريد', en: 'Send email notification', fr: 'Envoyer notification' },
    category: 'notification'
  },
  {
    id: 'start',
    label: { ar: 'بداية', en: 'Start', fr: 'Début' },
    icon: '▶',
    color: 'bg-green-500',
    description: { ar: 'نقطة بداية سير العمل', en: 'Workflow start point', fr: 'Point de départ' },
    category: 'system',
    isSystem: true
  },
  {
    id: 'end',
    label: { ar: 'نهاية', en: 'End', fr: 'Fin' },
    icon: '⬛',
    color: 'bg-red-500',
    description: { ar: 'نقطة نهاية سير العمل', en: 'Workflow end point', fr: 'Point final' },
    category: 'system',
    isSystem: true
  }
];

// ============================================
// 🏢 ORGANIZATIONAL ROLES
// ============================================

export const ORGANIZATIONAL_ROLES = [
  {
    id: 'direct_manager',
    label: { ar: 'المدير المباشر', en: 'Direct Manager', fr: 'Gestionnaire direct' },
    icon: '👤',
    description: { ar: 'المدير المباشر للموظف', en: 'Employee\'s direct manager', fr: 'Gestionnaire direct de l\'employé' },
    color: 'text-blue-600'
  },
  {
    id: 'department_manager',
    label: { ar: 'مدير القسم', en: 'Department Manager', fr: 'Chef de département' },
    icon: '👥',
    description: { ar: 'مدير قسم الموظف', en: 'Employee\'s department manager', fr: 'Chef du département' },
    color: 'text-purple-600'
  },
  {
    id: 'ceo',
    label: { ar: 'الرئيس التنفيذي', en: 'CEO', fr: 'PDG' },
    icon: '👑',
    description: { ar: 'الرئيس التنفيذي للمنظمة', en: 'Chief Executive Officer', fr: 'Président Directeur Général' },
    color: 'text-yellow-600'
  },
  {
    id: 'hr_manager',
    label: { ar: 'مدير الموارد البشرية', en: 'HR Manager', fr: 'Directeur RH' },
    icon: '💼',
    description: { ar: 'مدير قسم الموارد البشرية', en: 'Human Resources Manager', fr: 'Directeur des Ressources Humaines' },
    color: 'text-green-600'
  },
  {
    id: 'finance_manager',
    label: { ar: 'المدير المالي', en: 'Finance Manager', fr: 'Directeur financier' },
    icon: '💰',
    description: { ar: 'مدير القسم المالي', en: 'Finance Department Manager', fr: 'Directeur des finances' },
    color: 'text-emerald-600'
  },
  {
    id: 'it_manager',
    label: { ar: 'مدير تقنية المعلومات', en: 'IT Manager', fr: 'Directeur IT' },
    icon: '💻',
    description: { ar: 'مدير قسم تقنية المعلومات', en: 'IT Department Manager', fr: 'Directeur informatique' },
    color: 'text-indigo-600'
  }
];

// ============================================
// 🔀 AD-HOC ROUTING TYPES
// ============================================

export const ADHOC_ROUTING_TYPES = [
  {
    id: 'manual',
    label: { ar: 'اختيار يدوي', en: 'Manual Selection', fr: 'Sélection manuelle' },
    icon: '🔀',
    description: { ar: 'المستخدم يختار المستلم التالي من القائمة', en: 'User selects next recipient from list', fr: 'L\'utilisateur sélectionne le destinataire' },
    color: 'bg-orange-100 text-orange-700'
  },
  {
    id: 'hierarchical',
    label: { ar: 'توجيه تلقائي هرمي', en: 'Hierarchical Auto-routing', fr: 'Routage hiérarchique auto' },
    icon: '📊',
    description: { ar: 'التوجيه التلقائي بناء على الهيكل التنظيمي', en: 'Automatic routing based on org hierarchy', fr: 'Routage auto basé sur hiérarchie' },
    color: 'bg-blue-100 text-blue-700',
    rules: {
      ar: ['للأمام/موافقة → المدير المباشر', 'تفويض → مديرون بنفس المستوى', 'رفض → العودة للمرسل'],
      en: ['Forward/Approve → Direct Manager', 'Delegate → Equivalent Managers', 'Reject → Return to Sender'],
      fr: ['Transférer/Approuver → Gestionnaire direct', 'Déléguer → Gestionnaires équivalents', 'Rejeter → Retour à l\'expéditeur']
    }
  }
];

// ============================================
// ⚙️ CONDITION TYPES
// ============================================

export const CONDITION_TYPES = [
  { value: 'equals', label: { ar: 'يساوي', en: 'Equals', fr: 'Égal' }, symbol: '=', needsValue: true },
  { value: 'notEquals', label: { ar: 'لا يساوي', en: 'Not Equals', fr: 'Différent' }, symbol: '≠', needsValue: true },
  { value: 'contains', label: { ar: 'يحتوي على', en: 'Contains', fr: 'Contient' }, symbol: '⊃', needsValue: true },
  { value: 'greaterThan', label: { ar: 'أكبر من', en: 'Greater Than', fr: 'Supérieur à' }, symbol: '>', needsValue: true },
  { value: 'lessThan', label: { ar: 'أصغر من', en: 'Less Than', fr: 'Inférieur à' }, symbol: '<', needsValue: true },
  { value: 'greaterOrEqual', label: { ar: 'أكبر من أو يساوي', en: 'Greater or Equal', fr: 'Supérieur ou égal' }, symbol: '≥', needsValue: true },
  { value: 'lessOrEqual', label: { ar: 'أصغر من أو يساوي', en: 'Less or Equal', fr: 'Inférieur ou égal' }, symbol: '≤', needsValue: true },
  { value: 'isEmpty', label: { ar: 'فارغ', en: 'Is Empty', fr: 'Est vide' }, symbol: '∅', needsValue: false },
  { value: 'isNotEmpty', label: { ar: 'غير فارغ', en: 'Is Not Empty', fr: 'N\'est pas vide' }, symbol: '≠∅', needsValue: false }
];

// ============================================
// 🎭 ACTION TYPES
// ============================================

export const ACTION_TYPES = [
  { value: 'show', label: { ar: 'إظهار الحقل', en: 'Show Field', fr: 'Afficher le champ' }, icon: '👁️', color: 'text-green-600' },
  { value: 'hide', label: { ar: 'إخفاء الحقل', en: 'Hide Field', fr: 'Masquer le champ' }, icon: '🙈', color: 'text-gray-600' },
  { value: 'enable', label: { ar: 'تفعيل الحقل', en: 'Enable Field', fr: 'Activer le champ' }, icon: '✅', color: 'text-blue-600' },
  { value: 'disable', label: { ar: 'تعطيل الحقل', en: 'Disable Field', fr: 'Désactiver le champ' }, icon: '🚫', color: 'text-red-600' }
];

// ============================================
// 📋 WORKFLOW TEMPLATES
// ============================================

export const WORKFLOW_TEMPLATES = [
  {
    id: 'leave-hierarchical',
    nameAr: 'طلب إجازة (هيكل تنظيمي)',
    nameEn: 'Leave Request (Hierarchical)',
    nameFr: 'Demande de congé (Hiérarchique)',
    icon: '📅',
    color: 'blue',
    category: 'hr',
    description: { ar: 'طلب إجازة مع توجيه تلقائي حسب الهيكل التنظيمي', en: 'Leave request with automatic hierarchical routing', fr: 'Demande de congé avec routage hiérarchique automatique' },
    nodes: [
      { id: 1, type: 'start', label: { ar: 'بداية', en: 'Start', fr: 'Début' }, x: 100, y: 300, color: 'bg-green-500' },
      { id: 2, type: 'form', label: { ar: 'تعبئة طلب الإجازة', en: 'Fill Leave Request', fr: 'Remplir demande' }, x: 350, y: 300, color: 'bg-purple-500', formFields: ['startDate', 'endDate', 'days', 'reason'] },
      { id: 3, type: 'approval', label: { ar: 'موافقة المدير المباشر', en: 'Direct Manager Approval', fr: 'Approbation gestionnaire' }, x: 600, y: 300, color: 'bg-yellow-500', approvalType: 'role', role: 'direct_manager' },
      { id: 4, type: 'email', label: { ar: 'إشعار', en: 'Notification', fr: 'Notification' }, x: 850, y: 300, color: 'bg-blue-500' },
      { id: 5, type: 'end', label: { ar: 'نهاية', en: 'End', fr: 'Fin' }, x: 1100, y: 300, color: 'bg-red-500' }
    ],
    connections: [
      { from: 1, to: 2, type: 'forward', action: 'forward', label: 'Start', color: '#3b82f6', icon: '→' },
      { from: 2, to: 3, type: 'forward', action: 'forward', label: 'Submit', color: '#3b82f6', icon: '→' },
      { from: 3, to: 4, type: 'forward', action: 'approve', label: 'Approve', color: '#10b981', icon: '✓' },
      { from: 3, to: 2, type: 'reject', action: 'reject', label: 'Reject', color: '#ef4444', icon: '✕' },
      { from: 4, to: 5, type: 'forward', action: 'forward', label: 'Done', color: '#3b82f6', icon: '→' }
    ]
  },
  {
    id: 'leave-conditional',
    nameAr: 'طلب إجازة (شرطي)',
    nameEn: 'Leave Request (Conditional)',
    nameFr: 'Demande de congé (Conditionnel)',
    icon: '📅',
    color: 'indigo',
    category: 'hr',
    description: { ar: 'طلب إجازة مع موافقة HR للإجازات الطويلة', en: 'Leave with HR approval for long absences', fr: 'Congé avec approbation RH pour longues absences' },
    nodes: [
      { id: 1, type: 'start', label: { ar: 'بداية', en: 'Start', fr: 'Début' }, x: 100, y: 300, color: 'bg-green-500' },
      { id: 2, type: 'form', label: { ar: 'تفاصيل الإجازة', en: 'Leave Details', fr: 'Détails congé' }, x: 350, y: 300, color: 'bg-purple-500' },
      { id: 3, type: 'approval', label: { ar: 'موافقة المدير', en: 'Manager Approval', fr: 'Approbation' }, x: 600, y: 300, color: 'bg-yellow-500', approvalType: 'role', role: 'direct_manager' },
      { id: 4, type: 'conditional', label: { ar: 'أكثر من 5 أيام؟', en: 'More than 5 days?', fr: 'Plus de 5 jours?' }, x: 850, y: 300, color: 'bg-orange-500', field: 'days', operator: 'greaterThan', value: '5' },
      { id: 5, type: 'approval', label: { ar: 'موافقة الموارد البشرية', en: 'HR Approval', fr: 'Approbation RH' }, x: 1100, y: 200, color: 'bg-yellow-500', approvalType: 'role', role: 'hr_manager' },
      { id: 6, type: 'email', label: { ar: 'إشعار الموافقة', en: 'Approval Notification', fr: 'Notification approbation' }, x: 1100, y: 400, color: 'bg-blue-500' },
      { id: 7, type: 'end', label: { ar: 'نهاية', en: 'End', fr: 'Fin' }, x: 1350, y: 300, color: 'bg-red-500' }
    ],
    connections: [
      { from: 1, to: 2, type: 'forward', action: 'forward', label: 'Start', color: '#3b82f6', icon: '→' },
      { from: 2, to: 3, type: 'forward', action: 'forward', label: 'Submit', color: '#3b82f6', icon: '→' },
      { from: 3, to: 4, type: 'forward', action: 'approve', label: 'Approve', color: '#10b981', icon: '✓' },
      { from: 3, to: 2, type: 'reject', action: 'reject', label: 'Reject', color: '#ef4444', icon: '✕' },
      { from: 4, to: 5, type: 'forward', action: 'forward', label: 'Yes', color: '#10b981', icon: '✓' },
      { from: 4, to: 6, type: 'forward', action: 'forward', label: 'No', color: '#ef4444', icon: '✕' },
      { from: 5, to: 7, type: 'forward', action: 'approve', label: 'Approve', color: '#10b981', icon: '✓' },
      { from: 6, to: 7, type: 'forward', action: 'forward', label: 'Done', color: '#3b82f6', icon: '→' }
    ]
  },
  {
    id: 'adhoc-manual',
    nameAr: 'توجيه مرن يدوي',
    nameEn: 'Ad-hoc Manual Routing',
    nameFr: 'Routage manuel ad-hoc',
    icon: '🔀',
    color: 'orange',
    category: 'general',
    description: { ar: 'سير عمل مرن حيث يختار المستخدم المستلم التالي يدوياً', en: 'Flexible workflow where user manually selects next recipient', fr: 'Flux flexible où l\'utilisateur sélectionne manuellement' },
    nodes: [
      { id: 1, type: 'start', label: { ar: 'بداية', en: 'Start', fr: 'Début' }, x: 100, y: 300, color: 'bg-green-500' },
      { id: 2, type: 'form', label: { ar: 'تعبئة النموذج', en: 'Fill Form', fr: 'Remplir formulaire' }, x: 350, y: 300, color: 'bg-purple-500' },
      { id: 3, type: 'adhoc', label: { ar: 'اختيار المستلم', en: 'Select Recipient', fr: 'Sélectionner destinataire' }, x: 600, y: 300, color: 'bg-gray-500', adhocType: 'manual' },
      { id: 4, type: 'end', label: { ar: 'نهاية', en: 'End', fr: 'Fin' }, x: 850, y: 300, color: 'bg-red-500' }
    ],
    connections: [
      { from: 1, to: 2, type: 'forward', action: 'forward', label: 'Start', color: '#3b82f6', icon: '→' },
      { from: 2, to: 3, type: 'forward', action: 'forward', label: 'Submit', color: '#3b82f6', icon: '→' },
      { from: 3, to: 4, type: 'forward', action: 'forward', label: 'Done', color: '#3b82f6', icon: '→' }
    ]
  },
  {
    id: 'adhoc-hierarchical',
    nameAr: 'توجيه مرن تلقائي',
    nameEn: 'Ad-hoc Hierarchical Routing',
    nameFr: 'Routage hiérarchique ad-hoc',
    icon: '📊',
    color: 'green',
    category: 'general',
    description: { ar: 'توجيه تلقائي للمدير المباشر بناء على الهيكل التنظيمي', en: 'Automatic routing to direct manager based on org hierarchy', fr: 'Routage automatique vers gestionnaire direct' },
    nodes: [
      { id: 1, type: 'start', label: { ar: 'بداية', en: 'Start', fr: 'Début' }, x: 100, y: 300, color: 'bg-green-500' },
      { id: 2, type: 'form', label: { ar: 'تعبئة النموذج', en: 'Fill Form', fr: 'Remplir formulaire' }, x: 350, y: 300, color: 'bg-purple-500' },
      { id: 3, type: 'adhoc', label: { ar: 'توجيه تلقائي', en: 'Auto Route', fr: 'Routage auto' }, x: 600, y: 300, color: 'bg-gray-500', adhocType: 'hierarchical' },
      { id: 4, type: 'end', label: { ar: 'نهاية', en: 'End', fr: 'Fin' }, x: 850, y: 300, color: 'bg-red-500' }
    ],
    connections: [
      { from: 1, to: 2, type: 'forward', action: 'forward', label: 'Start', color: '#3b82f6', icon: '→' },
      { from: 2, to: 3, type: 'forward', action: 'forward', label: 'Submit', color: '#3b82f6', icon: '→' },
      { from: 3, to: 4, type: 'forward', action: 'forward', label: 'Done', color: '#3b82f6', icon: '→' }
    ]
  },
  {
    id: 'purchase-request',
    nameAr: 'طلب شراء',
    nameEn: 'Purchase Request',
    nameFr: 'Demande d\'achat',
    icon: '🛒',
    color: 'purple',
    category: 'finance',
    description: { ar: 'طلب شراء مع موافقة مالية للمبالغ الكبيرة', en: 'Purchase request with finance approval for large amounts', fr: 'Demande d\'achat avec approbation financière' },
    nodes: [
      { id: 1, type: 'start', label: { ar: 'بداية', en: 'Start', fr: 'Début' }, x: 100, y: 300, color: 'bg-green-500' },
      { id: 2, type: 'form', label: { ar: 'تفاصيل الطلب', en: 'Request Details', fr: 'Détails demande' }, x: 350, y: 300, color: 'bg-purple-500', formFields: ['item', 'quantity', 'amount', 'justification'] },
      { id: 3, type: 'approval', label: { ar: 'موافقة المدير', en: 'Manager Approval', fr: 'Approbation gestionnaire' }, x: 600, y: 300, color: 'bg-yellow-500', approvalType: 'role', role: 'direct_manager' },
      { id: 4, type: 'conditional', label: { ar: 'فحص المبلغ', en: 'Check Amount', fr: 'Vérifier montant' }, x: 850, y: 300, color: 'bg-orange-500', field: 'amount', operator: 'greaterThan', value: '5000' },
      { id: 5, type: 'approval', label: { ar: 'موافقة المالية', en: 'Finance Approval', fr: 'Approbation finance' }, x: 1100, y: 200, color: 'bg-yellow-500', approvalType: 'role', role: 'finance_manager' },
      { id: 6, type: 'email', label: { ar: 'إشعار', en: 'Notification', fr: 'Notification' }, x: 1100, y: 400, color: 'bg-blue-500' },
      { id: 7, type: 'end', label: { ar: 'نهاية', en: 'End', fr: 'Fin' }, x: 1350, y: 300, color: 'bg-red-500' }
    ],
    connections: [
      { from: 1, to: 2, type: 'forward', action: 'forward', label: 'Start', color: '#3b82f6', icon: '→' },
      { from: 2, to: 3, type: 'forward', action: 'forward', label: 'Submit', color: '#3b82f6', icon: '→' },
      { from: 3, to: 4, type: 'forward', action: 'approve', label: 'Approve', color: '#10b981', icon: '✓' },
      { from: 3, to: 2, type: 'reject', action: 'reject', label: 'Reject', color: '#ef4444', icon: '✕' },
      { from: 4, to: 5, type: 'forward', action: 'forward', label: 'More than 5000', color: '#3b82f6', icon: '?' },
      { from: 4, to: 6, type: 'forward', action: 'forward', label: 'Less than 5000', color: '#3b82f6', icon: '?' },
      { from: 5, to: 7, type: 'forward', action: 'approve', label: 'Approve', color: '#10b981', icon: '✓' },
      { from: 6, to: 7, type: 'forward', action: 'forward', label: 'Done', color: '#3b82f6', icon: '→' }
    ]
  },
  {
    id: 'permission-request',
    nameAr: 'طلب تصريح استئذان',
    nameEn: 'Permission Request',
    nameFr: 'Demande de permission',
    icon: '🕐',
    color: 'teal',
    category: 'hr',
    description: { ar: 'طلب استئذان لساعات معدودة', en: 'Permission request for few hours', fr: 'Demande de permission pour quelques heures' },
    nodes: [
      { id: 1, type: 'start', label: { ar: 'بداية', en: 'Start', fr: 'Début' }, x: 100, y: 300, color: 'bg-green-500' },
      { id: 2, type: 'form', label: { ar: 'تعبئة الطلب', en: 'Fill Request', fr: 'Remplir demande' }, x: 350, y: 300, color: 'bg-purple-500', formFields: ['date', 'fromTime', 'toTime', 'reason'] },
      { id: 3, type: 'approval', label: { ar: 'موافقة المدير', en: 'Manager Approval', fr: 'Approbation' }, x: 600, y: 300, color: 'bg-yellow-500', approvalType: 'role', role: 'direct_manager' },
      { id: 4, type: 'email', label: { ar: 'إشعار', en: 'Notification', fr: 'Notification' }, x: 850, y: 300, color: 'bg-blue-500' },
      { id: 5, type: 'end', label: { ar: 'نهاية', en: 'End', fr: 'Fin' }, x: 1100, y: 300, color: 'bg-red-500' }
    ],
    connections: [
      { from: 1, to: 2, type: 'forward', action: 'forward', label: 'Start', color: '#3b82f6', icon: '→' },
      { from: 2, to: 3, type: 'forward', action: 'forward', label: 'Submit', color: '#3b82f6', icon: '→' },
      { from: 3, to: 4, type: 'forward', action: 'approve', label: 'Approve', color: '#10b981', icon: '✓' },
      { from: 3, to: 2, type: 'reject', action: 'reject', label: 'Reject', color: '#ef4444', icon: '✕' },
      { from: 4, to: 5, type: 'forward', action: 'forward', label: 'Done', color: '#3b82f6', icon: '→' }
    ]
  },
  {
    id: 'blank',
    nameAr: 'سير عمل فارغ',
    nameEn: 'Blank Workflow',
    nameFr: 'Flux de travail vierge',
    icon: '📄',
    color: 'gray',
    category: 'general',
    description: { ar: 'ابدأ من الصفر وقم ببناء سير العمل الخاص بك', en: 'Start from scratch and build your own workflow', fr: 'Commencer de zéro et créer votre flux' },
    nodes: [
      { id: 1, type: 'start', label: { ar: 'بداية', en: 'Start', fr: 'Début' }, x: 100, y: 300, color: 'bg-green-500' },
      { id: 2, type: 'end', label: { ar: 'نهاية', en: 'End', fr: 'Fin' }, x: 600, y: 300, color: 'bg-red-500' }
    ],
    connections: []
  }
];

// ============================================
// 📊 CONNECTION TYPES
// ============================================

export const CONNECTION_TYPES = [
  {
    type: 'forward',
    label: { ar: 'متابعة', en: 'Forward', fr: 'Transférer' },
    color: '#3b82f6',
    icon: '→',
    style: 'solid',
    description: { ar: 'الانتقال إلى الخطوة التالية', en: 'Move to next step', fr: 'Passer à l\'étape suivante' }
  },
  {
    type: 'reject',
    label: { ar: 'رفض', en: 'Reject', fr: 'Rejeter' },
    color: '#ef4444',
    icon: '✕',
    style: 'dashed',
    description: { ar: 'رفض والعودة للمرسل', en: 'Reject and return to sender', fr: 'Rejeter et retourner à l\'expéditeur' }
  },
  {
    type: 'approve',
    label: { ar: 'موافقة', en: 'Approve', fr: 'Approuver' },
    color: '#10b981',
    icon: '✓',
    style: 'solid',
    description: { ar: 'الموافقة والمتابعة', en: 'Approve and continue', fr: 'Approuver et continuer' }
  }
];

// ============================================
// 🎨 WORKFLOW CATEGORIES
// ============================================

export const WORKFLOW_CATEGORIES = [
  {
    id: 'all',
    label: { ar: 'الكل', en: 'All', fr: 'Tout' },
    icon: '📋',
    color: 'text-gray-600'
  },
  {
    id: 'hr',
    label: { ar: 'الموارد البشرية', en: 'Human Resources', fr: 'Ressources Humaines' },
    icon: '👥',
    color: 'text-blue-600'
  },
  {
    id: 'finance',
    label: { ar: 'المالية', en: 'Finance', fr: 'Finance' },
    icon: '💰',
    color: 'text-green-600'
  },
  {
    id: 'general',
    label: { ar: 'عام', en: 'General', fr: 'Général' },
    icon: '⚙️',
    color: 'text-purple-600'
  }
];

// ============================================
// 🔧 UTILITY FUNCTIONS
// ============================================

export function getNodeType(typeId) {
  return NODE_TYPES.find(nt => nt.id === typeId) || null;
}

export function getOrgRole(roleId) {
  return ORGANIZATIONAL_ROLES.find(r => r.id === roleId) || null;
}

export function getWorkflowTemplate(templateId) {
  return WORKFLOW_TEMPLATES.find(t => t.id === templateId) || null;
}

export function getTemplatesByCategory(categoryId) {
  if (categoryId === 'all') return WORKFLOW_TEMPLATES.filter(t => t.id !== 'blank');
  return WORKFLOW_TEMPLATES.filter(t => t.category === categoryId && t.id !== 'blank');
}

export function getAdhocRoutingType(typeId) {
  return ADHOC_ROUTING_TYPES.find(t => t.id === typeId) || null;
}

export function supportsOrgRoles(typeId) {
  const nodeType = getNodeType(typeId);
  return nodeType?.supportsRoles === true;
}

export function isSystemNode(typeId) {
  const nodeType = getNodeType(typeId);
  return nodeType?.isSystem === true;
}

export function validateWorkflowStructure(nodes, connections) {
  const errors = [];
  
  const hasStart = nodes.some(n => n.type === 'start');
  if (!hasStart) {
    errors.push({
      ar: 'يجب أن يحتوي سير العمل على نقطة بداية',
      en: 'Workflow must have a start node',
      fr: 'Le flux doit avoir un nœud de départ'
    });
  }
  
  const hasEnd = nodes.some(n => n.type === 'end');
  if (!hasEnd) {
    errors.push({
      ar: 'يجب أن يحتوي سير العمل على نقطة نهاية',
      en: 'Workflow must have an end node',
      fr: 'Le flux doit avoir un nœud de fin'
    });
  }
  
  nodes.forEach(node => {
    if (node.type === 'start') return;
    const hasIncoming = connections.some(c => c.to === node.id);
    const hasOutgoing = connections.some(c => c.from === node.id);
    
    if (!hasIncoming && node.type !== 'start') {
      errors.push({
        ar: `العقدة "${node.label?.ar || node.label?.en}" غير متصلة`,
        en: `Node "${node.label?.en || 'Unnamed'}" has no incoming connections`,
        fr: `Le nœud "${node.label?.fr || node.label?.en}" n'a pas de connexions entrantes`
      });
    }
    
    if (!hasOutgoing && node.type !== 'end') {
      errors.push({
        ar: `العقدة "${node.label?.ar || node.label?.en}" غير متصلة بالخطوة التالية`,
        en: `Node "${node.label?.en || 'Unnamed'}" has no outgoing connections`,
        fr: `Le nœud "${node.label?.fr || node.label?.en}" n'a pas de connexions sortantes`
      });
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export default {
  NODE_TYPES,
  ORGANIZATIONAL_ROLES,
  ADHOC_ROUTING_TYPES,
  CONDITION_TYPES,
  ACTION_TYPES,
  WORKFLOW_TEMPLATES,
  CONNECTION_TYPES,
  WORKFLOW_CATEGORIES,
  getNodeType,
  getOrgRole,
  getWorkflowTemplate,
  getTemplatesByCategory,
  getAdhocRoutingType,
  supportsOrgRoles,
  isSystemNode,
  validateWorkflowStructure
};