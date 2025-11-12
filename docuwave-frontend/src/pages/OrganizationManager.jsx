import React, { useState } from 'react';
import { 
  Building2, Users, User, Plus, Edit3, Trash2, Save, X, 
  ChevronDown, ChevronRight, Mail, Briefcase, Shield, Search
} from 'lucide-react';

/**
 * 🏢 ORGANIZATION MANAGER - STANDALONE DEMO
 * =========================================
 * Complete UI for managing organizational structure
 * This is a demo version with mock data for artifact preview
 * 
 * @component
 */

// Mock initial data
const mockOrgStructure = {
  id: 'org_1',
  name: { ar: 'المنظمة الرئيسية', en: 'Main Organization', fr: 'Organisation Principale' },
  ceo: {
    id: 'emp_1',
    name: { ar: 'أحمد محمد', en: 'Ahmed Mohamed', fr: 'Ahmed Mohamed' },
    position: { ar: 'الرئيس التنفيذي', en: 'CEO', fr: 'PDG' },
    email: 'ahmed.mohamed@company.com',
    level: 1
  },
  departments: [
    {
      id: 'dept_hr',
      name: { ar: 'الموارد البشرية', en: 'Human Resources', fr: 'Ressources Humaines' },
      manager: {
        id: 'emp_2',
        name: { ar: 'فاطمة علي', en: 'Fatima Ali', fr: 'Fatima Ali' },
        position: { ar: 'مدير الموارد البشرية', en: 'HR Manager', fr: 'Directeur RH' },
        email: 'fatima.ali@company.com',
        level: 2
      },
      employees: [
        {
          id: 'emp_3',
          name: { ar: 'سارة أحمد', en: 'Sara Ahmed', fr: 'Sara Ahmed' },
          position: { ar: 'أخصائي توظيف', en: 'Recruitment Specialist', fr: 'Spécialiste Recrutement' },
          email: 'sara.ahmed@company.com',
          managerId: 'emp_2',
          level: 3
        }
      ]
    },
    {
      id: 'dept_finance',
      name: { ar: 'المالية', en: 'Finance', fr: 'Finance' },
      manager: {
        id: 'emp_5',
        name: { ar: 'عمر حسن', en: 'Omar Hassan', fr: 'Omar Hassan' },
        position: { ar: 'المدير المالي', en: 'Finance Manager', fr: 'Directeur Financier' },
        email: 'omar.hassan@company.com',
        level: 2
      },
      employees: []
    }
  ]
};

// Simple Modal Component
function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-xl font-bold">{title}</h3>
          <button onClick={onClose} className="hover:bg-gray-100 p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// Simple Toast Component
function Toast({ message, type, onClose }) {
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  };
  
  return (
    <div className={`fixed bottom-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50`}>
      <span>{message}</span>
      <button onClick={onClose}><X className="w-4 h-4" /></button>
    </div>
  );
}

// Main Component
function OrganizationManager() {
  const [language, setLanguage] = useState('en');
  const [orgStructure, setOrgStructure] = useState(mockOrgStructure);
  const [activeView, setActiveView] = useState('chart');
  const [expandedDepts, setExpandedDepts] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);
  
  // Modal states
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showEmpModal, setShowEmpModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [editingEmp, setEditingEmp] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  // Form states
  const [deptForm, setDeptForm] = useState({ nameAr: '', nameEn: '', nameFr: '' });
  const [empForm, setEmpForm] = useState({
    nameAr: '', nameEn: '', nameFr: '',
    positionAr: '', positionEn: '', positionFr: '',
    email: '', departmentId: '', level: 3
  });

  const getText = (obj) => {
    if (typeof obj === 'string') return obj;
    return obj?.[language] || obj?.en || '';
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getAllEmployees = () => {
    const employees = [orgStructure.ceo];
    orgStructure.departments.forEach(dept => {
      employees.push(dept.manager);
      employees.push(...dept.employees);
    });
    return employees;
  };

  const toggleDept = (deptId) => {
    setExpandedDepts({ ...expandedDepts, [deptId]: !expandedDepts[deptId] });
  };

  // Department Operations
  const openAddDept = () => {
    setEditingDept(null);
    setDeptForm({ nameAr: '', nameEn: '', nameFr: '' });
    setShowDeptModal(true);
  };

  const openEditDept = (dept) => {
    setEditingDept(dept);
    setDeptForm({ nameAr: dept.name.ar, nameEn: dept.name.en, nameFr: dept.name.fr });
    setShowDeptModal(true);
  };

  const saveDepartment = () => {
    if (!deptForm.nameEn.trim()) {
      showToast('Department name is required', 'error');
      return;
    }

    const newOrg = { ...orgStructure };
    if (editingDept) {
      const idx = newOrg.departments.findIndex(d => d.id === editingDept.id);
      if (idx !== -1) {
        newOrg.departments[idx].name = { ar: deptForm.nameAr, en: deptForm.nameEn, fr: deptForm.nameFr };
      }
      showToast('Department updated', 'success');
    } else {
      newOrg.departments.push({
        id: `dept_${Date.now()}`,
        name: { ar: deptForm.nameAr, en: deptForm.nameEn, fr: deptForm.nameFr },
        manager: {
          id: `emp_${Date.now()}`,
          name: { ar: 'مدير مؤقت', en: 'Temp Manager', fr: 'Gestionnaire temp' },
          position: { ar: 'مدير', en: 'Manager', fr: 'Gestionnaire' },
          email: 'temp@company.com',
          level: 2
        },
        employees: []
      });
      showToast('Department added', 'success');
    }
    setOrgStructure(newOrg);
    setShowDeptModal(false);
  };

  const deleteDepartment = (dept) => {
    if (dept.employees.length > 0) {
      showToast('Cannot delete department with employees', 'error');
      return;
    }
    const newOrg = { ...orgStructure, departments: orgStructure.departments.filter(d => d.id !== dept.id) };
    setOrgStructure(newOrg);
    showToast('Department deleted', 'success');
    setDeleteConfirm(null);
  };

  // Employee Operations
  const openAddEmp = (deptId) => {
    setEditingEmp(null);
    setEmpForm({
      nameAr: '', nameEn: '', nameFr: '',
      positionAr: '', positionEn: '', positionFr: '',
      email: '', departmentId: deptId, level: 3
    });
    setShowEmpModal(true);
  };

  const openEditEmp = (emp, deptId) => {
    setEditingEmp(emp);
    setEmpForm({
      nameAr: emp.name.ar, nameEn: emp.name.en, nameFr: emp.name.fr,
      positionAr: emp.position.ar, positionEn: emp.position.en, positionFr: emp.position.fr,
      email: emp.email, departmentId: deptId, level: emp.level
    });
    setShowEmpModal(true);
  };

  const saveEmployee = () => {
    if (!empForm.nameEn.trim() || !empForm.email.trim()) {
      showToast('Name and email are required', 'error');
      return;
    }

    const newOrg = { ...orgStructure };
    const deptIdx = newOrg.departments.findIndex(d => d.id === empForm.departmentId);
    if (deptIdx === -1) return;

    if (editingEmp) {
      const empIdx = newOrg.departments[deptIdx].employees.findIndex(e => e.id === editingEmp.id);
      if (empIdx !== -1) {
        newOrg.departments[deptIdx].employees[empIdx] = {
          ...newOrg.departments[deptIdx].employees[empIdx],
          name: { ar: empForm.nameAr, en: empForm.nameEn, fr: empForm.nameFr },
          position: { ar: empForm.positionAr, en: empForm.positionEn, fr: empForm.positionFr },
          email: empForm.email,
          level: empForm.level
        };
      }
      showToast('Employee updated', 'success');
    } else {
      newOrg.departments[deptIdx].employees.push({
        id: `emp_${Date.now()}`,
        name: { ar: empForm.nameAr, en: empForm.nameEn, fr: empForm.nameFr },
        position: { ar: empForm.positionAr, en: empForm.positionEn, fr: empForm.positionFr },
        email: empForm.email,
        managerId: newOrg.departments[deptIdx].manager.id,
        level: empForm.level
      });
      showToast('Employee added', 'success');
    }
    setOrgStructure(newOrg);
    setShowEmpModal(false);
  };

  const deleteEmployee = (emp, deptId) => {
    const newOrg = { ...orgStructure };
    const deptIdx = newOrg.departments.findIndex(d => d.id === deptId);
    if (deptIdx !== -1) {
      newOrg.departments[deptIdx].employees = newOrg.departments[deptIdx].employees.filter(e => e.id !== emp.id);
      setOrgStructure(newOrg);
      showToast('Employee deleted', 'success');
    }
    setDeleteConfirm(null);
  };

  const allEmployees = getAllEmployees();
  const filteredEmployees = allEmployees.filter(emp => 
    !searchQuery || 
    getText(emp.name).toLowerCase().includes(searchQuery.toLowerCase()) ||
    getText(emp.position).toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Building2 className="w-8 h-8 text-blue-600" />
              Organization Management
            </h1>
            <p className="text-gray-600 mt-1">Manage departments and employees</p>
          </div>

          <div className="flex gap-2">
            <select value={language} onChange={(e) => setLanguage(e.target.value)} 
              className="px-3 py-2 border rounded-lg bg-white">
              <option value="en">English</option>
              <option value="ar">العربية</option>
              <option value="fr">Français</option>
            </select>
            
            <div className="flex border rounded-lg p-1 bg-white">
              <button onClick={() => setActiveView('chart')}
                className={`px-4 py-2 rounded flex items-center gap-2 ${activeView === 'chart' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}>
                <Building2 className="w-4 h-4" />Chart
              </button>
              <button onClick={() => setActiveView('list')}
                className={`px-4 py-2 rounded flex items-center gap-2 ${activeView === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}>
                <Users className="w-4 h-4" />List
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 flex gap-4">
          <div className="bg-white rounded-lg shadow px-4 py-3">
            <div className="text-2xl font-bold text-gray-900">{orgStructure.departments.length}</div>
            <div className="text-sm text-gray-600">Departments</div>
          </div>
          <div className="bg-white rounded-lg shadow px-4 py-3">
            <div className="text-2xl font-bold text-gray-900">{allEmployees.length}</div>
            <div className="text-sm text-gray-600">Employees</div>
          </div>
        </div>
      </div>

      {/* Chart View */}
      {activeView === 'chart' && (
        <div className="space-y-6">
          {/* CEO Card */}
          <div className="flex justify-center">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-xl w-80">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-10 h-10" />
                <div>
                  <div className="text-xs opacity-90">Level 1</div>
                  <div className="font-bold text-xl">{getText(orgStructure.ceo.name)}</div>
                </div>
              </div>
              <div className="text-sm opacity-90 mb-2">{getText(orgStructure.ceo.position)}</div>
              <div className="flex items-center gap-2 text-xs bg-purple-700 px-3 py-1 rounded">
                <Mail className="w-3 h-3" />{orgStructure.ceo.email}
              </div>
            </div>
          </div>

          {/* Departments Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orgStructure.departments.map(dept => (
              <div key={dept.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-blue-500 text-white p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1">
                      <Building2 className="w-5 h-5" />
                      <h3 className="font-bold">{getText(dept.name)}</h3>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEditDept(dept)} className="p-1 hover:bg-blue-600 rounded">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteConfirm({ type: 'dept', item: dept })} className="p-1 hover:bg-blue-600 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => toggleDept(dept.id)} className="p-1 hover:bg-blue-600 rounded">
                        {expandedDepts[dept.id] ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div className="text-xs opacity-90">{dept.employees.length} employee(s)</div>
                </div>

                <div className="p-4 bg-blue-50 border-b">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    <div className="text-xs text-blue-600 font-semibold">Level 2 - Manager</div>
                  </div>
                  <div className="font-bold">{getText(dept.manager.name)}</div>
                  <div className="text-sm text-gray-600">{getText(dept.manager.position)}</div>
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Mail className="w-3 h-3" />{dept.manager.email}
                  </div>
                </div>

                {expandedDepts[dept.id] && (
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-semibold text-gray-500 flex items-center gap-2">
                        <User className="w-4 h-4" />Level 3 - Employees
                      </div>
                      <button onClick={() => openAddEmp(dept.id)} className="text-blue-600 hover:text-blue-700">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {dept.employees.length === 0 ? (
                      <div className="text-center py-4 text-gray-400 text-sm">No employees</div>
                    ) : (
                      dept.employees.map(emp => (
                        <div key={emp.id} className="bg-gray-50 p-3 rounded-lg border hover:border-blue-300 transition-all group">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium">{getText(emp.name)}</div>
                              <div className="text-sm text-gray-600">{getText(emp.position)}</div>
                              <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                <Mail className="w-3 h-3" />{emp.email}
                              </div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => openEditEmp(emp, dept.id)} className="p-1 hover:bg-gray-200 rounded">
                                <Edit3 className="w-3 h-3 text-blue-600" />
                              </button>
                              <button onClick={() => setDeleteConfirm({ type: 'emp', item: emp, deptId: dept.id })} className="p-1 hover:bg-gray-200 rounded">
                                <Trash2 className="w-3 h-3 text-red-600" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}

            <button onClick={openAddDept}
              className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-blue-400 hover:bg-blue-50 transition-all flex flex-col items-center justify-center gap-3 min-h-[200px]">
              <Plus className="w-12 h-12 text-gray-400" />
              <span className="font-semibold text-gray-600">Add Department</span>
            </button>
          </div>
        </div>
      )}

      {/* List View */}
      {activeView === 'list' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search employees..." className="w-full pl-10 pr-4 py-2 border rounded-lg" />
            </div>
          </div>

          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredEmployees.map(emp => (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{getText(emp.name)}</td>
                  <td className="px-4 py-3 text-sm">{getText(emp.position)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{emp.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded ${
                      emp.level === 1 ? 'bg-purple-100 text-purple-700' :
                      emp.level === 2 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                    }`}>Level {emp.level}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Department Modal */}
      <Modal isOpen={showDeptModal} onClose={() => setShowDeptModal(false)} 
        title={editingDept ? 'Edit Department' : 'Add Department'}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">Name (Arabic)</label>
            <input type="text" value={deptForm.nameAr} onChange={(e) => setDeptForm({ ...deptForm, nameAr: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg" dir="rtl" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Name (English) *</label>
            <input type="text" value={deptForm.nameEn} onChange={(e) => setDeptForm({ ...deptForm, nameEn: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg" required />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Name (French)</label>
            <input type="text" value={deptForm.nameFr} onChange={(e) => setDeptForm({ ...deptForm, nameFr: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button onClick={() => setShowDeptModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={saveDepartment} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Save className="w-4 h-4" />Save
            </button>
          </div>
        </div>
      </Modal>

      {/* Employee Modal */}
      <Modal isOpen={showEmpModal} onClose={() => setShowEmpModal(false)}
        title={editingEmp ? 'Edit Employee' : 'Add Employee'}>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          <div>
            <label className="text-sm font-medium block mb-1">Name (English) *</label>
            <input type="text" value={empForm.nameEn} onChange={(e) => setEmpForm({ ...empForm, nameEn: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg" required />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Position (English)</label>
            <input type="text" value={empForm.positionEn} onChange={(e) => setEmpForm({ ...empForm, positionEn: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Email *</label>
            <input type="email" value={empForm.email} onChange={(e) => setEmpForm({ ...empForm, email: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg" required />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Department</label>
            <select value={empForm.departmentId} onChange={(e) => setEmpForm({ ...empForm, departmentId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg">
              <option value="">Select Department...</option>
              {orgStructure.departments.map(dept => (
                <option key={dept.id} value={dept.id}>{getText(dept.name)}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button onClick={() => setShowEmpModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={saveEmployee} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Save className="w-4 h-4" />Save
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirm Delete">
        <p className="mb-6">Are you sure you want to delete this {deleteConfirm?.type === 'dept' ? 'department' : 'employee'}?</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 border rounded hover:bg-gray-50">No</button>
          <button onClick={() => {
            if (deleteConfirm?.type === 'dept') deleteDepartment(deleteConfirm.item);
            else deleteEmployee(deleteConfirm.item, deleteConfirm.deptId);
          }} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Yes, Delete</button>
        </div>
      </Modal>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export default OrganizationManager;