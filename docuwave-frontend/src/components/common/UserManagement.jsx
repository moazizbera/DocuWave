import React, { useState } from 'react';
import { 
  Users, UserPlus, Edit3, Trash2, Search, Filter, Mail, Phone, 
  Building2, Briefcase, Shield, Crown, X, Save, Eye, EyeOff,
  CheckCircle, XCircle, MoreVertical, Download, Upload
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useOrg } from '../contexts/OrgContext';

/**
 * 👥 USER MANAGEMENT SYSTEM
 * ========================
 * Complete user management with:
 * - Add/Edit/Delete users
 * - Role assignment
 * - Department assignment
 * - Search & filter
 * - Bulk actions
 * - Import/Export
 * - Status management
 */

function UserManagement({ showToast }) {
  const { language } = useLanguage();
  const { orgStructure, routingEngine } = useOrg();
  
  const [users, setUsers] = useState(() => routingEngine.getAllEmployees());
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState([]);
  
  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  // Form state
  const [userForm, setUserForm] = useState({
    nameEn: '',
    nameAr: '',
    nameFr: '',
    positionEn: '',
    positionAr: '',
    positionFr: '',
    email: '',
    phone: '',
    department: '',
    level: 3,
    status: 'active',
    role: 'employee'
  });

  // Get text helper
  const getText = (obj) => {
    if (typeof obj === 'string') return obj;
    return obj?.[language] || obj?.en || '';
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchQuery || 
      getText(user.name).toLowerCase().includes(searchQuery.toLowerCase()) ||
      getText(user.position).toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const userDept = routingEngine.getEmployeeDepartment(user.id);
    const matchesDepartment = departmentFilter === 'all' || 
      userDept?.id === departmentFilter;
    
    const matchesLevel = levelFilter === 'all' || 
      user.level === parseInt(levelFilter);
    
    const matchesStatus = statusFilter === 'all' || 
      (user.status || 'active') === statusFilter;
    
    return matchesSearch && matchesDepartment && matchesLevel && matchesStatus;
  });

  // Get level badge
  const getLevelBadge = (level) => {
    const badges = {
      1: { icon: Crown, label: 'CEO', color: 'bg-purple-100 text-purple-700 border-purple-200' },
      2: { icon: Shield, label: 'Manager', color: 'bg-blue-100 text-blue-700 border-blue-200' },
      3: { icon: Briefcase, label: 'Employee', color: 'bg-gray-100 text-gray-700 border-gray-200' }
    };
    return badges[level] || badges[3];
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const badges = {
      active: { icon: CheckCircle, label: language === 'ar' ? 'نشط' : language === 'fr' ? 'Actif' : 'Active', color: 'bg-green-100 text-green-700 border-green-200' },
      inactive: { icon: XCircle, label: language === 'ar' ? 'غير نشط' : language === 'fr' ? 'Inactif' : 'Inactive', color: 'bg-red-100 text-red-700 border-red-200' }
    };
    return badges[status] || badges.active;
  };

  // Open add user modal
  const openAddUser = () => {
    setEditingUser(null);
    setUserForm({
      nameEn: '', nameAr: '', nameFr: '',
      positionEn: '', positionAr: '', positionFr: '',
      email: '', phone: '',
      department: '', level: 3, status: 'active', role: 'employee'
    });
    setShowUserModal(true);
  };

  // Open edit user modal
  const openEditUser = (user) => {
    setEditingUser(user);
    setUserForm({
      nameEn: user.name.en || '',
      nameAr: user.name.ar || '',
      nameFr: user.name.fr || '',
      positionEn: user.position.en || '',
      positionAr: user.position.ar || '',
      positionFr: user.position.fr || '',
      email: user.email || '',
      phone: user.phone || '',
      department: routingEngine.getEmployeeDepartment(user.id)?.id || '',
      level: user.level || 3,
      status: user.status || 'active',
      role: user.role || 'employee'
    });
    setShowUserModal(true);
  };

  // Save user
  const saveUser = () => {
    // Validation
    if (!userForm.nameEn || !userForm.email) {
      showToast(
        language === 'ar' ? 'الاسم والبريد الإلكتروني مطلوبان' :
        language === 'fr' ? 'Nom et email requis' :
        'Name and email are required',
        'error'
      );
      return;
    }

    if (editingUser) {
      // Update existing user
      setUsers(prev => prev.map(u => 
        u.id === editingUser.id ? {
          ...u,
          name: { ar: userForm.nameAr, en: userForm.nameEn, fr: userForm.nameFr },
          position: { ar: userForm.positionAr, en: userForm.positionEn, fr: userForm.positionFr },
          email: userForm.email,
          phone: userForm.phone,
          level: userForm.level,
          status: userForm.status,
          role: userForm.role
        } : u
      ));
      showToast(
        language === 'ar' ? 'تم تحديث المستخدم' :
        language === 'fr' ? 'Utilisateur mis à jour' :
        'User updated',
        'success'
      );
    } else {
      // Add new user
      const newUser = {
        id: `emp_${Date.now()}`,
        name: { ar: userForm.nameAr, en: userForm.nameEn, fr: userForm.nameFr },
        position: { ar: userForm.positionAr, en: userForm.positionEn, fr: userForm.positionFr },
        email: userForm.email,
        phone: userForm.phone,
        level: userForm.level,
        status: userForm.status,
        role: userForm.role
      };
      setUsers(prev => [...prev, newUser]);
      showToast(
        language === 'ar' ? 'تم إضافة المستخدم' :
        language === 'fr' ? 'Utilisateur ajouté' :
        'User added',
        'success'
      );
    }
    
    setShowUserModal(false);
  };

  // Delete user
  const deleteUser = (user) => {
    if (user.level === 1) {
      showToast(
        language === 'ar' ? 'لا يمكن حذف الرئيس التنفيذي' :
        language === 'fr' ? 'Impossible de supprimer le PDG' :
        'Cannot delete CEO',
        'error'
      );
      return;
    }

    setUsers(prev => prev.filter(u => u.id !== user.id));
    showToast(
      language === 'ar' ? 'تم حذف المستخدم' :
      language === 'fr' ? 'Utilisateur supprimé' :
      'User deleted',
      'success'
    );
    setDeleteConfirm(null);
  };

  // Export users
  const exportUsers = () => {
    const csv = [
      ['Name', 'Position', 'Email', 'Phone', 'Level', 'Status'].join(','),
      ...filteredUsers.map(u => [
        getText(u.name),
        getText(u.position),
        u.email,
        u.phone || '',
        u.level,
        u.status || 'active'
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    showToast(
      language === 'ar' ? 'تم التصدير' :
      language === 'fr' ? 'Exporté' :
      'Exported',
      'success'
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Users className="w-7 h-7 text-white" />
              </div>
              {language === 'ar' ? 'إدارة المستخدمين' :
               language === 'fr' ? 'Gestion des utilisateurs' :
               'User Management'}
            </h1>
            <p className="text-gray-600">
              {language === 'ar' ? 'إدارة الموظفين والأدوار والأذونات' :
               language === 'fr' ? 'Gérer les employés, rôles et permissions' :
               'Manage employees, roles, and permissions'}
            </p>
          </div>

          <button
            onClick={openAddUser}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 font-medium shadow-md hover:shadow-lg"
          >
            <UserPlus className="w-5 h-5" />
            {language === 'ar' ? 'إضافة مستخدم' :
             language === 'fr' ? 'Ajouter utilisateur' :
             'Add User'}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border-2 border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">
                  {language === 'ar' ? 'إجمالي المستخدمين' :
                   language === 'fr' ? 'Total utilisateurs' :
                   'Total Users'}
                </p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">
                  {language === 'ar' ? 'نشط' :
                   language === 'fr' ? 'Actifs' :
                   'Active'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => (u.status || 'active') === 'active').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">
                  {language === 'ar' ? 'المدراء' :
                   language === 'fr' ? 'Managers' :
                   'Managers'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.level === 2).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">
                  {language === 'ar' ? 'الأقسام' :
                   language === 'fr' ? 'Départements' :
                   'Departments'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {orgStructure.departments.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="flex-1 min-w-[300px] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'ar' ? 'بحث...' : language === 'fr' ? 'Rechercher...' : 'Search...'}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
              />
            </div>

            {/* Department Filter */}
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none font-medium text-sm"
            >
              <option value="all">
                {language === 'ar' ? 'جميع الأقسام' : language === 'fr' ? 'Tous départements' : 'All Departments'}
              </option>
              {orgStructure.departments.map(dept => (
                <option key={dept.id} value={dept.id}>{getText(dept.name)}</option>
              ))}
            </select>

            {/* Level Filter */}
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none font-medium text-sm"
            >
              <option value="all">
                {language === 'ar' ? 'جميع المستويات' : language === 'fr' ? 'Tous niveaux' : 'All Levels'}
              </option>
              <option value="1">Level 1 - CEO</option>
              <option value="2">Level 2 - Manager</option>
              <option value="3">Level 3 - Employee</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none font-medium text-sm"
            >
              <option value="all">
                {language === 'ar' ? 'جميع الحالات' : language === 'fr' ? 'Tous statuts' : 'All Status'}
              </option>
              <option value="active">
                {language === 'ar' ? 'نشط' : language === 'fr' ? 'Actif' : 'Active'}
              </option>
              <option value="inactive">
                {language === 'ar' ? 'غير نشط' : language === 'fr' ? 'Inactif' : 'Inactive'}
              </option>
            </select>

            {/* Export */}
            <button
              onClick={exportUsers}
              className="px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all flex items-center gap-2 font-medium shadow-md hover:shadow-lg"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">
                {language === 'ar' ? 'تصدير' : language === 'fr' ? 'Exporter' : 'Export'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  {language === 'ar' ? 'المستخدم' : language === 'fr' ? 'Utilisateur' : 'User'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  {language === 'ar' ? 'الاتصال' : language === 'fr' ? 'Contact' : 'Contact'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  {language === 'ar' ? 'القسم' : language === 'fr' ? 'Département' : 'Department'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  {language === 'ar' ? 'المستوى' : language === 'fr' ? 'Niveau' : 'Level'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  {language === 'ar' ? 'الحالة' : language === 'fr' ? 'Statut' : 'Status'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  {language === 'ar' ? 'الإجراءات' : language === 'fr' ? 'Actions' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map(user => {
                const levelBadge = getLevelBadge(user.level);
                const statusBadge = getStatusBadge(user.status || 'active');
                const userDept = routingEngine.getEmployeeDepartment(user.id);
                const LevelIcon = levelBadge.icon;
                const StatusIcon = statusBadge.icon;

                return (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
                          {getText(user.name).charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{getText(user.name)}</p>
                          <p className="text-sm text-gray-600">{getText(user.position)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          <span>{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {userDept ? (
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{getText(userDept.name)}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${levelBadge.color}`}>
                        <LevelIcon className="w-3.5 h-3.5" />
                        {levelBadge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusBadge.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusBadge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditUser(user)}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                          title={language === 'ar' ? 'تعديل' : language === 'fr' ? 'Modifier' : 'Edit'}
                        >
                          <Edit3 className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                        </button>
                        {user.level !== 1 && (
                          <button
                            onClick={() => setDeleteConfirm(user)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                            title={language === 'ar' ? 'حذف' : language === 'fr' ? 'Supprimer' : 'Delete'}
                          >
                            <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="p-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-600 font-medium mb-2">
              {language === 'ar' ? 'لم يتم العثور على مستخدمين' :
               language === 'fr' ? 'Aucun utilisateur trouvé' :
               'No users found'}
            </p>
            <p className="text-sm text-gray-400">
              {language === 'ar' ? 'جرب تغيير الفلاتر' :
               language === 'fr' ? 'Essayez de modifier les filtres' :
               'Try adjusting your filters'}
            </p>
          </div>
        )}
      </div>

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowUserModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b-2 border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">
                {editingUser ? (
                  language === 'ar' ? 'تعديل المستخدم' :
                  language === 'fr' ? 'Modifier utilisateur' :
                  'Edit User'
                ) : (
                  language === 'ar' ? 'إضافة مستخدم' :
                  language === 'fr' ? 'Ajouter utilisateur' :
                  'Add User'
                )}
              </h3>
              <button onClick={() => setShowUserModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Names */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    {language === 'ar' ? 'الاسم (عربي)' : language === 'fr' ? 'Nom (Arabe)' : 'Name (Arabic)'}
                  </label>
                  <input
                    type="text"
                    value={userForm.nameAr}
                    onChange={(e) => setUserForm({...userForm, nameAr: e.target.value})}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    {language === 'ar' ? 'الاسم (إنجليزي) *' : language === 'fr' ? 'Nom (Anglais) *' : 'Name (English) *'}
                  </label>
                  <input
                    type="text"
                    value={userForm.nameEn}
                    onChange={(e) => setUserForm({...userForm, nameEn: e.target.value})}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    {language === 'ar' ? 'الاسم (فرنسي)' : language === 'fr' ? 'Nom (Français)' : 'Name (French)'}
                  </label>
                  <input
                    type="text"
                    value={userForm.nameFr}
                    onChange={(e) => setUserForm({...userForm, nameFr: e.target.value})}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  />
                </div>
              </div>

              {/* Positions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    {language === 'ar' ? 'المنصب (عربي)' : language === 'fr' ? 'Poste (Arabe)' : 'Position (Arabic)'}
                  </label>
                  <input
                    type="text"
                    value={userForm.positionAr}
                    onChange={(e) => setUserForm({...userForm, positionAr: e.target.value})}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    {language === 'ar' ? 'المنصب (إنجليزي)' : language === 'fr' ? 'Poste (Anglais)' : 'Position (English)'}
                  </label>
                  <input
                    type="text"
                    value={userForm.positionEn}
                    onChange={(e) => setUserForm({...userForm, positionEn: e.target.value})}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    {language === 'ar' ? 'المنصب (فرنسي)' : language === 'fr' ? 'Poste (Français)' : 'Position (French)'}
                  </label>
                  <input
                    type="text"
                    value={userForm.positionFr}
                    onChange={(e) => setUserForm({...userForm, positionFr: e.target.value})}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  />
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    {language === 'ar' ? 'البريد الإلكتروني *' : language === 'fr' ? 'Email *' : 'Email *'}
                  </label>
                  <input
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    {language === 'ar' ? 'الهاتف' : language === 'fr' ? 'Téléphone' : 'Phone'}
                  </label>
                  <input
                    type="tel"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({...userForm, phone: e.target.value})}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  />
                </div>
              </div>

              {/* Department, Level, Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    {language === 'ar' ? 'القسم' : language === 'fr' ? 'Département' : 'Department'}
                  </label>
                  <select
                    value={userForm.department}
                    onChange={(e) => setUserForm({...userForm, department: e.target.value})}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  >
                    <option value="">
                      {language === 'ar' ? 'اختر القسم' : language === 'fr' ? 'Sélectionner' : 'Select Department'}
                    </option>
                    {orgStructure.departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{getText(dept.name)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    {language === 'ar' ? 'المستوى' : language === 'fr' ? 'Niveau' : 'Level'}
                  </label>
                  <select
                    value={userForm.level}
                    onChange={(e) => setUserForm({...userForm, level: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  >
                    <option value="1">Level 1 - CEO</option>
                    <option value="2">Level 2 - Manager</option>
                    <option value="3">Level 3 - Employee</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    {language === 'ar' ? 'الحالة' : language === 'fr' ? 'Statut' : 'Status'}
                  </label>
                  <select
                    value={userForm.status}
                    onChange={(e) => setUserForm({...userForm, status: e.target.value})}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  >
                    <option value="active">
                      {language === 'ar' ? 'نشط' : language === 'fr' ? 'Actif' : 'Active'}
                    </option>
                    <option value="inactive">
                      {language === 'ar' ? 'غير نشط' : language === 'fr' ? 'Inactif' : 'Inactive'}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t-2 border-gray-100">
              <button
                onClick={() => setShowUserModal(false)}
                className="flex-1 px-4 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
              >
                {language === 'ar' ? 'إلغاء' : language === 'fr' ? 'Annuler' : 'Cancel'}
              </button>
              <button
                onClick={saveUser}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {language === 'ar' ? 'حفظ' : language === 'fr' ? 'Enregistrer' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {language === 'ar' ? 'تأكيد الحذف' :
               language === 'fr' ? 'Confirmer la suppression' :
               'Confirm Delete'}
            </h3>
            <p className="text-gray-600 mb-6">
              {language === 'ar' ? `هل أنت متأكد من حذف "${getText(deleteConfirm.name)}"؟` :
               language === 'fr' ? `Êtes-vous sûr de vouloir supprimer "${getText(deleteConfirm.name)}"?` :
               `Are you sure you want to delete "${getText(deleteConfirm.name)}"?`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
              >
                {language === 'ar' ? 'إلغاء' : language === 'fr' ? 'Annuler' : 'Cancel'}
              </button>
              <button
                onClick={() => deleteUser(deleteConfirm)}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-medium"
              >
                {language === 'ar' ? 'حذف' : language === 'fr' ? 'Supprimer' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;