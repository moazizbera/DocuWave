import React, { useState } from 'react';
import { 
  BarChart3, TrendingUp, TrendingDown, Users, FileText, Clock, 
  CheckCircle, XCircle, Calendar, Filter, Download, RefreshCw,
  Activity, PieChart, ArrowUpRight, ArrowDownRight, Eye
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

/**
 * 📊 ADVANCED ANALYTICS DASHBOARD
 * ===============================
 * Beautiful analytics with interactive charts
 * Features:
 * - Document processing trends
 * - Workflow performance metrics
 * - User activity analytics
 * - Real-time KPIs
 * - Interactive visualizations
 */

// Mock analytics data
const documentTrendsData = [
  { month: 'Jan', processed: 245, pending: 12, failed: 5 },
  { month: 'Feb', processed: 289, pending: 8, failed: 3 },
  { month: 'Mar', processed: 312, pending: 15, failed: 7 },
  { month: 'Apr', processed: 378, pending: 10, failed: 4 },
  { month: 'May', processed: 423, pending: 18, failed: 6 },
  { month: 'Jun', processed: 456, pending: 14, failed: 8 },
  { month: 'Jul', processed: 502, pending: 11, failed: 5 },
  { month: 'Aug', processed: 548, pending: 16, failed: 9 },
  { month: 'Sep', processed: 589, pending: 13, failed: 6 },
  { month: 'Oct', processed: 634, pending: 19, failed: 7 },
  { month: 'Nov', processed: 687, pending: 22, failed: 10 }
];

const workflowPerformanceData = [
  { workflow: 'Leave Request', avgTime: 1.2, completed: 145, success: 95 },
  { workflow: 'Purchase Order', avgTime: 2.5, completed: 89, success: 87 },
  { workflow: 'Invoice Processing', avgTime: 3.1, completed: 234, success: 92 },
  { workflow: 'Contract Review', avgTime: 5.4, completed: 67, success: 89 },
  { workflow: 'Expense Report', avgTime: 1.8, completed: 178, success: 94 }
];

const documentTypeDistribution = [
  { name: 'Invoices', value: 450, color: '#3b82f6' },
  { name: 'Contracts', value: 280, color: '#10b981' },
  { name: 'Receipts', value: 320, color: '#f59e0b' },
  { name: 'Reports', value: 190, color: '#8b5cf6' },
  { name: 'Others', value: 140, color: '#6b7280' }
];

const userActivityData = [
  { user: 'Ahmed M.', documents: 89, workflows: 45, efficiency: 92 },
  { user: 'Fatima A.', documents: 76, workflows: 38, efficiency: 88 },
  { user: 'Sara A.', documents: 95, workflows: 52, efficiency: 95 },
  { user: 'Omar H.', documents: 67, workflows: 34, efficiency: 85 },
  { user: 'Youssef I.', documents: 81, workflows: 41, efficiency: 90 }
];

const processingTimeData = [
  { time: '< 1h', count: 450 },
  { time: '1-2h', count: 320 },
  { time: '2-4h', count: 180 },
  { time: '4-8h', count: 95 },
  { time: '> 8h', count: 45 }
];

const weeklyActivityData = [
  { day: 'Mon', uploads: 145, processed: 142, workflows: 67 },
  { day: 'Tue', uploads: 178, processed: 175, workflows: 82 },
  { day: 'Wed', uploads: 162, processed: 159, workflows: 74 },
  { day: 'Thu', uploads: 189, processed: 185, workflows: 89 },
  { day: 'Fri', uploads: 134, processed: 130, workflows: 62 },
  { day: 'Sat', uploads: 45, processed: 43, workflows: 21 },
  { day: 'Sun', uploads: 23, processed: 22, workflows: 11 }
];

function AdvancedAnalyticsDashboard() {
  const [language, setLanguage] = useState('en');
  const [timeRange, setTimeRange] = useState('month');
  const [activeChart, setActiveChart] = useState('trends');

  const getText = (obj) => {
    if (typeof obj === 'string') return obj;
    return obj?.[language] || obj?.en || '';
  };

  // Calculate KPIs
  const kpis = {
    totalDocuments: documentTrendsData.reduce((sum, d) => sum + d.processed, 0),
    avgProcessingTime: '2.4h',
    successRate: 94,
    activeWorkflows: 156,
    monthlyGrowth: 12.5,
    avgResponseTime: '45m'
  };

  // Chart components
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-semibold text-gray-900 mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <strong>{entry.value}</strong>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              {getText({ ar: 'لوحة التحليلات المتقدمة', en: 'Advanced Analytics', fr: 'Analytiques avancées' })}
            </h1>
            <p className="text-gray-600">
              {getText({ ar: 'رؤى تفصيلية حول الأداء والاتجاهات', en: 'Detailed insights into performance and trends', fr: 'Aperçus détaillés des performances' })}
            </p>
          </div>

          <div className="flex gap-3">
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg bg-white"
            >
              <option value="week">{getText({ ar: 'أسبوع', en: 'Week', fr: 'Semaine' })}</option>
              <option value="month">{getText({ ar: 'شهر', en: 'Month', fr: 'Mois' })}</option>
              <option value="quarter">{getText({ ar: 'ربع', en: 'Quarter', fr: 'Trimestre' })}</option>
              <option value="year">{getText({ ar: 'سنة', en: 'Year', fr: 'Année' })}</option>
            </select>

            <select value={language} onChange={(e) => setLanguage(e.target.value)} 
              className="px-3 py-2 border-2 border-gray-200 rounded-lg bg-white">
              <option value="en">English</option>
              <option value="ar">العربية</option>
              <option value="fr">Français</option>
            </select>

            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
              <Download className="w-4 h-4" />
              {getText({ ar: 'تصدير', en: 'Export', fr: 'Exporter' })}
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-xl border-2 border-gray-100 p-4 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <ArrowUpRight className="w-3 h-3" />
                {kpis.monthlyGrowth}%
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-1">{getText({ ar: 'إجمالي المستندات', en: 'Total Documents', fr: 'Total documents' })}</p>
            <p className="text-2xl font-bold text-gray-900">{kpis.totalDocuments.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-100 p-4 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-1">{getText({ ar: 'متوسط المعالجة', en: 'Avg Processing', fr: 'Traitement moy.' })}</p>
            <p className="text-2xl font-bold text-gray-900">{kpis.avgProcessingTime}</p>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-100 p-4 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <ArrowUpRight className="w-3 h-3" />
                2.3%
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-1">{getText({ ar: 'معدل النجاح', en: 'Success Rate', fr: 'Taux de réussite' })}</p>
            <p className="text-2xl font-bold text-gray-900">{kpis.successRate}%</p>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-100 p-4 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-orange-600 animate-pulse" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-1">{getText({ ar: 'سير عمل نشط', en: 'Active Workflows', fr: 'Flux actifs' })}</p>
            <p className="text-2xl font-bold text-gray-900">{kpis.activeWorkflows}</p>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-100 p-4 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-1">{getText({ ar: 'متوسط الاستجابة', en: 'Avg Response', fr: 'Réponse moy.' })}</p>
            <p className="text-2xl font-bold text-gray-900">{kpis.avgResponseTime}</p>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-100 p-4 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-1">{getText({ ar: 'مستخدمون نشطون', en: 'Active Users', fr: 'Utilisateurs actifs' })}</p>
            <p className="text-2xl font-bold text-gray-900">48</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Document Trends Chart */}
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              {getText({ ar: 'اتجاهات المستندات', en: 'Document Trends', fr: 'Tendances documents' })}
            </h3>
            <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              {getText({ ar: 'عرض التفاصيل', en: 'View Details', fr: 'Voir détails' })}
            </button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={documentTrendsData}>
              <defs>
                <linearGradient id="colorProcessed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#888" style={{ fontSize: '12px' }} />
              <YAxis stroke="#888" style={{ fontSize: '12px' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Area type="monotone" dataKey="processed" stroke="#3b82f6" fillOpacity={1} fill="url(#colorProcessed)" name="Processed" />
              <Area type="monotone" dataKey="pending" stroke="#f59e0b" fillOpacity={1} fill="url(#colorPending)" name="Pending" />
              <Area type="monotone" dataKey="failed" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} name="Failed" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Document Type Distribution */}
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-indigo-600" />
              {getText({ ar: 'توزيع أنواع المستندات', en: 'Document Types', fr: 'Types de documents' })}
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPie>
              <Pie
                data={documentTypeDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {documentTypeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPie>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Workflow Performance */}
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              {getText({ ar: 'أداء سير العمل', en: 'Workflow Performance', fr: 'Performance des flux' })}
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={workflowPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="workflow" stroke="#888" style={{ fontSize: '11px' }} angle={-15} textAnchor="end" height={80} />
              <YAxis stroke="#888" style={{ fontSize: '12px' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="completed" fill="#3b82f6" name="Completed" radius={[8, 8, 0, 0]} />
              <Bar dataKey="success" fill="#10b981" name="Success Rate %" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Processing Time Distribution */}
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              {getText({ ar: 'توزيع وقت المعالجة', en: 'Processing Time', fr: 'Temps de traitement' })}
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={processingTimeData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" stroke="#888" style={{ fontSize: '12px' }} />
              <YAxis dataKey="time" type="category" stroke="#888" style={{ fontSize: '12px' }} width={60} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#8b5cf6" name="Documents" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly Activity & User Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl border-2 border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              {getText({ ar: 'النشاط الأسبوعي', en: 'Weekly Activity', fr: 'Activité hebdomadaire' })}
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyActivityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" stroke="#888" style={{ fontSize: '12px' }} />
              <YAxis stroke="#888" style={{ fontSize: '12px' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="uploads" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Uploads" />
              <Line type="monotone" dataKey="processed" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="Processed" />
              <Line type="monotone" dataKey="workflows" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} name="Workflows" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Users */}
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              {getText({ ar: 'أفضل المستخدمين', en: 'Top Users', fr: 'Meilleurs utilisateurs' })}
            </h3>
          </div>
          <div className="space-y-4">
            {userActivityData.map((user, index) => (
              <div key={index} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                  {user.user.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-gray-900 text-sm">{user.user}</p>
                    <span className="text-xs font-bold text-indigo-600">{user.efficiency}%</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <span>{user.documents} docs</span>
                    <span>•</span>
                    <span>{user.workflows} workflows</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdvancedAnalyticsDashboard;