import React, { useState } from 'react';
import { Save, Eye, Plus, Trash2, Edit3, FileText, CheckCircle, Users, Send, Calendar, MessageSquare, ShoppingCart, Wrench, ArrowRight, Search, Filter, Star, Clock, TrendingUp, X } from 'lucide-react';

function WorkflowTemplateLibrary({ showToast = (msg, type) => console.log(msg, type) }) {
  const [activeView, setActiveView] = useState('templates'); // 'templates' | 'myworkflows' | 'create'
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [myWorkflows, setMyWorkflows] = useState([]);
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);

  // Template definitions with forms and workflows
  const templates = [
    {
      id: 'leave-request',
      nameAr: 'طلب إجازة',
      nameEn: 'Leave Request',
      descriptionAr: 'طلب إجازة بأنواعها: مرضية، عادية، سنوية',
      descriptionEn: 'Request for sick leave, casual leave, or annual leave',
      category: 'hr',
      icon: Calendar,
      color: 'blue',
      popularity: 95,
      form: {
        name: 'نموذج طلب الإجازة',
        fields: [
          { type: 'dropdown', label: 'نوع الإجازة', key: 'leaveType', options: ['إجازة سنوية', 'إجازة مرضية', 'إجازة عادية'], required: true },
          { type: 'date', label: 'تاريخ البداية', key: 'startDate', required: true },
          { type: 'date', label: 'تاريخ النهاية', key: 'endDate', required: true },
          { type: 'number', label: 'عدد الأيام', key: 'days', required: true },
          { type: 'textarea', label: 'السبب', key: 'reason', required: true },
          { type: 'file', label: 'مرفقات (اختياري)', key: 'attachments', required: false }
        ]
      },
      workflow: {
        nodes: [
          { id: 1, type: 'start', label: 'بداية', step: 'الموظف يقدم الطلب' },
          { id: 2, type: 'form', label: 'تعبئة النموذج', step: 'املأ نموذج طلب الإجازة' },
          { id: 3, type: 'approval', label: 'موافقة المدير المباشر', step: 'مراجعة وموافقة المدير' },
          { id: 4, type: 'conditional', label: 'فحص المدة', step: 'إذا أكثر من 5 أيام؟', condition: 'days > 5' },
          { id: 5, type: 'approval', label: 'موافقة مدير الموارد البشرية', step: 'موافقة HR (للإجازات الطويلة)' },
          { id: 6, type: 'email', label: 'إشعار الموافقة', step: 'إرسال بريد للموظف' },
          { id: 7, type: 'end', label: 'نهاية', step: 'اكتمال العملية' }
        ]
      }
    },
    {
      id: 'permission-request',
      nameAr: 'طلب تصريح استئذان',
      nameEn: 'Permission Request',
      descriptionAr: 'طلب إذن للخروج المبكر أو التأخير',
      descriptionEn: 'Request permission for early leave or late arrival',
      category: 'hr',
      icon: Clock,
      color: 'green',
      popularity: 88,
      form: {
        name: 'نموذج طلب استئذان',
        fields: [
          { type: 'dropdown', label: 'نوع الاستئذان', key: 'permissionType', options: ['خروج مبكر', 'تأخير صباحي', 'خروج أثناء الدوام'], required: true },
          { type: 'date', label: 'التاريخ', key: 'date', required: true },
          { type: 'time', label: 'الوقت المطلوب', key: 'time', required: true },
          { type: 'number', label: 'المدة (ساعات)', key: 'duration', required: true },
          { type: 'textarea', label: 'السبب', key: 'reason', required: true }
        ]
      },
      workflow: {
        nodes: [
          { id: 1, type: 'start', label: 'بداية', step: 'طلب استئذان' },
          { id: 2, type: 'form', label: 'تعبئة النموذج', step: 'تفاصيل الاستئذان' },
          { id: 3, type: 'approval', label: 'موافقة المدير', step: 'موافقة فورية' },
          { id: 4, type: 'email', label: 'إشعار', step: 'إرسال تأكيد' },
          { id: 5, type: 'end', label: 'نهاية', step: 'تمت الموافقة' }
        ]
      }
    },
    {
      id: 'correspondence-reply',
      nameAr: 'رد على مراسلة',
      nameEn: 'Reply to Correspondence',
      descriptionAr: 'إعداد رد رسمي على مراسلة واردة',
      descriptionEn: 'Prepare official reply to incoming correspondence',
      category: 'admin',
      icon: MessageSquare,
      color: 'purple',
      popularity: 82,
      form: {
        name: 'نموذج الرد على المراسلة',
        fields: [
          { type: 'textfield', label: 'رقم المراسلة الواردة', key: 'incomingRef', required: true },
          { type: 'date', label: 'تاريخ المراسلة الواردة', key: 'incomingDate', required: true },
          { type: 'textfield', label: 'الجهة المرسلة', key: 'sender', required: true },
          { type: 'textfield', label: 'الموضوع', key: 'subject', required: true },
          { type: 'textarea', label: 'محتوى الرد', key: 'replyContent', required: true },
          { type: 'file', label: 'المرفقات', key: 'attachments', required: false }
        ]
      },
      workflow: {
        nodes: [
          { id: 1, type: 'start', label: 'بداية', step: 'استلام مراسلة' },
          { id: 2, type: 'form', label: 'صياغة الرد', step: 'كتابة الرد' },
          { id: 3, type: 'approval', label: 'مراجعة المدير', step: 'مراجعة المحتوى' },
          { id: 4, type: 'approval', label: 'اعتماد مدير الإدارة', step: 'اعتماد نهائي' },
          { id: 5, type: 'email', label: 'إرسال الرد', step: 'إرسال للجهة' },
          { id: 6, type: 'end', label: 'نهاية', step: 'أرشفة' }
        ]
      }
    },
    {
      id: 'outgoing-correspondence',
      nameAr: 'تجهيز مراسلة صادرة',
      nameEn: 'Prepare Outgoing Correspondence',
      descriptionAr: 'إعداد مراسلة رسمية لجهة خارجية',
      descriptionEn: 'Prepare official outgoing correspondence',
      category: 'admin',
      icon: Send,
      color: 'indigo',
      popularity: 79,
      form: {
        name: 'نموذج المراسلة الصادرة',
        fields: [
          { type: 'textfield', label: 'الجهة المستقبلة', key: 'recipient', required: true },
          { type: 'textfield', label: 'الموضوع', key: 'subject', required: true },
          { type: 'dropdown', label: 'نوع المراسلة', key: 'type', options: ['خطاب رسمي', 'مذكرة', 'تعميم', 'دعوة'], required: true },
          { type: 'dropdown', label: 'الأولوية', key: 'priority', options: ['عادية', 'مستعجلة', 'عاجلة جداً'], required: true },
          { type: 'textarea', label: 'المحتوى', key: 'content', required: true },
          { type: 'file', label: 'المرفقات', key: 'attachments', required: false }
        ]
      },
      workflow: {
        nodes: [
          { id: 1, type: 'start', label: 'بداية', step: 'طلب مراسلة' },
          { id: 2, type: 'form', label: 'إعداد المراسلة', step: 'كتابة المحتوى' },
          { id: 3, type: 'approval', label: 'مراجعة مدير القسم', step: 'مراجعة أولية' },
          { id: 4, type: 'approval', label: 'اعتماد المدير العام', step: 'اعتماد نهائي' },
          { id: 5, type: 'email', label: 'إرسال', step: 'إرسال للجهة' },
          { id: 6, type: 'end', label: 'نهاية', step: 'حفظ في الأرشيف' }
        ]
      }
    },
    {
      id: 'purchase-request',
      nameAr: 'طلب شراء',
      nameEn: 'Purchase Request',
      descriptionAr: 'طلب شراء مواد أو خدمات',
      descriptionEn: 'Request to purchase materials or services',
      category: 'procurement',
      icon: ShoppingCart,
      color: 'orange',
      popularity: 91,
      form: {
        name: 'نموذج طلب الشراء',
        fields: [
          { type: 'textfield', label: 'اسم المادة/الخدمة', key: 'itemName', required: true },
          { type: 'number', label: 'الكمية', key: 'quantity', required: true },
          { type: 'number', label: 'التكلفة المتوقعة', key: 'estimatedCost', required: true },
          { type: 'dropdown', label: 'التصنيف', key: 'category', options: ['قرطاسية', 'معدات', 'برمجيات', 'خدمات', 'أخرى'], required: true },
          { type: 'textarea', label: 'المبرر', key: 'justification', required: true },
          { type: 'dropdown', label: 'الأولوية', key: 'priority', options: ['عادية', 'مستعجلة', 'عاجلة'], required: true }
        ]
      },
      workflow: {
        nodes: [
          { id: 1, type: 'start', label: 'بداية', step: 'طلب شراء' },
          { id: 2, type: 'form', label: 'تفاصيل الطلب', step: 'تعبئة البيانات' },
          { id: 3, type: 'approval', label: 'موافقة مدير القسم', step: 'مراجعة الحاجة' },
          { id: 4, type: 'conditional', label: 'فحص المبلغ', step: 'أكثر من 5000؟', condition: 'estimatedCost > 5000' },
          { id: 5, type: 'approval', label: 'موافقة المدير المالي', step: 'اعتماد الميزانية' },
          { id: 6, type: 'approval', label: 'موافقة المشتريات', step: 'إصدار أمر شراء' },
          { id: 7, type: 'end', label: 'نهاية', step: 'تنفيذ الشراء' }
        ]
      }
    },
    {
      id: 'invoice-approval',
      nameAr: 'اعتماد فاتورة',
      nameEn: 'Invoice Approval',
      descriptionAr: 'مراجعة واعتماد فاتورة للدفع',
      descriptionEn: 'Review and approve invoice for payment',
      category: 'finance',
      icon: FileText,
      color: 'red',
      popularity: 87,
      form: {
        name: 'نموذج اعتماد الفاتورة',
        fields: [
          { type: 'textfield', label: 'رقم الفاتورة', key: 'invoiceNumber', required: true },
          { type: 'textfield', label: 'اسم المورد', key: 'vendorName', required: true },
          { type: 'date', label: 'تاريخ الفاتورة', key: 'invoiceDate', required: true },
          { type: 'number', label: 'المبلغ', key: 'amount', required: true },
          { type: 'dropdown', label: 'العملة', key: 'currency', options: ['ريال', 'دولار', 'يورو'], required: true },
          { type: 'textarea', label: 'الوصف', key: 'description', required: true },
          { type: 'file', label: 'صورة الفاتورة', key: 'invoice', required: true }
        ]
      },
      workflow: {
        nodes: [
          { id: 1, type: 'start', label: 'بداية', step: 'استلام فاتورة' },
          { id: 2, type: 'form', label: 'إدخال البيانات', step: 'تسجيل الفاتورة' },
          { id: 3, type: 'approval', label: 'مراجعة مدير القسم', step: 'التحقق من الاستلام' },
          { id: 4, type: 'approval', label: 'اعتماد المحاسبة', step: 'مراجعة مالية' },
          { id: 5, type: 'conditional', label: 'فحص المبلغ', step: 'أكثر من 10000؟', condition: 'amount > 10000' },
          { id: 6, type: 'approval', label: 'اعتماد المدير المالي', step: 'موافقة CFO' },
          { id: 7, type: 'email', label: 'إشعار الدفع', step: 'جدولة الدفع' },
          { id: 8, type: 'end', label: 'نهاية', step: 'إتمام الدفع' }
        ]
      }
    },
    {
      id: 'maintenance-request',
      nameAr: 'طلب صيانة',
      nameEn: 'Maintenance Request',
      descriptionAr: 'طلب صيانة للمعدات أو المرافق',
      descriptionEn: 'Request maintenance for equipment or facilities',
      category: 'operations',
      icon: Wrench,
      color: 'yellow',
      popularity: 76,
      form: {
        name: 'نموذج طلب الصيانة',
        fields: [
          { type: 'dropdown', label: 'نوع الصيانة', key: 'type', options: ['طارئة', 'دورية', 'وقائية'], required: true },
          { type: 'textfield', label: 'الموقع', key: 'location', required: true },
          { type: 'textfield', label: 'المعدة/المرفق', key: 'equipment', required: true },
          { type: 'dropdown', label: 'الأولوية', key: 'priority', options: ['منخفضة', 'متوسطة', 'عالية', 'عاجلة'], required: true },
          { type: 'textarea', label: 'وصف المشكلة', key: 'description', required: true },
          { type: 'file', label: 'صور (اختياري)', key: 'photos', required: false }
        ]
      },
      workflow: {
        nodes: [
          { id: 1, type: 'start', label: 'بداية', step: 'طلب صيانة' },
          { id: 2, type: 'form', label: 'تفاصيل الطلب', step: 'وصف المشكلة' },
          { id: 3, type: 'approval', label: 'موافقة المشرف', step: 'تقييم الطلب' },
          { id: 4, type: 'conditional', label: 'فحص الأولوية', step: 'عاجلة؟', condition: 'priority == "عاجلة"' },
          { id: 5, type: 'email', label: 'إشعار فوري', step: 'تنبيه الصيانة' },
          { id: 6, type: 'approval', label: 'تعيين فني', step: 'جدولة العمل' },
          { id: 7, type: 'end', label: 'نهاية', step: 'إتمام الصيانة' }
        ]
      }
    },
    {
      id: 'adhoc-forward',
      nameAr: 'توجيه مخصص',
      nameEn: 'Ad-hoc Forward',
      descriptionAr: 'توجيه طلب بشكل مرن بين الأقسام والأشخاص',
      descriptionEn: 'Flexible routing between departments and people',
      category: 'general',
      icon: ArrowRight,
      color: 'gray',
      popularity: 84,
      form: {
        name: 'نموذج التوجيه المخصص',
        fields: [
          { type: 'textfield', label: 'عنوان الطلب', key: 'title', required: true },
          { type: 'dropdown', label: 'نوع الطلب', key: 'requestType', options: ['موافقة', 'مراجعة', 'استشارة', 'إعلام'], required: true },
          { type: 'textarea', label: 'التفاصيل', key: 'details', required: true },
          { type: 'dropdown', label: 'القسم المستهدف', key: 'department', options: ['الموارد البشرية', 'المالية', 'الإدارة', 'التقنية', 'المشتريات'], required: false },
          { type: 'textfield', label: 'الشخص المستهدف (اختياري)', key: 'person', required: false },
          { type: 'file', label: 'المرفقات', key: 'attachments', required: false }
        ]
      },
      workflow: {
        nodes: [
          { id: 1, type: 'start', label: 'بداية', step: 'إنشاء طلب' },
          { id: 2, type: 'form', label: 'تفاصيل الطلب', step: 'تعبئة البيانات' },
          { id: 3, type: 'adhoc', label: 'توجيه مرن', step: 'اختيار المسار' },
          { id: 4, type: 'approval', label: 'مراجعة المستقبل', step: 'معالجة الطلب' },
          { id: 5, type: 'adhoc', label: 'توجيه إضافي؟', step: 'إعادة توجيه حسب الحاجة' },
          { id: 6, type: 'end', label: 'نهاية', step: 'إغلاق الطلب' }
        ]
      }
    }
  ];

  const categories = [
    { id: 'all', nameAr: 'الكل', nameEn: 'All', icon: null },
    { id: 'hr', nameAr: 'الموارد البشرية', nameEn: 'Human Resources', icon: Users },
    { id: 'admin', nameAr: 'الإدارة', nameEn: 'Administration', icon: FileText },
    { id: 'procurement', nameAr: 'المشتريات', nameEn: 'Procurement', icon: ShoppingCart },
    { id: 'finance', nameAr: 'المالية', nameEn: 'Finance', icon: TrendingUp },
    { id: 'operations', nameAr: 'العمليات', nameEn: 'Operations', icon: Wrench },
    { id: 'general', nameAr: 'عام', nameEn: 'General', icon: Star }
  ];

  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    indigo: 'bg-indigo-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    gray: 'bg-gray-500'
  };

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.nameAr.includes(searchQuery) || t.nameEn.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUseTemplate = (template) => {
    const newWorkflow = {
      id: Date.now(),
      name: template.nameAr,
      template: template.id,
      createdAt: new Date().toISOString(),
      status: 'draft',
      form: template.form,
      workflow: template.workflow
    };
    setMyWorkflows([...myWorkflows, newWorkflow]);
    showToast(`تم إنشاء سير عمل جديد من قالب "${template.nameAr}"`, 'success');
    setActiveView('myworkflows');
  };

  const handleDeleteWorkflow = (id) => {
    setMyWorkflows(myWorkflows.filter(w => w.id !== id));
    showToast('تم حذف سير العمل', 'success');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">مكتبة قوالب سير العمل</h1>
        <p className="text-gray-600">ابدأ بسرعة مع قوالب جاهزة للعمليات الشائعة</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveView('templates')}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            activeView === 'templates'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          📚 القوالب المتاحة ({templates.length})
        </button>
        <button
          onClick={() => setActiveView('myworkflows')}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            activeView === 'myworkflows'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          📋 سير العمل الخاص بي ({myWorkflows.length})
        </button>
      </div>

      {/* Templates View */}
      {activeView === 'templates' && (
        <div>
          {/* Search and Filter */}
          <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث في القوالب..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border rounded-lg bg-white"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nameAr}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map(template => (
              <div
                key={template.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer overflow-hidden"
              >
                <div className={`${colorClasses[template.color]} p-4 text-white`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <template.icon className="w-8 h-8" />
                      <div>
                        <h3 className="text-xl font-bold">{template.nameAr}</h3>
                        <p className="text-sm opacity-90">{template.nameEn}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      <span className="text-sm font-semibold">{template.popularity}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <p className="text-gray-600 text-sm mb-4 min-h-12">{template.descriptionAr}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <span>{template.form.fields.length} حقول في النموذج</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>{template.workflow.nodes.length} خطوات في سير العمل</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedTemplate(template);
                        setShowTemplatePreview(true);
                      }}
                      className="flex-1 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      معاينة
                    </button>
                    <button
                      onClick={() => handleUseTemplate(template)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      استخدام
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Workflows View */}
      {activeView === 'myworkflows' && (
        <div>
          {myWorkflows.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">لا توجد سير عمل بعد</h3>
              <p className="text-gray-500 mb-6">ابدأ باختيار قالب من القوالب المتاحة</p>
              <button
                onClick={() => setActiveView('templates')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                تصفح القوالب
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {myWorkflows.map(workflow => (
                <div key={workflow.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{workflow.name}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm text-gray-500">
                            {new Date(workflow.createdAt).toLocaleDateString('ar-SA')}
                          </span>
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                            {workflow.status === 'draft' ? 'مسودة' : 'نشط'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => showToast('فتح المحرر', 'info')}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Edit3 className="w-4 h-4" />
                        تعديل
                      </button>
                      <button
                        onClick={() => showToast('تفعيل سير العمل', 'success')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        تفعيل
                      </button>
                      <button
                        onClick={() => handleDeleteWorkflow(workflow.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Template Preview Modal */}
      {showTemplatePreview && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6" onClick={() => setShowTemplatePreview(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className={`${colorClasses[selectedTemplate.color]} p-6 text-white`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <selectedTemplate.icon className="w-12 h-12" />
                  <div>
                    <h2 className="text-2xl font-bold">{selectedTemplate.nameAr}</h2>
                    <p className="text-sm opacity-90 mt-1">{selectedTemplate.nameEn}</p>
                  </div>
                </div>
                <button onClick={() => setShowTemplatePreview(false)} className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <p className="text-gray-600 mb-6">{selectedTemplate.descriptionAr}</p>

              {/* Form Preview */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  النموذج ({selectedTemplate.form.fields.length} حقول)
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  {selectedTemplate.form.fields.map((field, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-white p-3 rounded border">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{field.label}</span>
                          {field.required && <span className="text-red-500 text-xs">*</span>}
                        </div>
                        <span className="text-xs text-gray-500">{field.type}</span>
                      </div>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">{field.key}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Workflow Preview */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  سير العمل ({selectedTemplate.workflow.nodes.length} خطوات)
                </h3>
                <div className="relative">
                  {selectedTemplate.workflow.nodes.map((node, idx) => (
                    <div key={node.id}>
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 ${
                            node.type === 'start' ? 'bg-green-500' :
                            node.type === 'end' ? 'bg-red-500' :
                            node.type === 'approval' ? 'bg-yellow-500' :
                            node.type === 'conditional' ? 'bg-orange-500' :
                            node.type === 'form' ? 'bg-purple-500' :
                            node.type === 'adhoc' ? 'bg-gray-500' :
                            'bg-blue-500'
                          } rounded-full flex items-center justify-center text-white font-bold shadow-lg`}>
                            {idx + 1}
                          </div>
                          {idx < selectedTemplate.workflow.nodes.length - 1 && (
                            <div className="w-0.5 h-12 bg-gray-300"></div>
                          )}
                        </div>
                        <div className="flex-1 bg-white border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-gray-900">{node.label}</h4>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{node.type}</span>
                          </div>
                          <p className="text-sm text-gray-600">{node.step}</p>
                          {node.condition && (
                            <div className="mt-2 text-xs bg-orange-50 text-orange-700 p-2 rounded">
                              شرط: {node.condition}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => setShowTemplatePreview(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  إغلاق
                </button>
                <button
                  onClick={() => {
                    handleUseTemplate(selectedTemplate);
                    setShowTemplatePreview(false);
                  }}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  استخدام هذا القالب
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkflowTemplateLibrary;