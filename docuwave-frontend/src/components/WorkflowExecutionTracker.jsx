import React, { useState } from 'react';
import { 
  Activity, Clock, CheckCircle, XCircle, AlertCircle, User, 
  FileText, Filter, Search, Calendar, ArrowRight, MoreVertical,
  Play, Pause, RotateCcw, Eye, Download, MessageSquare, X,
  TrendingUp, Users, Workflow, BarChart3
} from 'lucide-react';

// This component is now integrated into DocuWave system
// Can be imported in DocuWaveSystem.jsx and added to the Sidebar navigation

/**
 * 🎯 WORKFLOW EXECUTION TRACKER
 * ============================
 * Real-time workflow monitoring and tracking system
 * Features:
 * - Active workflow instances
 * - Progress tracking
 * - Approval status
 * - Timeline view
 * - Performance metrics
 * - Search & filters
 */

// Mock workflow instances data
const mockWorkflowInstances = [
  {
    id: 'WF-2025-001',
    workflowName: { ar: 'طلب إجازة', en: 'Leave Request', fr: 'Demande de congé' },
    documentName: 'Leave_Request_Ahmed.pdf',
    initiator: { name: 'Ahmed Mohamed', email: 'ahmed@company.com', avatar: 'AM' },
    status: 'in_progress',
    currentStep: { ar: 'موافقة المدير', en: 'Manager Approval', fr: 'Approbation gestionnaire' },
    currentApprover: { name: 'Fatima Ali', email: 'fatima@company.com' },
    progress: 50,
    startedAt: '2025-11-06T09:00:00',
    priority: 'high',
    steps: [
      { id: 1, name: 'Form Submission', status: 'completed', completedAt: '2025-11-06T09:00:00', user: 'Ahmed Mohamed' },
      { id: 2, name: 'Manager Approval', status: 'pending', assignedTo: 'Fatima Ali' },
      { id: 3, name: 'HR Review', status: 'waiting', assignedTo: 'HR Manager' },
      { id: 4, name: 'Final Notification', status: 'waiting' }
    ],
    metadata: { days: 5, startDate: '2025-11-10', endDate: '2025-11-14' }
  },
  {
    id: 'WF-2025-002',
    workflowName: { ar: 'طلب شراء', en: 'Purchase Request', fr: "Demande d'achat" },
    documentName: 'Purchase_Order_1234.pdf',
    initiator: { name: 'Sara Ahmed', email: 'sara@company.com', avatar: 'SA' },
    status: 'completed',
    currentStep: { ar: 'مكتمل', en: 'Completed', fr: 'Terminé' },
    progress: 100,
    startedAt: '2025-11-05T14:30:00',
    completedAt: '2025-11-06T10:15:00',
    priority: 'medium',
    steps: [
      { id: 1, name: 'Request Submission', status: 'completed', completedAt: '2025-11-05T14:30:00', user: 'Sara Ahmed' },
      { id: 2, name: 'Manager Approval', status: 'completed', completedAt: '2025-11-05T16:00:00', user: 'Omar Hassan' },
      { id: 3, name: 'Finance Review', status: 'completed', completedAt: '2025-11-06T09:00:00', user: 'Layla Mahmoud' },
      { id: 4, name: 'Procurement', status: 'completed', completedAt: '2025-11-06T10:15:00', user: 'System' }
    ],
    metadata: { amount: 5000, vendor: 'Acme Supplies' }
  },
  {
    id: 'WF-2025-003',
    workflowName: { ar: 'استئذان', en: 'Permission Request', fr: 'Demande permission' },
    documentName: 'Permission_Request.pdf',
    initiator: { name: 'Mohamed Khaled', email: 'mohamed@company.com', avatar: 'MK' },
    status: 'rejected',
    currentStep: { ar: 'مرفوض', en: 'Rejected', fr: 'Rejeté' },
    progress: 50,
    startedAt: '2025-11-06T08:00:00',
    completedAt: '2025-11-06T11:30:00',
    priority: 'low',
    steps: [
      { id: 1, name: 'Submit Request', status: 'completed', completedAt: '2025-11-06T08:00:00', user: 'Mohamed Khaled' },
      { id: 2, name: 'Manager Review', status: 'rejected', completedAt: '2025-11-06T11:30:00', user: 'Fatima Ali', comment: 'Insufficient notice period' }
    ],
    metadata: { hours: 3, date: '2025-11-07' }
  },
  {
    id: 'WF-2025-004',
    workflowName: { ar: 'طلب إجازة', en: 'Leave Request', fr: 'Demande de congé' },
    documentName: 'Leave_Request_Nour.pdf',
    initiator: { name: 'Nour Aldeen', email: 'nour@company.com', avatar: 'NA' },
    status: 'in_progress',
    currentStep: { ar: 'مراجعة HR', en: 'HR Review', fr: 'Révision RH' },
    currentApprover: { name: 'HR Manager', email: 'hr@company.com' },
    progress: 75,
    startedAt: '2025-11-05T10:00:00',
    priority: 'high',
    steps: [
      { id: 1, name: 'Form Submission', status: 'completed', completedAt: '2025-11-05T10:00:00', user: 'Nour Aldeen' },
      { id: 2, name: 'Manager Approval', status: 'completed', completedAt: '2025-11-05T15:00:00', user: 'Youssef Ibrahim' },
      { id: 3, name: 'HR Review', status: 'pending', assignedTo: 'HR Manager' },
      { id: 4, name: 'Final Notification', status: 'waiting' }
    ],
    metadata: { days: 10, startDate: '2025-12-01', endDate: '2025-12-10' }
  }
];

function WorkflowExecutionTracker() {
  const [language, setLanguage] = useState('en');
  const [instances, setInstances] = useState(mockWorkflowInstances);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInstance, setSelectedInstance] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'timeline'

  const getText = (obj) => {
    if (typeof obj === 'string') return obj;
    return obj?.[language] || obj?.en || '';
  };

  // Calculate stats
  const stats = {
    total: instances.length,
    inProgress: instances.filter(i => i.status === 'in_progress').length,
    completed: instances.filter(i => i.status === 'completed').length,
    rejected: instances.filter(i => i.status === 'rejected').length,
    avgCompletionTime: '1.5d' // Mock calculation
  };

  // Filter instances
  const filteredInstances = instances.filter(instance => {
    const matchesSearch = !searchQuery || 
      instance.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getText(instance.workflowName).toLowerCase().includes(searchQuery.toLowerCase()) ||
      instance.documentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      instance.initiator.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || instance.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get status badge
  const getStatusBadge = (status) => {
    const badges = {
      in_progress: {
        icon: Activity,
        label: { ar: 'قيد التنفيذ', en: 'In Progress', fr: 'En cours' },
        color: 'bg-blue-100 text-blue-700 border-blue-200'
      },
      completed: {
        icon: CheckCircle,
        label: { ar: 'مكتمل', en: 'Completed', fr: 'Terminé' },
        color: 'bg-green-100 text-green-700 border-green-200'
      },
      rejected: {
        icon: XCircle,
        label: { ar: 'مرفوض', en: 'Rejected', fr: 'Rejeté' },
        color: 'bg-red-100 text-red-700 border-red-200'
      },
      paused: {
        icon: Pause,
        label: { ar: 'متوقف', en: 'Paused', fr: 'En pause' },
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200'
      }
    };
    return badges[status] || badges.in_progress;
  };

  // Get priority badge
  const getPriorityBadge = (priority) => {
    const badges = {
      high: { label: { ar: 'عالي', en: 'High', fr: 'Haute' }, color: 'bg-red-50 text-red-600' },
      medium: { label: { ar: 'متوسط', en: 'Medium', fr: 'Moyen' }, color: 'bg-yellow-50 text-yellow-600' },
      low: { label: { ar: 'منخفض', en: 'Low', fr: 'Basse' }, color: 'bg-gray-50 text-gray-600' }
    };
    return badges[priority] || badges.medium;
  };

  // Format date
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  // Calculate duration
  const getDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const hours = Math.floor((end - start) / (1000 * 60 * 60));
    
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Activity className="w-7 h-7 text-white" />
              </div>
              {getText({ ar: 'متابعة سير العمل', en: 'Workflow Tracker', fr: 'Suivi des flux' })}
            </h1>
            <p className="text-gray-600">
              {getText({ ar: 'راقب وتابع حالة سير العمل في الوقت الفعلي', en: 'Monitor and track workflow status in real-time', fr: 'Surveillez les flux en temps réel' })}
            </p>
          </div>

          <select value={language} onChange={(e) => setLanguage(e.target.value)} 
            className="px-3 py-2 border-2 border-gray-200 rounded-lg bg-white">
            <option value="en">English</option>
            <option value="ar">العربية</option>
            <option value="fr">Français</option>
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl border-2 border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{getText({ ar: 'إجمالي', en: 'Total', fr: 'Total' })}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                <Workflow className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{getText({ ar: 'قيد التنفيذ', en: 'In Progress', fr: 'En cours' })}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-600 animate-pulse" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{getText({ ar: 'مكتمل', en: 'Completed', fr: 'Terminés' })}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{getText({ ar: 'مرفوض', en: 'Rejected', fr: 'Rejetés' })}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{getText({ ar: 'متوسط المدة', en: 'Avg Time', fr: 'Temps moy.' })}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgCompletionTime}</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[300px] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={getText({ ar: 'بحث...', en: 'Search...', fr: 'Rechercher...' })}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
              />
            </div>

            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none font-medium text-sm"
            >
              <option value="all">{getText({ ar: 'جميع الحالات', en: 'All Status', fr: 'Tous statuts' })}</option>
              <option value="in_progress">{getText({ ar: 'قيد التنفيذ', en: 'In Progress', fr: 'En cours' })}</option>
              <option value="completed">{getText({ ar: 'مكتمل', en: 'Completed', fr: 'Terminé' })}</option>
              <option value="rejected">{getText({ ar: 'مرفوض', en: 'Rejected', fr: 'Rejeté' })}</option>
            </select>

            <div className="flex gap-1 border-2 border-gray-200 rounded-xl p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                {getText({ ar: 'قائمة', en: 'List', fr: 'Liste' })}
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-3 py-2 rounded-lg transition-all ${viewMode === 'timeline' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                {getText({ ar: 'خط زمني', en: 'Timeline', fr: 'Chronologie' })}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Instances List */}
      <div className="space-y-4">
        {filteredInstances.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-gray-100 p-12 text-center">
            <Activity className="w-16 h-16 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-600 font-medium">
              {getText({ ar: 'لا توجد سير عمل', en: 'No workflows found', fr: 'Aucun flux trouvé' })}
            </p>
          </div>
        ) : (
          filteredInstances.map(instance => {
            const statusBadge = getStatusBadge(instance.status);
            const priorityBadge = getPriorityBadge(instance.priority);
            const StatusIcon = statusBadge.icon;

            return (
              <div key={instance.id} className="bg-white rounded-2xl border-2 border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b-2 border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {/* Workflow Icon */}
                      <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                        <Workflow className="w-6 h-6 text-green-600" />
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900">{getText(instance.workflowName)}</h3>
                          <span className="text-xs text-gray-500">#{instance.id}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityBadge.color}`}>
                            {getText(priorityBadge.label)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            <span>{instance.documentName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{instance.initiator.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatDate(instance.startedAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border-2 ${statusBadge.color}`}>
                        <StatusIcon className="w-4 h-4" />
                        {getText(statusBadge.label)}
                      </span>
                      <button 
                        onClick={() => setSelectedInstance(selectedInstance?.id === instance.id ? null : instance)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="px-4 py-3 bg-gray-50">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {getText({ ar: 'التقدم', en: 'Progress', fr: 'Progrès' })}
                    </span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          instance.status === 'completed' ? 'bg-green-500' :
                          instance.status === 'rejected' ? 'bg-red-500' :
                          'bg-blue-500'
                        }`}
                        style={{ width: `${instance.progress}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-gray-700">{instance.progress}%</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span>{getText({ ar: 'الخطوة الحالية:', en: 'Current:', fr: 'Actuelle:' })}</span>
                    <span className="font-medium">{getText(instance.currentStep)}</span>
                    {instance.currentApprover && (
                      <>
                        <ArrowRight className="w-3 h-3" />
                        <span>{instance.currentApprover.name}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Steps Timeline */}
                {selectedInstance?.id === instance.id && (
                  <div className="p-4 border-t-2 border-gray-100">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      {getText({ ar: 'الخطوات', en: 'Steps', fr: 'Étapes' })}
                    </h4>
                    
                    <div className="space-y-4">
                      {instance.steps.map((step, idx) => (
                        <div key={step.id} className="flex items-start gap-4">
                          {/* Timeline */}
                          <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                              step.status === 'completed' ? 'bg-green-50 border-green-500' :
                              step.status === 'rejected' ? 'bg-red-50 border-red-500' :
                              step.status === 'pending' ? 'bg-blue-50 border-blue-500 animate-pulse' :
                              'bg-gray-50 border-gray-300'
                            }`}>
                              {step.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-600" />}
                              {step.status === 'rejected' && <XCircle className="w-5 h-5 text-red-600" />}
                              {step.status === 'pending' && <Clock className="w-5 h-5 text-blue-600" />}
                              {step.status === 'waiting' && <AlertCircle className="w-5 h-5 text-gray-400" />}
                            </div>
                            {idx < instance.steps.length - 1 && (
                              <div className={`w-0.5 h-12 ${
                                step.status === 'completed' ? 'bg-green-300' : 'bg-gray-200'
                              }`} />
                            )}
                          </div>

                          {/* Step Info */}
                          <div className="flex-1 pb-4">
                            <div className="flex items-start justify-between mb-1">
                              <div>
                                <p className="font-medium text-gray-900">{step.name}</p>
                                {step.assignedTo && (
                                  <p className="text-sm text-gray-600">
                                    {getText({ ar: 'معين إلى:', en: 'Assigned to:', fr: 'Assigné à:' })} {step.assignedTo}
                                  </p>
                                )}
                                {step.user && (
                                  <p className="text-sm text-gray-600">
                                    {getText({ ar: 'بواسطة:', en: 'By:', fr: 'Par:' })} {step.user}
                                  </p>
                                )}
                              </div>
                              {step.completedAt && (
                                <span className="text-xs text-gray-500">{formatDate(step.completedAt)}</span>
                              )}
                            </div>
                            {step.comment && (
                              <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
                                <MessageSquare className="w-4 h-4 inline mr-1" />
                                {step.comment}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Metadata */}
                    {instance.metadata && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs font-semibold text-gray-600 mb-2">
                          {getText({ ar: 'معلومات إضافية', en: 'Additional Info', fr: 'Infos supplémentaires' })}
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {Object.entries(instance.metadata).map(([key, value]) => (
                            <div key={key}>
                              <span className="text-gray-600">{key}:</span>{' '}
                              <span className="font-medium text-gray-900">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-4 flex gap-2">
                      <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                        <Eye className="w-4 h-4" />
                        {getText({ ar: 'عرض', en: 'View', fr: 'Voir' })}
                      </button>
                      <button className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                        <Download className="w-4 h-4" />
                        {getText({ ar: 'تنزيل', en: 'Download', fr: 'Télécharger' })}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default WorkflowExecutionTracker;