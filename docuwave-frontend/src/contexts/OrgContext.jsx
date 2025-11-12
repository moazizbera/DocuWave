import React, { createContext, useContext, useState } from 'react';

/**
 * 🏢 ORGANIZATIONAL CONTEXT
 * =========================
 * Provides organizational structure and routing engine throughout the app
 * 
 * @context OrgContext
 */

const OrgContext = createContext(null);

/**
 * Hook to use organizational context
 * @returns {Object} { orgStructure, setOrgStructure, routingEngine }
 * @throws {Error} If used outside OrgProvider
 */
export function useOrg() {
  const context = useContext(OrgContext);
  if (!context) {
    throw new Error('useOrg must be used within OrgProvider');
  }
  return context;
}

// ============================================
// 🏗️ INITIAL ORGANIZATIONAL STRUCTURE
// ============================================

/**
 * Initial organizational structure (mock data for frontend)
 * In production, this will come from backend API
 */
const initialOrgStructure = {
  id: 'org_1',
  name: { 
    ar: 'المنظمة الرئيسية', 
    en: 'Main Organization', 
    fr: 'Organisation Principale' 
  },
  type: 'organization',
  ceo: {
    id: 'emp_1',
    name: { 
      ar: 'أحمد محمد', 
      en: 'Ahmed Mohamed', 
      fr: 'Ahmed Mohamed' 
    },
    position: { 
      ar: 'الرئيس التنفيذي', 
      en: 'CEO', 
      fr: 'PDG' 
    },
    email: 'ahmed.mohamed@company.com',
    level: 1
  },
  departments: [
    {
      id: 'dept_hr',
      name: { 
        ar: 'الموارد البشرية', 
        en: 'Human Resources', 
        fr: 'Ressources Humaines' 
      },
      type: 'department',
      manager: {
        id: 'emp_2',
        name: { 
          ar: 'فاطمة علي', 
          en: 'Fatima Ali', 
          fr: 'Fatima Ali' 
        },
        position: { 
          ar: 'مدير الموارد البشرية', 
          en: 'HR Manager', 
          fr: 'Directeur RH' 
        },
        email: 'fatima.ali@company.com',
        level: 2
      },
      employees: [
        {
          id: 'emp_3',
          name: { 
            ar: 'سارة أحمد', 
            en: 'Sara Ahmed', 
            fr: 'Sara Ahmed' 
          },
          position: { 
            ar: 'أخصائي توظيف', 
            en: 'Recruitment Specialist', 
            fr: 'Spécialiste Recrutement' 
          },
          email: 'sara.ahmed@company.com',
          managerId: 'emp_2',
          level: 3
        },
        {
          id: 'emp_4',
          name: { 
            ar: 'محمد خالد', 
            en: 'Mohamed Khaled', 
            fr: 'Mohamed Khaled' 
          },
          position: { 
            ar: 'أخصائي تدريب', 
            en: 'Training Specialist', 
            fr: 'Spécialiste Formation' 
          },
          email: 'mohamed.khaled@company.com',
          managerId: 'emp_2',
          level: 3
        }
      ]
    },
    {
      id: 'dept_finance',
      name: { 
        ar: 'المالية', 
        en: 'Finance', 
        fr: 'Finance' 
      },
      type: 'department',
      manager: {
        id: 'emp_5',
        name: { 
          ar: 'عمر حسن', 
          en: 'Omar Hassan', 
          fr: 'Omar Hassan' 
        },
        position: { 
          ar: 'المدير المالي', 
          en: 'Finance Manager', 
          fr: 'Directeur Financier' 
        },
        email: 'omar.hassan@company.com',
        level: 2
      },
      employees: [
        {
          id: 'emp_6',
          name: { 
            ar: 'ليلى محمود', 
            en: 'Layla Mahmoud', 
            fr: 'Layla Mahmoud' 
          },
          position: { 
            ar: 'محاسب', 
            en: 'Accountant', 
            fr: 'Comptable' 
          },
          email: 'layla.mahmoud@company.com',
          managerId: 'emp_5',
          level: 3
        },
        {
          id: 'emp_7',
          name: { 
            ar: 'خالد عبدالله', 
            en: 'Khaled Abdullah', 
            fr: 'Khaled Abdullah' 
          },
          position: { 
            ar: 'محلل مالي', 
            en: 'Financial Analyst', 
            fr: 'Analyste Financier' 
          },
          email: 'khaled.abdullah@company.com',
          managerId: 'emp_5',
          level: 3
        }
      ]
    },
    {
      id: 'dept_it',
      name: { 
        ar: 'تقنية المعلومات', 
        en: 'IT Department', 
        fr: 'Département IT' 
      },
      type: 'department',
      manager: {
        id: 'emp_8',
        name: { 
          ar: 'يوسف إبراهيم', 
          en: 'Youssef Ibrahim', 
          fr: 'Youssef Ibrahim' 
        },
        position: { 
          ar: 'مدير تقنية المعلومات', 
          en: 'IT Manager', 
          fr: 'Directeur IT' 
        },
        email: 'youssef.ibrahim@company.com',
        level: 2
      },
      employees: [
        {
          id: 'emp_9',
          name: { 
            ar: 'نور الدين', 
            en: 'Nour Aldeen', 
            fr: 'Nour Aldeen' 
          },
          position: { 
            ar: 'مطور برامج', 
            en: 'Software Developer', 
            fr: 'Développeur' 
          },
          email: 'nour.aldeen@company.com',
          managerId: 'emp_8',
          level: 3
        },
        {
          id: 'emp_10',
          name: { 
            ar: 'ريم سالم', 
            en: 'Reem Salem', 
            fr: 'Reem Salem' 
          },
          position: { 
            ar: 'مهندس شبكات', 
            en: 'Network Engineer', 
            fr: 'Ingénieur Réseau' 
          },
          email: 'reem.salem@company.com',
          managerId: 'emp_8',
          level: 3
        }
      ]
    }
  ]
};

// ============================================
// 🚀 WORKFLOW ROUTING ENGINE
// ============================================

/**
 * Workflow Routing Engine
 * Resolves organizational roles and provides routing logic
 */
export class WorkflowRoutingEngine {
  constructor(orgStructure) {
    this.org = orgStructure;
  }

  /**
   * Get all employees in the organization
   * @returns {Array} All employees including CEO and managers
   */
  getAllEmployees() {
    const employees = [this.org.ceo];
    this.org.departments.forEach(dept => {
      employees.push(dept.manager);
      employees.push(...dept.employees);
    });
    return employees;
  }

  /**
   * Find employee by ID
   * @param {string} empId - Employee ID
   * @returns {Object|null} Employee object or null
   */
  findEmployee(empId) {
    return this.getAllEmployees().find(emp => emp.id === empId);
  }

  /**
   * Get direct manager of an employee
   * @param {string} empId - Employee ID
   * @returns {Object|null} Manager object or null (CEO has no manager)
   */
  getDirectManager(empId) {
    const employee = this.findEmployee(empId);
    if (!employee) return null;
    
    // CEO has no manager
    if (empId === this.org.ceo.id) return null;
    
    // Check if employee is a department manager
    const isDeptManager = this.org.departments.some(dept => dept.manager.id === empId);
    if (isDeptManager) return this.org.ceo;
    
    // Find employee's department and return its manager
    for (const dept of this.org.departments) {
      const emp = dept.employees.find(e => e.id === empId);
      if (emp) return dept.manager;
    }
    
    return null;
  }

  /**
   * Get employee's department
   * @param {string} empId - Employee ID
   * @returns {Object|null} Department object or null
   */
  getEmployeeDepartment(empId) {
    if (empId === this.org.ceo.id) return null;
    
    for (const dept of this.org.departments) {
      if (dept.manager.id === empId) return dept;
      if (dept.employees.some(e => e.id === empId)) return dept;
    }
    return null;
  }

  /**
   * Get equivalent managers (same level, different departments)
   * @param {string} empId - Employee ID
   * @returns {Array} Array of equivalent managers
   */
  getEquivalentManagers(empId) {
    const employee = this.findEmployee(empId);
    if (!employee) return [];
    
    // Only department managers have equivalents
    const isDeptManager = this.org.departments.some(dept => dept.manager.id === empId);
    if (isDeptManager) {
      return this.org.departments
        .filter(dept => dept.manager.id !== empId)
        .map(dept => dept.manager);
    }
    
    return [];
  }

  /**
   * Get direct subordinates of an employee
   * @param {string} empId - Employee ID
   * @returns {Array} Array of subordinates
   */
  getSubordinates(empId) {
    // CEO's subordinates are department managers
    if (empId === this.org.ceo.id) {
      return this.org.departments.map(dept => dept.manager);
    }
    
    // Department manager's subordinates are their employees
    for (const dept of this.org.departments) {
      if (dept.manager.id === empId) {
        return dept.employees;
      }
    }
    
    return [];
  }

  /**
   * Get all possible ad-hoc recipients (excluding current user)
   * @param {string} currentUserId - Current user ID
   * @returns {Array} Array of available recipients
   */
  getAdhocRecipients(currentUserId) {
    return this.getAllEmployees().filter(emp => emp.id !== currentUserId);
  }

  /**
   * Get next recipient for hierarchical routing
   * @param {string} currentUserId - Current user ID
   * @param {string} action - Action type ('approve', 'forward', 'reject', 'delegate')
   * @returns {Object|null} Next recipient or null
   */
  getHierarchicalNext(currentUserId, action) {
    if (action === 'approve' || action === 'forward') {
      return this.getDirectManager(currentUserId);
    } else if (action === 'reject') {
      return null; // Reject returns to sender (handled elsewhere)
    } else if (action === 'delegate') {
      return this.getEquivalentManagers(currentUserId);
    }
  }

  /**
   * Resolve workflow role to actual employee(s)
   * @param {string} role - Role ID (direct_manager, ceo, hr_manager, etc.)
   * @param {string} contextUserId - Context user ID (for relative roles)
   * @returns {Object|Array|null} Employee object, array of employees, or null
   */
  resolveWorkflowRole(role, contextUserId) {
    switch (role) {
      case 'direct_manager':
        return this.getDirectManager(contextUserId);
      
      case 'department_manager':
        const dept = this.getEmployeeDepartment(contextUserId);
        return dept ? dept.manager : null;
      
      case 'ceo':
        return this.org.ceo;
      
      case 'hr_manager':
        return this.org.departments.find(d => d.id === 'dept_hr')?.manager;
      
      case 'finance_manager':
        return this.org.departments.find(d => d.id === 'dept_finance')?.manager;
      
      case 'it_manager':
        return this.org.departments.find(d => d.id === 'dept_it')?.manager;
      
      case 'equivalent_managers':
        return this.getEquivalentManagers(contextUserId);
      
      default:
        return null;
    }
  }
}

// ============================================
// 🎁 ORG PROVIDER COMPONENT
// ============================================

/**
 * Organizational Context Provider
 * Provides org structure and routing engine to entire app
 * 
 * @component
 */
export function OrgProvider({ children }) {
  const [orgStructure, setOrgStructure] = useState(initialOrgStructure);
  
  // Create routing engine instance
  const routingEngine = new WorkflowRoutingEngine(orgStructure);
  
  const value = {
    orgStructure,
    setOrgStructure,
    routingEngine
  };
  
  return (
    <OrgContext.Provider value={value}>
      {children}
    </OrgContext.Provider>
  );
}

export default OrgContext;