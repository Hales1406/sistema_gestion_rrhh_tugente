
import { Role, EmployeeStatus, PermissionType, PermissionStatus, Priority } from '@prisma/client';

// Tipos para el usuario autenticado
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: Role;
}

// Tipos para empleados
export interface EmployeeData {
  id: string;
  userId?: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position: string;
  departmentId: string;
  hireDate: Date;
  baseSalary: number;
  status: EmployeeStatus;
  deactivatedAt?: Date;
  department: {
    id: string;
    name: string;
    manager?: string;
    location?: string;
  };
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// Tipos para departamentos
export interface DepartmentData {
  id: string;
  name: string;
  manager?: string;
  location?: string;
  budget?: number;
  employeeCount?: number;
}

// Tipos para registros de tiempo
export interface TimeRecordData {
  id: string;
  employeeId: string;
  date: Date;
  checkIn?: Date;
  checkOut?: Date;
  hoursWorked?: number;
  notes?: string;
  employee: {
    firstName: string;
    lastName: string;
    employeeId: string;
  };
}

// Tipos para solicitudes de permisos
export interface PermissionRequestData {
  id: string;
  employeeId: string;
  type: PermissionType;
  startDate: Date;
  endDate: Date;
  days: number;
  reason: string;
  status: PermissionStatus;
  adminNotes?: string;
  createdAt: Date;
  employee: {
    firstName: string;
    lastName: string;
    employeeId: string;
  };
}

// Tipos para registros salariales
export interface SalaryRecordData {
  id: string;
  employeeId: string;
  month: number;
  year: number;
  baseSalary: number;
  bonus: number;
  deductions: number;
  hoursWorked: number;
  totalSalary: number;
  isPaid: boolean;
  employee: {
    firstName: string;
    lastName: string;
    employeeId: string;
  };
}

// Tipos para noticias
export interface NewsData {
  id: string;
  title: string;
  content: string;
  priority: Priority;
  isActive: boolean;
  createdAt: Date;
}

// Tipos para configuración de empresa
export interface CompanySettingsData {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  workingHoursStart: string;
  workingHoursEnd: string;
  vacationDaysYear: number;
}

// Tipos para estadísticas del dashboard
export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  totalDepartments: number;
  pendingPermissions: number;
  todayCheckedIn: number;
}

// Tipos para formularios
export interface CreateEmployeeForm {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position: string;
  departmentId: string;
  hireDate: Date;
  baseSalary: number;
}

export interface CreateDepartmentForm {
  name: string;
  manager?: string;
  location?: string;
  budget?: number;
}

export interface CreatePermissionRequestForm {
  type: PermissionType;
  startDate: Date;
  endDate: Date;
  reason: string;
}

export interface UpdatePermissionStatusForm {
  status: PermissionStatus;
  adminNotes?: string;
}
