import React, { useState } from 'react';
import { Building2, Users, User, ChevronRight, ChevronDown, GitBranch, ArrowRight, Shield, Briefcase, Network } from 'lucide-react';

// ============================================
// INITIAL ORGANIZATIONAL STRUCTURE
// ============================================
const initialOrgStructure = {
  id: 'org_1',
  name: { ar: 'المنظمة الرئيسية', en: 'Main Organization' },
  type: 'organization',
  ceo: {
    id: 'emp_1',
    name: { ar: 'أحمد محمد', en: 'Ahmed Mohamed' },
    position: { ar: 'الرئيس التنفيذي', en: 'CEO' },
    email: 'ahmed.mohamed@company.com',
    level: 1
  },
  departments: [
    {
      id: 'dept_hr',
      name: { ar: 'الموارد البشرية', en: 'Human Resources' },
      type: 'department',
      manager: {
        id: 'emp_2',
        name: { ar: 'فاطمة علي', en: 'Fatima Ali' },
        position: { ar: 'مدير الموارد البشرية', en: 'HR Manager' },
        email: 'fatima.ali@company.com',
        level: 2
      },
      employees: [
        {
          id: 'emp_3',
          name: { ar: 'سارة أحمد', en: 'Sara Ahmed' },
          position: { ar: 'أخصائي توظيف', en: 'Recruitment Specialist' },
          email: 'sara.ahmed@company.com',
          managerId: 'emp_2',
          level: 3
        },
        {
          id: 'emp_4',
          name: { ar: 'محمد خالد', en: 'Mohamed Khaled' },
          position: { ar: 'أخصائي تدريب', en: 'Training Specialist' },
          email: 'mohamed.khaled@company.com',
          managerId: 'emp_2',
          level: 3
        }
      ]
    },
    {
      id: 'dept_finance',
      name: { ar: 'المالية', en: 'Finance' },
      type: 'department',
      manager: {
        id: 'emp_5',
        name: { ar: 'عمر حسن', en: 'Omar Hassan' },
        position: { ar: 'المدير المالي', en: 'Finance Manager' },
        email: 'omar.hassan@company.com',
        level: 2
      },
      employees: [
        {
          id: 'emp_6',
          name: { ar: 'ليلى محمود', en: 'Layla Mahmoud' },
          position: { ar: 'محاسب', en: 'Accountant' },
          email: 'layla.mahmoud@company.com',
          managerId: 'emp_5',
          level: 3
        }
      ]
    },
    {
      id: 'dept_it',
      name: { ar: 'تقنية المعلومات', en: 'IT Department' },
      type: 'department',
      manager: {
        id: 'emp_8',
        name: { ar: 'يوسف إبراهيم', en: 'Youssef Ibrahim' },
        position: { ar: 'مدير تقنية المعلومات', en: 'IT Manager' },
        email: 'youssef.ibrahim@company.com',
        level: 2
      },
      employees: [
        {
          id: 'emp_9',
          name: { ar: 'نور الدين', en: 'Nour Aldeen' },
          position: { ar: 'مطور برامج', en: 'Software Developer' },
          email: 'nour.aldeen@company.com',
          managerId: 'emp_8',
          level: 3
        }
      ]
    }
  ]
};

// ============================================
// WORKFLOW ROUTING ENGINE
// ============================================
class WorkflowRoutingEngine {
  constructor(orgStructure) {
    this.org = orgStructure;
  }

  getAllEmployees() {
    const employees = [this.org.ceo];
    this.org.departments.forEach(dept => {
      employees.push(dept.manager);
      employees.push(...dept.employees);
    });
    return employees;
  }

  findEmployee(empId) {
    return this.getAllEmployees().find(emp => emp.id === empId);
  }

  getDirectManager(empId) {
    const employee = this.findEmployee(empId);
    if (!employee) return null;
    
    if (empId === this.org.ceo.id) return null;
    
    const isDeptManager = this.org.departments.some(dept => dept.manager.id === empId);
    if (isDeptManager) return this.org.ceo;
    
    for (const dept of this.org.departments) {
      const emp = dept.employees.find(e => e.id === empId);
      if (emp) return dept.manager;
    }
    
    return null;
  }

  getEmployeeDepartment(empId) {
    if (empId === this.org.ceo.id) return null;
    
    for (const dept of this.org.departments) {
      if (dept.manager.id === empId) return dept;
      if (dept.employees.some(e => e.id === empId)) return dept;
    }
    return null;
  }

  getEquivalentManagers(empId) {
    const employee = this.findEmployee(empId);
    if (!employee) return [];
    
    const isDeptManager = this.org.departments.some(dept => dept.manager.id === empId);
    if (isDeptManager) {
      return this.org.departments
        .filter(dept => dept.manager.id !== empId)
        .map(dept => dept.manager);
    }
    
    return [];
  }

  getSubordinates(empId) {
    if (empId === this.org.ceo.id) {
      return this.org.departments.map(dept => dept.manager);
    }
    
    for (const dept of this.org.departments) {
      if (dept.manager.id === empId) {
        return dept.employees;
      }
    }
    
    return [];
  }

  getAdhocRecipients(currentUserId) {
    return this.getAllEmployees().filter(emp => emp.id !== currentUserId);
  }

  getHierarchicalNext(currentUserId, action) {
    if (action === 'approve' || action === 'forward') {
      return this.getDirectManager(currentUserId);
    } else if (action === 'reject') {
      return null;
    } else if (action === 'delegate') {
      return this.getEquivalentManagers(currentUserId);
    }
  }
}

/**
 * 🏢 ORGANIZATION HIERARCHY SYSTEM
 * =================================
 * Standalone component with embedded org structure and routing engine
 * 
 * @component
 */
function OrgHierarchySystem() {
  const [language, setLanguage] = useState('en');
  const [activeView, setActiveView] = useState('org-chart');
  const [expandedDepts, setExpandedDepts] = useState({});
  const [currentUser, setCurrentUser] = useState('emp_3');

  // ✅ USE LOCAL ORG STRUCTURE (not from context)
  const orgStructure = initialOrgStructure;
  const routingEngine = new WorkflowRoutingEngine(orgStructure);

  const getText = (obj) => {
    if (typeof obj === 'string') return obj;
    return obj?.[language] || obj?.en || '';
  };

  const toggleDepartment = (deptId) => {
    setExpandedDepts({ ...expandedDepts, [deptId]: !expandedDepts[deptId] });
  };

  const renderOrgChart = () => (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            {getText({ ar: 'الهيكل التنظيمي', en: 'Organizational Structure' })}
          </h2>
          <p className="text-gray-600 mt-1">
            {getText({ ar: 'عرض التسلسل الإداري للمنظمة', en: 'View organizational hierarchy' })}
          </p>
        </div>
        <select value={language} onChange={(e) => setLanguage(e.target.value)} className="px-4 py-2 border rounded-lg bg-white">
          <option value="en">English</option>
          <option value="ar">العربية</option>
        </select>
      </div>

      <div className="flex justify-center mb-8">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-xl w-80">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8" />
            <div>
              <div className="text-xs opacity-90">{getText({ ar: 'المستوى 1', en: 'Level 1' })}</div>
              <div className="font-bold text-lg">{getText(orgStructure.ceo.name)}</div>
            </div>
          </div>
          <div className="text-sm opacity-90">{getText(orgStructure.ceo.position)}</div>
          <div className="text-xs mt-2 bg-purple-700 px-2 py-1 rounded">{orgStructure.ceo.email}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {orgStructure.departments.map(dept => (
          <div key={dept.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-blue-500 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <h3 className="font-bold">{getText(dept.name)}</h3>
                </div>
                <button onClick={() => toggleDepartment(dept.id)} className="hover:bg-blue-600 p-1 rounded">
                  {expandedDepts[dept.id] ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border-b">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <div className="text-xs text-blue-600 font-semibold">Level 2 - Manager</div>
              </div>
              <div className="font-bold">{getText(dept.manager.name)}</div>
              <div className="text-sm text-gray-600">{getText(dept.manager.position)}</div>
              <div className="text-xs text-gray-500 mt-1">{dept.manager.email}</div>
            </div>

            {expandedDepts[dept.id] && (
              <div className="p-4 space-y-3">
                <div className="text-xs font-semibold text-gray-500 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Level 3 - Employees
                </div>
                {dept.employees.map(emp => (
                  <div key={emp.id} className="bg-gray-50 p-3 rounded-lg border hover:border-blue-300 transition-all">
                    <div className="font-medium">{getText(emp.name)}</div>
                    <div className="text-sm text-gray-600">{getText(emp.position)}</div>
                    <div className="text-xs text-gray-500 mt-1">{emp.email}</div>
                    <div className="text-xs text-blue-600 mt-1">
                      Manager: {getText(dept.manager.name)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderWorkflowConfig = () => (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Network className="w-6 h-6 text-green-600" />
        {getText({ ar: 'سيناريوهات سير العمل', en: 'Workflow Scenarios' })}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">🔀</span>
          </div>
          <h3 className="font-bold text-lg mb-2">
            {getText({ ar: 'سير عمل مرن (1)', en: 'Ad-hoc Workflow (1)' })}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {getText({ ar: 'الموظف يختار المستلم التالي يدوياً', en: 'Employee manually selects next recipient' })}
          </p>
          <div className="bg-orange-50 p-3 rounded-lg text-xs space-y-2">
            <div className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-orange-600" />
              <span>Free choice of any employee</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-orange-600" />
              <span>Select entire department</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-orange-600" />
              <span>Recipient decides: approve/reject/forward</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">📊</span>
          </div>
          <h3 className="font-bold text-lg mb-2">
            {getText({ ar: 'سير عمل مرن (2)', en: 'Ad-hoc Workflow (2)' })}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {getText({ ar: 'التوجيه التلقائي حسب الهيكل الإداري', en: 'Auto-routing based on hierarchy' })}
          </p>
          <div className="bg-blue-50 p-3 rounded-lg text-xs space-y-2">
            <div className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-blue-600" />
              <span>Upward: Direct Manager</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-blue-600" />
              <span>Same Level: Dept Managers</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-blue-600" />
              <span>Reject: Return to sender</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">📋</span>
          </div>
          <h3 className="font-bold text-lg mb-2">
            {getText({ ar: 'سير عمل محدد مسبقاً', en: 'Predefined Workflow' })}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {getText({ ar: 'مسار محدد مع أدوار تنظيمية', en: 'Fixed path with organizational roles' })}
          </p>
          <div className="bg-green-50 p-3 rounded-lg text-xs space-y-2">
            <div className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-green-600" />
              <span>Role: Direct Manager</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-green-600" />
              <span>Role: Department Manager</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-green-600" />
              <span>Role: CEO</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTestRouting = () => {
    const currentEmp = routingEngine.findEmployee(currentUser);
    const directManager = routingEngine.getDirectManager(currentUser);
    const subordinates = routingEngine.getSubordinates(currentUser);
    const equivalentManagers = routingEngine.getEquivalentManagers(currentUser);
    const adhocRecipients = routingEngine.getAdhocRecipients(currentUser);

    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <GitBranch className="w-6 h-6 text-purple-600" />
          {getText({ ar: 'اختبار التوجيه', en: 'Routing Test' })}
        </h2>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <label className="text-sm font-semibold block mb-2 text-gray-700">Current User:</label>
          <select value={currentUser} onChange={(e) => setCurrentUser(e.target.value)} className="w-full px-4 py-2 border rounded-lg">
            {routingEngine.getAllEmployees().map(emp => (
              <option key={emp.id} value={emp.id}>
                {getText(emp.name)} - {getText(emp.position)} (Level {emp.level})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-6">
            <h3 className="font-bold text-lg mb-4">Current User</h3>
            <div className="space-y-2">
              <div><strong>Name:</strong> {getText(currentEmp.name)}</div>
              <div><strong>Position:</strong> {getText(currentEmp.position)}</div>
              <div><strong>Level:</strong> {currentEmp.level}</div>
              <div><strong>Email:</strong> {currentEmp.email}</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-blue-600" />
              Direct Manager
            </h3>
            {directManager ? (
              <div className="space-y-2 text-sm">
                <div><strong>Name:</strong> {getText(directManager.name)}</div>
                <div><strong>Position:</strong> {getText(directManager.position)}</div>
                <div className="text-xs bg-blue-50 p-2 rounded">{directManager.email}</div>
              </div>
            ) : (
              <div className="text-gray-500 text-sm">None (CEO)</div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              Direct Subordinates
            </h3>
            {subordinates.length > 0 ? (
              <div className="space-y-2">
                {subordinates.map(emp => (
                  <div key={emp.id} className="text-sm bg-green-50 p-2 rounded">
                    {getText(emp.name)} - {getText(emp.position)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-sm">None</div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Network className="w-5 h-5 text-orange-600" />
              Equivalent Managers
            </h3>
            {equivalentManagers.length > 0 ? (
              <div className="space-y-2">
                {equivalentManagers.map(emp => (
                  <div key={emp.id} className="text-sm bg-orange-50 p-2 rounded">
                    {getText(emp.name)} - {getText(emp.position)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-sm">None</div>
            )}
          </div>
        </div>

        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <h3 className="font-bold text-lg mb-4">Test Scenarios</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <div className="font-semibold mb-2 text-sm">Scenario 1: Ad-hoc (Manual)</div>
              <div className="text-xs text-gray-600">
                Available: {adhocRecipients.length} employees
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="font-semibold mb-2 text-sm">Scenario 2: Ad-hoc (Auto)</div>
              <div className="text-xs space-y-1">
                <div>✓ Upward: {directManager ? getText(directManager.name) : 'N/A'}</div>
                <div>✓ Same Level: {equivalentManagers.length}</div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="font-semibold mb-2 text-sm">Scenario 3: Predefined</div>
              <div className="text-xs space-y-1">
                <div>✓ Based on defined roles</div>
                <div>✓ Fixed path</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b shadow-sm">
        <div className="flex gap-1 p-2">
          <button
            onClick={() => setActiveView('org-chart')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${activeView === 'org-chart' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <Building2 className="w-4 h-4 inline mr-2" />
            Org Structure
          </button>
          <button
            onClick={() => setActiveView('workflow-config')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${activeView === 'workflow-config' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <Network className="w-4 h-4 inline mr-2" />
            Workflow Scenarios
          </button>
          <button
            onClick={() => setActiveView('test-routing')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${activeView === 'test-routing' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <GitBranch className="w-4 h-4 inline mr-2" />
            Test Routing
          </button>
        </div>
      </div>

      {activeView === 'org-chart' && renderOrgChart()}
      {activeView === 'workflow-config' && renderWorkflowConfig()}
      {activeView === 'test-routing' && renderTestRouting()}
    </div>
  );
}

export default OrgHierarchySystem;